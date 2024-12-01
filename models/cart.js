const mongoose = require('mongoose')
const CartSchema = new mongoose.Schema(
  {
    inventoryId: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
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
const Cart = mongoose.model('Cart', CartSchema)
module.exports = Cart
