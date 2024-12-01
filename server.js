const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const expressLayout = require('express-ejs-layouts')
const session = require('express-session')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const { default: mongoose } = require('mongoose')
const morgan = require('morgan')
const path = require('path')
const app = express()
const isSignedIn = require('./middleware/is-signed-in')
const passUserToView = require('./middleware/pass-user-to-view')
const authRouter = require('./routes/auth')
const inventoryRouter = require('./routes/inventory')
const cartRouter = require('./routes/cart')
const port = process.env.PORT ? process.env.PORT : '3000'

mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}`)
})
app.set('layout', './layouts/main')
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))
app.use(morgan('dev'))
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
)
app.use(flash())
app.use(passUserToView)
app.use(express.json())

app.use(express.static('public'))
app.use(expressLayout)
app.use((req, res, next) => {
  res.locals.search = 1
  next()
})

app.use('/styles', express.static(path.join(__dirname, 'styles')))

app.use((req, res, next) => {
  res.locals.user = req.session.user || null
  next()
})

app.use('/', inventoryRouter)
app.use('/auth', authRouter)
app.use('/cart', cartRouter)

app.get('*', (req, res) => {
  res.status(404).render('404')
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
