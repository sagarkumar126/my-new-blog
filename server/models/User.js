const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user_schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model('User', user_schema);




