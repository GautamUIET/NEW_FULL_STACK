const port = process.env.PORT || 4000;
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
app.use(cors());
app.use("/images", express.static('upload/images'));

const uploadDir = './upload/images';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

mongoose.connect("mongodb+srv://gautamjain09687:1234@cluster0.ejuuzk0.mongodb.net/ecommercedb")
  .then(() => {
    console.log("Connection Success");
  })
  .catch((error) => {
    console.error("Error found in connection:", error);
  });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Routes
app.get("/", (req, res) => {
  res.send("Running the express js");
});

app.post("/upload", upload.single('products'), (req, res) => {
  if (req.file) {
    res.json({
      success: 1,
      image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
  } else {
    res.status(400).json({ success: 0, message: "No file uploaded" });
  }
});

// Mongoose Schema and Model
const productSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true }
});

const Product = mongoose.model("Product", productSchema);

app.post('/addproduct', async (req, res) => {
  try {
    let lastProduct = await Product.findOne({}).sort({ id: -1 });
    let id = lastProduct ? lastProduct.id + 1 : 1;

    const product = new Product({
      id: id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
    });

    await product.save();
    console.log("Product saved:", product);
    res.json({ success: true, name: req.body.name });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ success: false, message: 'Error adding product' });
  }
});

app.post('/removeproduct', async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("Product removed");
    res.json({ success: true });
  } catch (error) {
    console.error("Error removing product:", error);
    res.status(500).json({ success: false, message: 'Error removing product' });
  }
});

app.get('/allproducts', async (req, res) => {
  try {
    let products = await Product.find({});
    console.log("All products fetched");
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: 'Error fetching products' });
  }
});

// Schema for user model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  cartData: { type: Object, default: {} },
  date: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
app.post('/signup', async (req, res) => {
  try {
    // Log the incoming request details
    console.log("Signup request received:", req.body);

    let check = await User.findOne({ email: req.body.email });
    if (check) {
      console.log("Existing user found with email:", req.body.email);
      return res.status(400).json({ success: false, error: "Existing user found with the same email address" });
    }

    let cart = {};
    for (let index = 0; index < 300; index++) {
      cart[index] = 0;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log("Hashed password:", hashedPassword);

    const user = new User({
      name: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      cartData: cart,
    });

    await user.save();
    console.log("User saved:", user);

    const data = {
      user: {
        id: user.id
      }
    };

    const token = jwt.sign(data, 'secret_ecom');
    console.log("JWT token generated:", token);

    res.json({ success: true, token });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ success: false, message: 'Error during signup' });
  }
});


app.post("/login", async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });

    if (user) {
      let passCompare = await bcrypt.compare(req.body.password, user.password);
      if (passCompare) {
        const data = {
          user: {
            id: user.id
          }
        };
        let token = jwt.sign(data, "secret_ecom");

        res.json({ success: true, token });
      } else {
        res.status(401).json({ success: false, error: "Password is incorrect" });
      }
    } else {
      res.status(404).json({ success: false, error: "Email not found" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get('/newcollection',async(req,res)=>{
  let products = await Product.find({});
  let newcollection = products.slice(1).slice(-8);
  console.log("NewCollection Fetched");
  res.send(newcollection);

})

app.get('/popular_in_women',async(req,res)=>{
  let products = await Product.find({category : 'women'});
  let pop_in_women = products.slice(1).slice(0,4);
  console.log("popular in women Fetched");
  res.send(pop_in_women);

})


const fetchUser = async (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
      return res.status(401).send("Please Authenticate using a valid token");
  } else {
      try {
          const data = jwt.verify(token, "secret_ecom");
          req.user = data.user;
          next();
      } catch (error) {
          console.log("Error found in token ", error);
          return res.status(401).send({ errors: "Please Authenticate using a valid token" });
      }
  }
}

app.post("/addtocart", fetchUser, async (req, res) => {
  try {
      // Log the incoming request details
      console.log("Token:", req.header('auth-token'));
      console.log("User ID:", req.user.id);
      console.log("Adding item:", req.body.itemId);

      // Find the user by ID
      let userData = await User.findOne({ _id: req.user.id });

      if (!userData) {
          console.log("User not found with ID:", req.user.id);
          return res.status(404).send("User not found");
      }

      // Initialize cartData if it does not exist
      if (!userData.cartData) {
          userData.cartData = {};
      }

      // Initialize item count if it does not exist
      if (!userData.cartData[req.body.itemId]) {
          userData.cartData[req.body.itemId] = 0;
      }

      // Increment the item count
      userData.cartData[req.body.itemId] += 1;
      console.log("Updated cartData for user:", req.user.id, userData.cartData);

      // Update the user's cart data in the database
      await User.findOneAndUpdate(
          { _id: req.user.id },
          { $set: { cartData: userData.cartData } },
          { new: true }
      );

      res.send("Added");
  } catch (error) {
      console.log("Error adding to cart for user:", req.user.id, error);
      res.status(500).send("Internal Server Error");
  }
});


// creating end point for remove from cart

app.post("/removefromcart", fetchUser, async (req, res) => {
  try {
      // Log the incoming request details
      console.log("Token:", req.header('auth-token'));
      console.log("User ID:", req.user.id);
      console.log("Removing item:", req.body.itemId);

      // Find the user by ID
      let userData = await User.findOne({ _id: req.user.id });

      if (!userData) {
          console.log("User not found with ID:", req.user.id);
          return res.status(404).send("User not found");
      }

      // Ensure cartData exists
      if (!userData.cartData) {
          console.log("Cart data not found for user:", req.user.id);
          return res.status(400).send("Cart data not found");
      }

      // Check if the item exists in the cart and has a positive quantity
      if (userData.cartData[req.body.itemId] > 0) {
          userData.cartData[req.body.itemId] -= 1;
          console.log("Updated cartData for user:", req.user.id, userData.cartData);

          // Update the user's cart data in the database
          await User.findOneAndUpdate(
              { _id: req.user.id },
              { $set: { cartData: userData.cartData } },
              { new: true }
          );

          res.send("Removed");
      } else {
          console.log("Item not found in cart or quantity is zero for user:", req.user.id);
          return res.status(400).send("Item not found in cart or quantity is zero");
      }
  } catch (error) {
      console.log("Error removing from cart for user:", req.user.id, error);
      res.status(500).send("Internal Server Error");
  }
});


// creating end point for getCart

app.post("/getcart", fetchUser, async (req, res) => {
  try {
      console.log("Get Cart request for user ID:", req.user.id);

      // Find the user by ID
      let userData = await User.findOne({ _id: req.user.id });

      if (!userData) {
          console.log("User not found with ID:", req.user.id);
          return res.status(404).send("User not found");
      }

      console.log("Cart data for user:", req.user.id, userData.cartData);
      res.send(userData.cartData || {});
  } catch (error) {
      console.log("Error fetching cart for user:", req.user.id, error);
      res.status(500).send("Internal Server Error");
  }
});


app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on Port " + port);
  } else {
    console.error("Error starting server:", error);
  }
});
