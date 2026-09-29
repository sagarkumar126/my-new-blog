const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postschema = new Schema({
  title: {
    type: String,
    required: true
  },
  Body: {
    type: String,
    required: true
  },
  author: { type: mongoose.Schema.Types.ObjectId,
     ref: 'User', required: true },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', postschema);




