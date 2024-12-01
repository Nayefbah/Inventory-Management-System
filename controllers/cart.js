const session = require('express-session')
const Inventory = require('../models/inventory')
const User = require('../models/user')
const Cart = require('../models/cart')
const { render } = require('ejs')

exports.orders = async (req, res, next) => {
  try {
    const currentInventory = await Inventory.findById(req.params.inventoryId)
    req.session.inventoryId = req.params.inventoryId
    res.render('cart/bookItem', { currentInventory })
  } catch (err) {
    next(err)
  }
}
exports.purchase = async (req, res, next) => {
  try {
    const currentInventory = await Inventory.findById(req.params.inventoryId)
    req.session.inventoryId = req.params.inventoryId
    res.render('cart/PurchasedItem', { currentInventory })
  } catch (err) {
    next(err)
  }
}

exports.createCart = async (req, res) => {
  try {
    const cart = {
      inventoryId: req.session.inventoryId,
      userId: req.session.user._id,
      status: 'Pending',
      quantity: req.body.quantity
    }
    await Cart.create(cart)
    await req.flash('info', `Item added to your cart`)
    res.redirect('/')
  } catch (error) {
    console.error('Error creating inventory:', error)
    res.redirect('/')
  }
}

exports.createPurchase = async (req, res) => {
  try {
    const cart = {
      inventoryId: req.session.inventoryId,
      userId: req.session.user._id,
      status: 'Purchased',
      quantity: req.body.quantity
    }

    await Cart.create(cart)
    await req.flash('info', `Item was Purchased and added to inventory`)
    res.redirect('/')
  } catch (error) {
    console.error('Error creating inventory:', error)
    res.redirect('/')
  }
}

exports.cartStatus = async (req, res) => {
  const messages = await req.flash('info')

  const locals = {
    title: 'User Cart',
    description: 'Welcome to Inventory Management System'
  }

  const perPage = 6
  const page = parseInt(req.query.page) || 1

  const status = req.query.status || ''
  const startDate = req.query.startDate || ''
  const endDate = req.query.endDate || ''

  let filter = {}
  if (status) {
    filter.status = status
  }
  if (startDate) {
    filter.updatedAt = { $gte: new Date(startDate) }
  }
  if (endDate) {
    if (!filter.updatedAt) filter.updatedAt = {}
    filter.updatedAt.$lte = new Date(endDate)
  }

  try {
    const rank1 = req.session.user.rank ? 'Admin' : 'Member'

    let cartOption = {}
    if (rank1 === 'Member') {
      cartOption = { userId: req.session.user._id }
    }

    const queryConditions = { $and: [filter, cartOption] }

    const carts = await Cart.find(queryConditions)
      .sort({ updatedAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)

    const inventories = await Inventory.find({})
    let users
    if (rank1 === 'Admin') {
      users = await User.find({})
    } else {
      users = await User.find({ _id: req.session.user._id })
    }

    const count = await Cart.countDocuments(queryConditions)

    const Data = carts.map((cart) => {
      const inventory = inventories.find(
        (item) => item._id.toString() === cart.inventoryId
      )
      const user = users.find((usr) => usr._id.toString() === cart.userId)

      return {
        category: inventory ? inventory.category : 'Unknown',
        name: inventory ? inventory.name : 'Unknown',
        userName: user ? user.name : 'Unknown',
        quantity: cart.quantity,
        status: cart.status,
        orderDate: cart.createdAt.toISOString().split('T')[0],
        finalStatusDate: cart.updatedAt.toISOString().split('T')[0],
        _id: cart._id
      }
    })
    res.locals.search = 2
    res.render('cart/itemStatus', {
      locals,
      current: page,
      pages: Math.ceil(count / perPage),
      messages,
      rank1,
      Data,
      status,
      startDate,
      endDate
    })
  } catch (error) {
    console.error('Error fetching cart status:', error)
    res.redirect('/')
  }
}
exports.deleteById = async (req, res) => {
  try {
    const deletedCart = await Cart.findByIdAndDelete(req.params.cartId)

    if (!deletedCart) {
      await req.flash('info', 'Cart item not found.')
      return res.redirect('/cart/itemStatus')
    }
    await req.flash('info', 'Cart item deleted.')
    res.redirect('/cart/itemStatus')
  } catch (error) {
    console.error('Error deleting Cart:', error)
    res.redirect('/')
  }
}
exports.updateToComplete = async (req, res) => {
  try {
    await Cart.findByIdAndUpdate(
      req.params.cartId,
      { $set: { status: 'Completed' } },
      {
        new: true
      }
    )
    await req.flash('info', 'Selected Item Status Updated to Completed.')
    res.redirect('/cart/itemStatus')
  } catch (error) {
    console.error('Error updating Cart:', error)
    res.redirect('/')
  }
}
exports.updateToCancel = async (req, res) => {
  try {
    await Cart.findByIdAndUpdate(
      req.params.cartId,
      { $set: { status: 'Canceled' } },
      {
        new: true
      }
    )
    await req.flash('info', 'Selected Item Status Updated to Canceled.')
    res.redirect('/cart/itemStatus')
  } catch (error) {
    console.error('Error updating Cart:', error)
    res.redirect('/')
  }
}
exports.GetToUpdateOrder = async (req, res) => {
  const locals = {
    title: 'Update Order',
    description: 'Welcome to Inventory Management System'
  }
  try {
    const cart = await Cart.findById(req.params.cartId)
    const currentInventory = await Inventory.findById(cart.inventoryId)
    res.render('cart/updateOrder', { cart, currentInventory, locals })
  } catch (err) {
    next(err)
  }
}
exports.UpdateOrder = async (req, res) => {
  try {
    await Cart.findByIdAndUpdate(
      req.params.cartId,
      { $set: { quantity: req.body.quantity } },
      {
        new: true
      }
    )
    await req.flash('info', 'Order Updated.')
    res.redirect('/cart/itemStatus')
  } catch (error) {
    console.error('Error updating Cart:', error)
    res.redirect('/')
  }
}

exports.return = async (req, res) => {
  const locals = {
    title: 'Return Order',
    description: 'Welcome to Inventory Management System'
  }
  try {
    const cart = await Cart.findById(req.params.cartId)
    const currentInventory = await Inventory.findById(cart.inventoryId)
    req.session.inventoryId = cart.inventoryId
    res.render('cart/return', { cart, currentInventory, locals })
  } catch (err) {
    next(err)
  }
}

exports.createReturn = async (req, res) => {
  try {
    const originalCart = await Cart.findById(req.params.cartId)

    if (!originalCart) {
      req.flash('error', 'Cart entry not found.')
      return res.redirect('/cart/return')
    }

    if (originalCart.quantity < req.body.quantity) {
      req.flash('error', 'Returned quantity exceeds items in the cart.')
      return res.redirect('/cart/return')
    }

    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.cartId,
      { $set: { quantity: originalCart.quantity - req.body.quantity } },
      { new: true }
    )

    const returnCart = {
      inventoryId: req.session.inventoryId,
      userId: originalCart.userId,
      status: 'Returned',
      quantity: req.body.quantity
    }

    await Cart.create(returnCart)

    await req.flash('info', `Item was returned and added to inventory.`)
    res.redirect('/cart/itemStatus')
  } catch (error) {
    console.error('Error creating return:', error)
    req.flash('error', 'Error processing return.')
    res.redirect('/')
  }
}
