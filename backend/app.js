const express = require('express');
const multer = require('multer');
const productController = require('./controllers/productController');

const app = express();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route to create a product
app.post('/api/products/create', upload.array('images'), (req, res, next) => {
  console.log('Received form data:', req.body);
  console.log('Received files:', req.files);
  next();
});

// Other routes and middleware
// ...

module.exports = app;