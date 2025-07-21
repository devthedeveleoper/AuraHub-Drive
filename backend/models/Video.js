const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VideoSchema = new Schema({
  uploader: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  // This will store the ID for both local and completed remote uploads
  streamtapeFileId: {
    type: String,
  },
  // This is for tracking the remote upload before it's complete
  remoteUploadId: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  // Add a status field to track the video's state
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'completed', // Local uploads are considered complete immediately
  },
  views: {
    type: Number,
    default: 0,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('video', VideoSchema);