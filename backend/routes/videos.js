const express = require('express');
const router = express.Router();
const axios = require('axios');
const Video = require('../models/Video'); // Your Video model
const User = require('../models/User'); // Your User model
const redisClient = require('../config/redisClient');

// Middleware to ensure user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ msg: 'You are not authorized to view this resource' });
};

// Helper function to clear a specific folder's cache in Redis
const clearFolderCache = async (folderId) => {
    if (!folderId) return;
    const cacheKey = `folder:${folderId}`;
    await redisClient.del(cacheKey);
    console.log(`[REDIS] CACHE CLEARED for ${cacheKey}`);
};

// --- Route 1: Get an Upload URL from FastAPI service ---
router.post('/get-upload-url', isAuthenticated, async (req, res) => {
  try {
    let { folderId } = req.body; // Get folderId from the request body

    // If no folderId is provided by the client, default to the user's root folder
    if (!folderId) {
      const user = await User.findById(req.user.id);
      if (!user || !user.streamtapeFolderId) {
        return res.status(404).json({ msg: 'User root folder not found.' });
      }
      folderId = user.streamtapeFolderId;
    }

    const response = await axios.get('https://api.aurahub.fun/v1/get_upload_url', {
      params: { folder: folderId }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching upload URL:', error.response ? error.response.data : error.message);
    res.status(500).json({ msg: 'Server error while getting upload URL.' });
  }
});

// --- Route 2: Save Video Metadata to MongoDB ---
router.post('/save-video-metadata', isAuthenticated, async (req, res) => {
  const { title, description, streamtapeFileId } = req.body;

  if (!title || !streamtapeFileId) {
    return res.status(400).json({ msg: 'Missing title or file ID.' });
  }

  try {
    const newVideo = new Video({
      uploader: req.user.id, // The logged-in user's ID from Passport session
      title,
      description,
      streamtapeFileId,
    });

    await newVideo.save();
    res.status(201).json({ msg: 'Video metadata saved successfully!', video: newVideo });
  } catch (error) {
    console.error('Error saving video metadata:', error);
    res.status(500).json({ msg: 'Server error while saving video metadata.' });
  }
});

// --- Route 3: Handle Remote URL Upload (Now saves metadata) ---
router.post('/remote-upload', isAuthenticated, async (req, res) => {
    // Now we correctly receive the folderId from the frontend request
    const { url: videoUrl, title, description, folderId } = req.body;

    if (!videoUrl || !title) {
        return res.status(400).json({ msg: 'Missing video URL or title.' });
    }

    try {
        let targetFolderId = folderId;

        // If no folderId was provided from the frontend, default to the user's root folder
        if (!targetFolderId) {
            const user = await User.findById(req.user.id);
            if (!user || !user.streamtapeFolderId) {
                return res.status(404).json({ msg: 'User root folder not found.' });
            }
            targetFolderId = user.streamtapeFolderId;
        }

        // Initiate the remote upload with the FastAPI service, passing the correct folder ID
        const remoteUploadResponse = await axios.post(
            'https://api.aurahub.fun/v1/remote_upload/add',
            null,
            { params: { url: videoUrl, folder: targetFolderId } } // Use targetFolderId here
        );
        
        const remoteUploadId = remoteUploadResponse.data.id;
        if (!remoteUploadId) {
            return res.status(500).json({ msg: 'Failed to get a remote upload ID.' });
        }

        // Create a new video document in our database to track it
        const newVideo = new Video({
            uploader: req.user.id,
            title,
            description,
            remoteUploadId: remoteUploadId,
            status: 'processing',
        });
        await newVideo.save();
        
        // Clear the cache for the folder where the upload was initiated
        await clearFolderCache(targetFolderId);

        res.status(202).json({ 
            msg: 'Remote upload initiated and is now being tracked!',
            video: newVideo 
        });

    } catch (error) {
        console.error('Error initiating remote upload:', error.response ? error.response.data : error.message);
        res.status(500).json({ msg: 'Server error while initiating remote upload.' });
    }
});

// --- CHECK REMOTE UPLOAD STATUS (WITH DETAILED LOGGING) ---
router.get('/remote-upload/status/:id', isAuthenticated, async (req, res) => {
  const { id: remoteUploadId } = req.params;

  try {
    const statusResponse = await axios.get(`https://api.aurahub.fun/v1/remote_upload/status/${remoteUploadId}`);
    const uploadData = statusResponse.data[remoteUploadId];

    if (!uploadData) {
      return res.status(404).json({ msg: 'Upload status not found.' });
    }

    if (uploadData.status === 'finished') {
      
      try {
        const video = await Video.findOneAndUpdate(
          { remoteUploadId: remoteUploadId },
          { 
            status: 'completed',
            streamtapeFileId: uploadData.linkid,
          },
          { new: true }
        );

        if (video) {
          return res.json({ status: 'completed', video: video });
        } else {
          console.error(`[ERROR] CRITICAL: Could not find a video in the DB with remoteUploadId: ${remoteUploadId}`);
          return res.status(404).json({ msg: 'DB record not found for this remote upload ID.' });
        }
      } catch (dbError) {
        console.error('[ERROR] A database error occurred during findOneAndUpdate:', dbError);
        return res.status(500).json({ msg: 'Database update failed.' });
      }
    }

    // If status is not 'finished', just send back the current status
    res.json({ status: uploadData.status, details: uploadData });

  } catch (error) {
    console.error('[ERROR] An API error occurred while checking status:', error.message);
    res.status(500).json({ msg: 'Server error while checking status.' });
  }
});

// --- Route 5: Remove/Cancel a Remote Upload ---
router.delete('/remote-upload/remove/:id', isAuthenticated, async (req, res) => {
    const { id: remoteUploadId } = req.params;

    try {
        // 1. Tell the FastAPI service to remove the upload
        await axios.delete(`https://api.aurahub.fun/v1/remote_upload/remove/${remoteUploadId}`);

        // 2. Delete the corresponding video record from our database
        await Video.findOneAndDelete({ remoteUploadId: remoteUploadId });

        res.json({ msg: 'Remote upload successfully removed.' });

    } catch (error) {
        console.error('Error removing remote upload:', error.response ? error.response.data : error.message);
        res.status(500).json({ msg: 'Server error while removing upload.' });
    }
});

// --- Route 6: Get all videos for the logged-in user ---
router.get('/my-videos', isAuthenticated, async (req, res) => {
    try {
        const videos = await Video.find({ uploader: req.user.id }).sort({ uploadDate: -1 });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ msg: 'Server error while fetching videos.' });
    }
});

module.exports = router;