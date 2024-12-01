const express = require('express')
const router = express.Router()
const inventoryCtrl = require('../controllers/inventory')
const Inventory = require('../models/inventory')

router.get('/', inventoryCtrl.homepage)
router.get('/add', inventoryCtrl.add)
router.post('/add', inventoryCtrl.createInventory)
router.get('/:inventoryId/edit', inventoryCtrl.edit)
router.put('/:inventoryId', inventoryCtrl.update)
router.delete('/:inventoryId', inventoryCtrl.deleteById)
router.get('/:inventoryId/view', inventoryCtrl.viewInventory)
router.post('/Search', inventoryCtrl.SearchInventory)
module.exports = router
