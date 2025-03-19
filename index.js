require('dotenv').config();
const { initializeDatabase } = require('./db/db.connect');
const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const Product = require('./models/product.model');
const Category = require('./models/category.model');
const Address = require('./models/address.model');
const User = require('./models/user.model');
const Wishlist = require('./models/wishlist.model');
const Cart = require('./models/cart.model');
const Order = require('./models/order.model');

const app = express();

const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

initializeDatabase();
app.listen(PORT, () => console.log(`Server is listening on port ${PORT} `));

app.get('/', (req, res) => res.send('Hello, Express'));

//categories
async function readAllCategories() {
  try {
    const allCategories = await Category.find();
    return allCategories;
  } catch (error) {
    console.log(error);
  }
}

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await readAllCategories();
    if (categories.length > 0) {
      res.json(categories);
    } else {
      res.status(404).json({ error: 'No category found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get all categories' });
  }
});

async function readCategoryById(categoryId) {
  try {
    const category = await Category.findOne({ _id: categoryId });
    return category;
  } catch (error) {
    console.log(error);
  }
}

app.get('/api/categories/:categoryId', async (req, res) => {
  try {
    const category = await readCategoryById(req.params.categoryId);
    if (category) {
      res.status(200).json(category);
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get a category' });
  }
});

async function addCategory(newCategory) {
  try {
    const category = new Category(newCategory);
    const saveCategory = await category.save();
    return saveCategory;
  } catch (error) {
    console.log(error);
  }
}

app.post('/api/categories', async (req, res) => {
  try {
    const savedCategory = await addCategory(req.body);
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add category' });
  }
});

async function deleteCategory(categoryId) {
  try {
    const category = await Category.findByIdAndDelete(categoryId);
    return category;
  } catch (error) {
    console.log(error);
  }
}

app.delete('/api/categories/:categoryId', async (req, res) => {
  try {
    const deletedCategory = await deleteCategory(req.params.categoryId);
    if (!deletedCategory) {
      res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json({
      message: 'Category deleted successfully',
      category: deletedCategory,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

async function updateCategory(categoryId, dataToUpdate) {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      dataToUpdate,
      { new: true }
    );
    return updatedCategory;
  } catch (error) {
    console.log(error);
  }
}

app.put('/api/categories/:categoryId', async (req, res) => {
  try {
    const updatedCategory = await updateCategory(
      req.params.categoryId,
      req.body
    );
    if (updatedCategory) {
      res.status(200).json({
        message: 'Category updated successfully',
        category: updatedCategory,
      });
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

//products
async function addProduct(newProduct) {
  try {
    const product = new Product(newProduct);
    const saveProduct = await product.save();
    return saveProduct;
  } catch (error) {
    console.log(error);
  }
}

app.post('/api/products', async (req, res) => {
  try {
    const product = await addProduct(req.body);
    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

async function readAllProducts() {
  try {
    const allProducts = await Product.find().populate('category');
    return allProducts;
  } catch (error) {
    console.log(error);
  }
}

app.get('/api/products', async (req, res) => {
  try {
    const products = await readAllProducts();
    if (products.length > 0) {
      res.json(products);
    } else {
      res.status(404).json({ error: 'No products found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get all products' });
  }
});

async function readProductById(productId) {
  try {
    const product = await Product.findOne({
      _id: productId,
    });
    return product;
  } catch (error) {
    console.log(error);
  }
}

app.get('/api/products/:productId', async (req, res) => {
  try {
    const product = await readProductById(req.params.productId);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: 'Product not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get a product' });
  }
});

async function searchProductByTitle(title) {
  try {
    const products = await Product.find();
    const filteredProducts = products.filter((product) =>
      product.productTitle.toLowerCase().includes(title.toLowerCase())
    );

    return filteredProducts;
  } catch (error) {
    console.log(error);
  }
}

app.get('/api/products/search/:title', async (req, res) => {
  try {
    const products = await searchProductByTitle(req.params.title);

    if (products.length === 0) {
      res.status(404).json({
        error: `No ${req.params.title} product found`,
      });
    } else {
      res.status(200).json(products);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get a product by its title' });
  }
});

async function deleteProduct(productId) {
  try {
    const product = await Product.findByIdAndDelete(productId);
    return product;
  } catch (error) {
    console.log(error);
  }
}

app.delete('/api/products/:productId', async (req, res) => {
  try {
    const deletedProduct = await deleteProduct(req.params.productId);
    if (!deletedProduct) {
      res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({
      message: 'Product deleted successfully',
      product: deletedProduct,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

async function updateProduct(productId, dataToUpdate) {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      dataToUpdate,
      { new: true }
    );
    return updatedProduct;
  } catch (error) {
    console.log(error);
  }
}

app.put('/api/products/:productId', async (req, res) => {
  try {
    const updatedProduct = await updateProduct(req.params.productId, req.body);
    if (updatedProduct) {
      res.status(200).json({
        message: 'Product updated successfully',
        product: updatedProduct,
      });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'server error' });
  }
});

//user
async function createUser(newUser) {
  try {
    const user = new User(newUser);
    const saveUser = await user.save();
    return saveUser;
  } catch (error) {
    console.log(error);
  }
}

app.post('/api/users', async (req, res) => {
  try {
    const savedUser = await createUser(req.body);
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

async function readUser(userId) {
  try {
    const user = await User.findOne({ _id: userId });
    return user;
  } catch (error) {
    console.log(error);
  }
}

app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await readUser(req.params.userId);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get an user' });
  }
});

//address
async function addAddress(newAddress) {
  try {
    const address = new Address(newAddress);
    const saveAddress = await address.save();
    return saveAddress;
  } catch (error) {
    console.log(error);
  }
}

app.post('/api/addresses', async (req, res) => {
  try {
    const savedAddress = await addAddress(req.body);
    res
      .status(201)
      .json({ message: 'Address added successfully', address: savedAddress });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add address' });
  }
});

async function readAllAddresses() {
  try {
    const allAddresses = await Address.find();
    return allAddresses;
  } catch (error) {
    console.log(error);
  }
}
app.get('/api/addresses', async (req, res) => {
  try {
    const allAddresses = await readAllAddresses();
    if (allAddresses.length > 0) {
      res.json(allAddresses);
    } else {
      res.status(404).json({ error: 'No addresses found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get all addresses.' });
  }
});

async function readAddressById(addressId) {
  try {
    const address = await Address.findOne({ _id: addressId });
    return address;
  } catch (error) {
    console.log(error);
  }
}
app.get('/api/addresses/:addressId', async (req, res) => {
  try {
    const address = await readAddressById(req.params.addressId);
    if (address) {
      res.status(200).json(address);
    } else {
      res.status(404).json({ error: 'Address not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get an address' });
  }
});

async function deleteAddress(addressId) {
  try {
    const address = await Address.findByIdAndDelete(addressId);
    return address;
  } catch (error) {
    console.log(error);
  }
}
app.delete('/api/addresses/:addressId', async (req, res) => {
  try {
    const deletedAddress = await deleteAddress(req.params.addressId);
    if (!deleteAddress) {
      res.status(404).json({ error: 'Address not found' });
    } else {
      res.status(200).json({
        message: 'Address deleted successfully',
        address: deletedAddress,
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete an address' });
  }
});

async function updateAddress(addressId, dataToUpdate) {
  try {
    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      dataToUpdate,
      { new: true }
    );
    return updatedAddress;
  } catch (error) {
    console.log(error);
  }
}
app.put('/api/addresses/:addressId', async (req, res) => {
  try {
    const updatedAddress = await updateAddress(req.params.addressId, req.body);
    if (updatedAddress) {
      res.status(200).json({
        message: 'Address updated successfully',
        address: updatedAddress,
      });
    } else {
      res.status(404).json({ error: 'Could not update an address' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update an address' });
  }
});

//wishlist
async function getWishlist() {
  try {
    const wishlist = await Wishlist.find().populate('product');
    return wishlist;
  } catch (error) {
    console.log(error);
  }
}
app.get('/api/wishlists', async (req, res) => {
  try {
    const wishlists = await getWishlist();
    res.status(200).json(wishlists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get wishlist items' });
  }
});

async function addToWishlist(newData) {
  try {
    const existingItem = await Wishlist.findOne({ product: newData.product });
    console.log(existingItem);

    if (!existingItem) {
      const item = new Wishlist(newData);
      return await item.save();
    }
  } catch (error) {
    console.log(error);
  }
}

app.post('/api/wishlists', async (req, res) => {
  try {
    const savedItem = await addToWishlist(req.body);
    if (savedItem) {
      res.status(201).json({
        message: 'Item added to wishlist successfully',
        wishlist: savedItem,
      });
    } else {
      res.json({
        message: 'Item is already present in the wishlist',
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add an item to wishlist' });
  }
});

async function removeFromWishlist(wishlistId) {
  try {
    const item = await Wishlist.findByIdAndDelete(wishlistId);
    return item;
  } catch (error) {
    console.log(error);
  }
}
app.delete('/api/wishlists/:wishlistId', async (req, res) => {
  try {
    const deletedItem = await removeFromWishlist(req.params.wishlistId);
    if (!deletedItem) {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.status(200).json({
        message: 'Item removed from wishlist successfully',
        wishlist: deletedItem,
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove an item from wishlist' });
  }
});

//cart

async function getCartItems() {
  try {
    const cart = await Cart.find().populate('product');
    return cart;
  } catch (error) {
    console.log(error);
  }
}
app.get('/api/carts', async (req, res) => {
  try {
    const cart = await getCartItems();
    res.status(200).json({ cart });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cart items' });
  }
});

async function addToCart(newData) {
  try {
    const existingItem = await Cart.findOne({ product: newData.product });

    if (!existingItem) {
      const item = new Cart(newData);
      return await item.save();
    } else {
      existingItem.quantity = existingItem.quantity + 1;
      return await existingItem.save();
    }
  } catch (error) {
    console.log(error);
  }
}

app.post('/api/carts', async (req, res) => {
  try {
    const savedItem = await addToCart(req.body);
    if (savedItem) {
      res.status(201).json({
        message: 'Item added to cart successfully',
        cart: savedItem,
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add an item to cart' });
  }
});

async function removeFromCart(cartId) {
  try {
    const item = await Cart.findByIdAndDelete(cartId);
    return item;
  } catch (error) {
    console.log(error);
  }
}
app.delete('/api/carts/:cartId', async (req, res) => {
  try {
    const deletedItem = await removeFromCart(req.params.cartId);
    if (!deletedItem) {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.status(200).json({
        message: 'Item removed from cart successfully',
        cart: deletedItem,
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove an item from cart' });
  }
});

async function increaseQuantity(cartId) {
  console.log(cartId);
  try {
    const existingItem = await Cart.findOne({ _id: cartId });
    console.log(existingItem);

    if (existingItem) {
      existingItem.quantity = existingItem.quantity + 1;
      return await existingItem.save();
    }
  } catch (error) {
    console.log(error);
  }
}

app.put('/api/carts/increase', async (req, res) => {
  try {
    const item = await increaseQuantity(req.body);
    if (item) {
      res.status(200).json({
        message: 'Increased the quantity of item in the cart',
        product: item,
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to increase quantity of an item' });
  }
});

async function decreaseQuantity(cartId) {
  console.log(cartId);
  try {
    const existingItem = await Cart.findOne({ _id: cartId });
    console.log(existingItem);

    if (existingItem.quantity === 1) {
      const item = await Cart.findByIdAndDelete(cartId);
      return item;
    } else {
      existingItem.quantity = existingItem.quantity - 1;
      return await existingItem.save();
    }
  } catch (error) {
    console.log(error);
  }
}

app.put('/api/carts/decrease', async (req, res) => {
  try {
    const item = await decreaseQuantity(req.body);
    console.log('Item: ', item);
    if (item) {
      res.status(200).json({
        message: 'Decreased the quantity of item in the cart',
        product: item,
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to decrease quantity of an item' });
  }
});

//move (wishlist -> cart)
async function moveFromWishlistToCart(newData) {
  console.log(newData);
  try {
    const existingItem = await Cart.findOne({
      product: newData.product,
    });
    console.log(existingItem);

    const wishlist = await Wishlist.findByIdAndDelete(newData._id);
    console.log(wishlist);

    if (existingItem) {
      existingItem.quantity = existingItem.quantity + 1;
      return await existingItem.save();
    } else {
      const item = new Cart(newData);
      return await item.save();
    }
  } catch (error) {
    console.log(error);
  }
}

app.put('/api/carts/move', async (req, res) => {
  try {
    const item = await moveFromWishlistToCart(req.body);
    if (item) {
      res.status(200).json({
        message: 'Item moved from wishlist to cart successfully.',
        product: item,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

//move (cart -> wishlist)
async function moveFromCartToWishlist(newData) {
  console.log(newData);
  try {
    const existingItem = await Wishlist.findOne({
      product: newData.product,
    });
    console.log(existingItem);

    if (!existingItem) {
      const cart = await Cart.findByIdAndDelete(newData._id);
      console.log(cart);

      const item = new Wishlist(newData);
      return await item.save();
    }
  } catch (error) {
    console.log(error);
  }
}

app.put('/api/wishlists/move', async (req, res) => {
  try {
    const item = await moveFromCartToWishlist(req.body);
    console.log(item);
    if (item) {
      res.status(200).json({
        message: 'Item moved from cart to wishlist successfully.',
        product: item,
      });
    } else {
      res.json({
        message: 'Item is already present in the wishlist.',
        product: item,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

//order
async function createOrder(newOrder) {
  try {
    const order = new Order(newOrder);
    const saveOrder = await order.save();
    return saveOrder;
  } catch (error) {
    console.log(error);
  }
}

app.post('/api/orders', async (req, res) => {
  try {
    const savedOrder = await createOrder(req.body);
    res
      .status(201)
      .json({ message: 'Order added successfully', order: savedOrder });
  } catch (error) {
    res.status(500).json({ error: 'Failed to place an order' });
  }
});

async function readAllOrders() {
  try {
    const allOrders = await Order.find()
      .populate('cartItem')
      .populate('shippingAddress');
    return allOrders;
  } catch (error) {
    console.log(error);
  }
}
app.get('/api/orders', async (req, res) => {
  try {
    const allOrders = await readAllOrders();
    if (allOrders.length > 0) {
      res.json(allOrders);
    } else {
      res.status(404).json({ message: 'No order found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get all orders.' });
  }
});
