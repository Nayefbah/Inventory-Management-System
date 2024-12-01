const express = require('express')
const router = express.Router()

const cartCtrl = require('../controllers/cart')

router.get('/:inventoryId/bookItem', cartCtrl.orders)
router.get('/:inventoryId/purchasedItem', cartCtrl.purchase)
router.post('/addToCart', cartCtrl.createCart)
router.post('/addPurchase', cartCtrl.createPurchase)
router.delete('/itemStatus/:cartId', cartCtrl.deleteById)
router.get('/itemStatus', cartCtrl.cartStatus)
router.post('/itemStatus/:cartId/complete', cartCtrl.updateToComplete)
router.post('/itemStatus/:cartId/cancel', cartCtrl.updateToCancel)
router.get('/updateOrder/:cartId/edit', cartCtrl.GetToUpdateOrder)
router.put('/updateOrder/:cartId/', cartCtrl.UpdateOrder)
router.get('/return/:cartId', cartCtrl.return)
router.post('/return/:cartId', cartCtrl.createReturn)
module.exports = router
