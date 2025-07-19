const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VideoSchema = new Schema({
  uploader: {
    type: Schema.Types.ObjectId, // A reference to the User who uploaded it
    ref: 'user',
    required: true,
  },
  streamtapeFileId: { // The ID from your FastAPI service
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
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