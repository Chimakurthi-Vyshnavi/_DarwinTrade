const express = require('express')
const cors = require('cors')
const app = express()
const http = require('http');
const { Server } = require('socket.io');
const mongoDB = require('./db')
const cookieParser = require('cookie-parser')
const session = require('express-session')
require('dotenv').config();

const authRoutes = require('./routes/authRoutes')
const shopRoutes = require('./routes/shopRoutes')
const cartRoutes = require('./routes/cartRoutes')
const checkoutRoutes = require('./routes/checkoutRoutes')
const adminRoutes = require('./routes/adminRoutes')
const vendorRoutes = require('./routes/vendorRoutes')
const { requireAuth, checkEmployee } = require('./miiddleware/authMiddleware')
const indexControllers = require('./controllers/indexControllers')
const ProductSchema = require('./models/Product')

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const io = new Server(server)

server.listen(PORT, () => console.log('started at 5000'))
io.on('connection', (socket) => {
  console.log('new user connected')
})


const changeStream = async() => {
  const stream = await ProductSchema.dummyProduct.watch();
  stream.on('change', async (change) => {
    if (change.operationType === 'insert') {
      const newProduct = change.fullDocument;
      const message = `New product in ${newProduct.category} has been added!`;
      io.emit('new-product', { message });
      console.log('emitted')
    }
  });

}


changeStream()


mongoDB()

app.use(cors({ origin: `http://localhost:${process.env.port}`, credentials: true }))
app.use(express.static(__dirname + '/public'));
app.use(session({ secret: process.env.SECRET_KEY, resave: false, saveUninitialized: false }));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use((req, res, next) => {
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', 0);
  next();
});

app.set('view engine', 'ejs')

app.get('/', indexControllers.getLogin)

app.get('/home', requireAuth, checkEmployee, indexControllers.getHome)

app.get("/about", requireAuth, checkEmployee, indexControllers.getAbout)

app.get("/contact", requireAuth, checkEmployee, indexControllers.getContact)

app.get('/vendor', requireAuth, checkEmployee, indexControllers.getVendor)

app.get('/pageNotFound', requireAuth, checkEmployee, indexControllers.getPageNotFound)

app.use(authRoutes)
app.use(shopRoutes)
app.use(cartRoutes)
app.use(checkoutRoutes)
app.use(adminRoutes)
app.use(vendorRoutes)





// app.listen(PORT, () => {
//     console.log(PORT)
// })rs

module.exports = {app, changeStream}