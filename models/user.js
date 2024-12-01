const mongoose = require('mongoose')
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    tel: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true,
      minlength: [3, 'Name must be more than 3 Charceters'],
      maxlength: [10, 'This is too much man']
    },
    password: {
      type: String,
      required: true
    },
    rank: {
      type: Boolean
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  },
  {
    timestamps: true
  }
)
const User = mongoose.model('User', userSchema)
module.exports = User
