const mongoose = require('mongoose')
const inventorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    size: {
      type: String
    },
    quantity: {
      type: Number
    },
    details: {
      type: String
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
const Inventory = mongoose.model('Inventory', inventorySchema)
module.exports = Inventory
