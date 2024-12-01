const session = require('express-session')
const Inventory = require('../models/inventory')
const User = require('../models/user')
const Cart = require('../models/cart')
const { cache } = require('ejs')

exports.homepage = async (req, res) => {
  const messages = await req.flash('info')

  const locals = {
    title: 'Inventory',
    description: 'Welcome to Inventory Management System'
  }

  const perPage = 8
  const page = parseInt(req.query.page) || 1

  try {
    const inventory = await Inventory.find({})
      .sort({ updatedAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)

    const count = await Inventory.countDocuments({})

    let rank1 = null
    if (req.session.user) {
      rank1 = req.session.user.rank ? 'Admin' : 'Member'
    }

    const inventoryQuantities = await Cart.aggregate([
      {
        $match: {
          inventoryId: { $in: inventory.map((item) => item._id.toString()) }
        }
      },
      {
        $group: {
          _id: { inventoryId: '$inventoryId', status: '$status' },
          total: { $sum: '$quantity' }
        }
      }
    ])

    const totalQuantity = {}
    inventoryQuantities.forEach(({ _id, total }) => {
      const inventoryId = _id.inventoryId
      const status = _id.status
      if (!totalQuantity[inventoryId]) {
        totalQuantity[inventoryId] = { Purchased: 0, Completed: 0, Returned: 0 }
      }
      totalQuantity[inventoryId][status] += total
    })

    for (let item of inventory) {
      const purchased = totalQuantity[item._id]?.Purchased || 0
      const completed = totalQuantity[item._id]?.Completed || 0
      const returned = totalQuantity[item._id]?.Returned || 0
      totalQuantity[item._id] = {
        purchased,
        completed,
        returned,
        available: purchased - completed
      }
    }

    res.render('index', {
      locals,
      inventory,
      current: page,
      pages: Math.ceil(count / perPage),
      messages,
      rank1,
      totalQuantity
    })
  } catch (error) {
    console.error('Error fetching inventory:', error)
    res.render('index', {
      locals,
      inventory: [],
      messages: ['An error occurred while fetching inventory.'],
      rank1: null
    })
  }
}

exports.edit = async (req, res) => {
  try {
    const currentInventory = await Inventory.findById(req.params.inventoryId)
    if (!currentInventory) {
      await req.flash('info', 'Inventory item not found.')
      return res.redirect('/')
    }
    res.render('inventory/edit', { inventory: currentInventory })
  } catch (error) {
    console.error('Error fetching inventory for editing:', error)
    res.redirect('/')
  }
}

exports.update = async (req, res) => {
  try {
    await Inventory.findByIdAndUpdate(req.params.inventoryId, req.body, {
      new: true
    })
    await req.flash('info', 'Inventory updated successfully.')
    res.redirect('/')
  } catch (error) {
    console.error('Error updating inventory:', error)
    res.redirect('/')
  }
}

exports.deleteById = async (req, res) => {
  try {
    const deletedInventory = await Inventory.findByIdAndDelete(
      req.params.inventoryId
    )
    if (!deletedInventory) {
      await req.flash('info', 'Inventory item not found.')
      return res.redirect('/')
    }
    await req.flash('info', 'Inventory item deleted.')
    res.redirect('/')
  } catch (error) {
    console.error('Error deleting inventory:', error)
    res.redirect('/')
  }
}

exports.add = async (req, res) => {
  res.render('inventory/add')
}

exports.createInventory = async (req, res) => {
  try {
    const inventory = await Inventory.create(req.body)
    await req.flash('info', `Inventory added: ${inventory.name}`)
    res.redirect('/')
  } catch (error) {
    console.error('Error creating inventory:', error)
    res.redirect('/inventory/add')
  }
}

exports.viewInventory = async (req, res, next) => {
  try {
    const currentInventory = await Inventory.findById(req.params.inventoryId)
    res.render('inventory/view', { currentInventory })
  } catch (err) {
    next(err)
  }
}

exports.SearchInventory = async (req, res) => {
  const locals = {
    title: 'Search Inventory',
    description: 'Welcome to Inventory Management System'
  }

  try {
    let rank1 = null
    if (req.session.user) {
      if (req.session.user.rank === true) {
        rank1 = 'Admin'
      } else {
        rank1 = 'member'
      }
    }
    let searchTerm = req.body.searchTerm || ''
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, '')

    const inventories = await Inventory.find({
      $or: [
        { category: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
        { name: { $regex: new RegExp(searchNoSpecialChar, 'i') } }
      ]
    })
    res.locals.search = 1
    res.render('inventory/search', { inventories, locals, rank1 })
  } catch (error) {
    console.error('Error in SearchInventory:', error)
    res.render('inventory/search', {
      inventories: [],
      locals,
      error: 'An error occurred while searching. Please try again later.'
    })
  }
}
