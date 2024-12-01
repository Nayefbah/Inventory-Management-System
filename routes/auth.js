const express = require('express')
const router = express.Router()

const authCtrl = require('../controllers/auth')

router.get('/sign-up', authCtrl.signup)
router.post('/sign-up', authCtrl.signup_post)

router.get('/sign-in', authCtrl.signin)
router.post('/sign-in', authCtrl.signin_post)

router.get('/sign-out', authCtrl.signout)
router.get('/usersInfo', authCtrl.UsersInformation)

router.get('/:userId/viewUser', authCtrl.viewUser)
router.get('/:userId/editUser', authCtrl.editUser)
router.put('/:userId', authCtrl.updateUser)
router.post('/search', authCtrl.Search)
module.exports = router
