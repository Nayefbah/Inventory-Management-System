const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

exports.signup = (req, res) => {
  const locals = {
    title: 'Sign Up',
    description: 'New User Registration'
  }
  res.render('auth/sign-up.ejs', locals)
}

exports.signup_post = async (req, res) => {
  if (req.body.rank === 'on') {
    req.body.rank = true
  } else {
    req.body.rank = false
  }
  const info = {
    name: req.body.Name,
    email: req.body.email,
    tel: req.body.tel,
    username: req.body.username,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    rank: req.body.rank
  }

  const userInDatabase = await User.findOne({ username: info.username })
  if (userInDatabase) {
    return res.send('Username already taken')
  }

  if (info.password !== info.confirmPassword) {
    return res.send('Password and Confirm Password must match')
  }
  console.log(info)

  const hashedPassword = bcrypt.hashSync(info.password, 10)
  info.password = hashedPassword

  const user = await User.create(info)
  res.send(`Thanks for signing up ${user.username}`)
}

exports.signin = (req, res) => {
  const locals = {
    title: 'Sign In',
    description: 'User Signin Page'
  }
  res.render('auth/sign-in.ejs', locals)
}

exports.signin_post = async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username })
    if (!userInDatabase) {
      return res.send('Login failed. Please try again.')
    }
    const validPassword = bcrypt.compareSync(
      req.body.password,
      userInDatabase.password
    )
    if (!validPassword) {
      return res.send('Login failed. Please try again.')
    }

    req.session.user = {
      name: userInDatabase.name,
      _id: userInDatabase._id,
      rank: userInDatabase.rank
    }
    req.session.message = 'User logged in successfully'
    res.redirect('/')
  } catch (err) {
    console.log(err)
    req.session.message = 'Please try again later'
  }
}

exports.signout = (req, res) => {
  req.session.destroy()
  res.redirect('/')
}

exports.UsersInformation = async (req, res) => {
  const messages = await req.flash('info')

  const locals = {
    title: 'Users',
    description: 'Welcome to Inventory Management System'
  }

  const perPage = 12
  const page = parseInt(req.query.page) || 1

  try {
    const rank = req.session?.user?.rank || null
    const userId = req.session?.user?._id || null
    let rank1 = null
    let query = {}
    if (rank !== true) {
      query = { _id: userId }
      rank1 = 'Member'
    } else {
      rank1 = 'Admin'
    }
    const user = await User.find(query)
      .sort({ updatedAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)

    const count = await User.countDocuments(query)
    res.locals.search = 3
    res.render('auth/usersInfo', {
      locals,
      user,
      current: page,
      pages: Math.ceil(count / perPage),
      messages,
      rank1
    })
  } catch (error) {
    console.error('Error fetching Users:', error)
    res.render('/', {
      locals,
      inventory: [],
      messages: ['An error occurred while fetching User.']
    })
  }
}
exports.viewUser = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.params.userId)
    res.render('auth/viewUser', { currentUser })
  } catch (err) {
    next(err)
  }
}
exports.editUser = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.params.userId)

    const rank = req.session?.user?.rank || null
    let rank1 = null
    if (rank !== true) {
      rank1 = 'Member'
    } else {
      rank1 = 'Admin'
    }

    res.render('auth/editUser', { currentUser, rank1 })
  } catch (err) {
    next(err)
  }
}

exports.updateUser = async (req, res) => {
  try {
    const isRankValid = req.body.rank === 'on'
    const updateData = {
      name: req.body.name?.trim(),
      email: req.body.email?.trim(),
      tel: req.body.tel?.trim(),
      username: req.body.username?.trim(),
      rank: isRankValid
    }

    if (req.body.password || req.body.confirmPassword) {
      if (req.body.password === req.body.confirmPassword) {
        const salt = await bcrypt.genSalt(10)
        updateData.password = await bcrypt.hash(req.body.password, salt)
      } else {
        req.flash('info', 'Passwords do not match.')
        return res.redirect(`/auth/usersinfo`)
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      updateData,
      {
        new: true,
        runValidators: true
      }
    )

    req.flash('info', `User ${updatedUser.name} updated successfully.`)
    res.redirect('/auth/usersinfo')
  } catch (error) {
    console.error('Error updating user:', error)
    req.flash('error', 'An error occurred while updating the user.')
    res.redirect(`/auth/editUser/${req.params.userId}`)
  }
}
exports.Search = async (req, res) => {
  const locals = {
    title: 'Search Users',
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
    if (rank1 === 'admin') {
      let searchTerm = req.body.searchTerm || ''
      const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, '')

      const user = await User.find({
        $or: [
          { name: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
          { email: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
          { tel: { $regex: new RegExp(searchNoSpecialChar, 'i') } }
        ]
      })

      res.locals.search = 3
      res.render('auth/search', { user, locals, rank1 })
    } else {
      res.redirect('/auth/usersInfo')
    }
  } catch (error) {
    console.error('Error in SearchInventory:', error)
    res.render('auth/search', {
      inventories: [],
      locals,
      error: 'An error occurred while searching. Please try again later.'
    })
  }
}
