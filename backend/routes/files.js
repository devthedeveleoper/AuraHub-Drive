const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const Video = require('../models/Video');
const redisClient = require('../config/redisClient');

// --- Middleware & Helper Functions ---

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ msg: 'You are not authorized' });
};

const clearFolderCache = async (folderId) => {
    if (!folderId) return;
    const cacheKey = `folder:${folderId}`;
    await redisClient.del(cacheKey);
    console.log(`[REDIS] CACHE CLEARED for ${cacheKey}`);
};


// --- Read Operations (with Corrected Routes and Caching) ---

// Route for the user's ROOT folder
router.get('/list', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.streamtapeFolderId) {
      return res.status(404).json({ msg: 'User root folder not found.' });
    }
    const folderId = user.streamtapeFolderId;
    const cacheKey = `folder:${folderId}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(`[REDIS] CACHE HIT for root folder: ${cacheKey}`);
      return res.json(JSON.parse(cachedData));
    }

    console.log(`[REDIS] CACHE MISS for root folder: ${cacheKey}. Fetching from API...`);
    const response = await axios.get('https://api.aurahub.fun/v1/file_manager/list_contents', {
      params: { folder_id: folderId },
    });

    await redisClient.set(cacheKey, JSON.stringify(response.data), { EX: 120 });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ msg: 'Server error while listing root contents.' });
  }
});

// Route for a SPECIFIC subfolder
router.get('/list/:folderId', isAuthenticated, async (req, res) => {
  try {
    const { folderId } = req.params;
    const cacheKey = `folder:${folderId}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(`[REDIS] CACHE HIT for subfolder: ${cacheKey}`);
      return res.json(JSON.parse(cachedData));
    }

    console.log(`[REDIS] CACHE MISS for subfolder: ${cacheKey}. Fetching from API...`);
    const response = await axios.get('https://api.aurahub.fun/v1/file_manager/list_contents', {
      params: { folder_id: folderId },
    });

    await redisClient.set(cacheKey, JSON.stringify(response.data), { EX: 120 });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ msg: 'Server error while listing subfolder contents.' });
  }
});


// --- Write/Modify Operations (with Cache Clearing) ---

router.post('/create-folder', isAuthenticated, async (req, res) => {
  const { parentFolderId, folderName } = req.body;
  try {
    const response = await axios.post('https://api.aurahub.fun/v1/file_manager/create_folder', null, {
      params: { parent_folder_id: parentFolderId, name: folderName },
    });
    // If parentFolderId is empty, it means we're in the root, so we need to find the root ID to clear it.
    if (!parentFolderId) {
        const user = await User.findById(req.user.id);
        await clearFolderCache(user.streamtapeFolderId);
    } else {
        await clearFolderCache(parentFolderId);
    }
    res.status(201).json(response.data);
  } catch (error) {
    res.status(500).json({ msg: 'Server error while creating folder.' });
  }
});

// --- RENAME FOLDER (DEFINITIVE FIX) ---
router.put('/rename-folder/:folderId', isAuthenticated, async (req, res) => {
  const { folderId } = req.params;
  const { newName, parentFolderId } = req.body;
  try {
    // Correctly sending a PUT request with the new_name as a URL parameter
    await axios.put(
        `https://api.aurahub.fun/v1/file_manager/rename_folder/${folderId}`,
        null, // The body is null
        {
            params: { // The data is sent as URL query parameters
                new_name: newName
            }
        }
    );
    await clearFolderCache(parentFolderId);
    res.json({ msg: 'Folder renamed successfully.' });
  } catch (error) {
    console.error("Rename folder error:", error.response ? error.response.data : error.message);
    res.status(500).json({ msg: 'Server error while renaming folder.' });
  }
});

router.delete('/delete-folder/:folderId', isAuthenticated, async (req, res) => {
    const { folderId } = req.params;
    const { parentFolderId } = req.body;
    try {
        await axios.delete(`https://api.aurahub.fun/v1/file_manager/delete_folder/${folderId}`);
        await clearFolderCache(parentFolderId);
        res.json({ msg: 'Folder deleted successfully.' });
    } catch (error) {
        res.status(500).json({ msg: 'Server error while deleting folder.' });
    }
});

// --- RENAME FILE (DEFINITIVE FIX) ---
router.put('/rename-file/:fileId', isAuthenticated, async (req, res) => {
    const { fileId } = req.params;
    const { newName, parentFolderId } = req.body; // We still get the newName from the frontend's request body
    try {
        // Correctly sending a PUT request with the new_name as a URL parameter
        await axios.put(
            `https://api.aurahub.fun/v1/file_manager/rename_file/${fileId}`,
             null, // The body sent to the FastAPI service is null
             {
                params: { // The data is sent as URL query parameters
                    new_name: newName
                }
             }
        );
        
        await Video.findOneAndUpdate({ streamtapeFileId: fileId }, { title: newName });
        await clearFolderCache(parentFolderId);
        
        res.json({ msg: 'File renamed successfully.' });
    } catch (error) {
        console.error("Rename file error:", error.response ? error.response.data : error.message);
        res.status(500).json({ msg: 'Server error while renaming file.' });
    }
});

router.put('/move-file/:fileId', isAuthenticated, async (req, res) => {
    const { fileId } = req.params;
    const { originalFolderId, destinationFolderId } = req.body;
    try {
        await axios.put(`https://api.aurahub.fun/v1/file_manager/move_file/${fileId}`, { destination: destinationFolderId });
        await clearFolderCache(originalFolderId);
        await clearFolderCache(destinationFolderId);
        res.json({ msg: 'File moved successfully.' });
    } catch (error) {
        res.status(500).json({ msg: 'Server error while moving file.' });
    }
});

router.delete('/delete-file/:fileId', isAuthenticated, async (req, res) => {
    const { fileId } = req.params;
    const { parentFolderId } = req.body;
    try {
        await axios.delete(`https://api.aurahub.fun/v1/file_manager/delete_file/${fileId}`);
        await Video.findOneAndDelete({ streamtapeFileId: fileId });
        await clearFolderCache(parentFolderId);
        res.json({ msg: 'File deleted successfully.' });
    } catch (error) {
        res.status(500).json({ msg: 'Server error while deleting file.' });
    }
});

// --- GET A FILE'S THUMBNAIL (WITH REDIS CACHING) ---
router.get('/thumbnail/:fileId', isAuthenticated, async (req, res) => {
  try {
    const { fileId } = req.params;
    const cacheKey = `thumbnail:${fileId}`;

    // 1. Check Redis for a cached thumbnail URL
    const cachedUrl = await redisClient.get(cacheKey);
    if (cachedUrl) {
      console.log(`[REDIS] CACHE HIT for thumbnail: ${cacheKey}`);
      return res.json(JSON.parse(cachedUrl));
    }

    console.log(`[REDIS] CACHE MISS for thumbnail: ${cacheKey}. Fetching from API...`);
    // 2. If not in cache, fetch from the API
    const response = await axios.get(`https://api.aurahub.fun/v1/thumbnail/${fileId}`);
    
    // 3. Store the new URL in Redis with an expiration of 1 hour (3600 seconds)
    await redisClient.set(cacheKey, JSON.stringify(response.data), {
      EX: 3600,
    });

    res.json(response.data);

  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ msg: 'Thumbnail not available yet.' });
    }
    res.status(500).json({ msg: 'Server error while fetching thumbnail.' });
  }
});

module.exports = router;