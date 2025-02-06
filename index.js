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
      res.status(404).json({ error: `No ${req.params.title} product found` });
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

// async function deleteUser(userId) {
//   try {
//     const user = await User.findByIdAndDelete(userId);
//     return user;
//   } catch (error) {
//     console.log(error);
//   }
// }

// app.delete('/api/users/:userId', async (req, res) => {
//   try {
//     const deletedUser = await deleteUser(req.params.userId);
//     if (!deletedUser) {
//       res.status(404).json({ error: 'User not found' });
//     } else {
//       res.status(200).json({
//         message: 'user deleted successfully',
//         user: deletedUser,
//       });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to delete an user' });
//   }
// });

// async function updateUser(userId, dataToUpdate) {
//   try {
//     const updatedUser = await User.findByIdAndUpdate(userId, dataToUpdate, {
//       new: true,
//     });
//     return updatedUser;
//   } catch (error) {
//     console.log(error);
//   }
// }

// app.put('/api/users/:userId', async (req, res) => {
//   try {
//     const updatedUser = await updateUser(req.params.userId, req.body);
//     if (updatedUser) {
//       res.status(200).json({
//         message: 'User updated successfully',
//         user: updatedUser,
//       });
//     } else {
//       res.status(404).json({ error: 'Could not update user details' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to update user' });
//   }
// });

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
      res.json(404).json({ error: 'No addresses found' });
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
async function getWishlist(user) {
  try {
    const wishlistItems = await Wishlist.findOne({ user }).populate(
      'products.product'
    );
    // console.log(wishlistItems);
    return wishlistItems;
  } catch (error) {
    console.log(error);
  }
}

app.get('/api/wishlists/:userId', async (req, res) => {
  try {
    const wishlists = await getWishlist(req.params.userId);
    res.status(200).json(wishlists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get wishlist items' });
  }
});

async function addToWishlist(user, product) {
  try {
    let wishlist = await Wishlist.findOne({ user });
    // console.log(wishlist);
    if (wishlist) {
      const itemIndex = wishlist.products.findIndex((item) => {
        return item.product.toString() === product.product;
      });

      // console.log(itemIndex);
      if (itemIndex === -1) {
        wishlist.products.push(product);
        await wishlist.save();
        return wishlist;
      }
      return;
    } else {
      wishlist = new Wishlist({ user, products: [product] });
      const savedItem = await wishlist.save();
      return savedItem;
    }
  } catch (error) {
    console.log(error);
  }
}

app.post('/api/wishlists/:userId', async (req, res) => {
  try {
    const savedItem = await addToWishlist(req.params.userId, req.body);
    // console.log(savedItem);
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

async function removeFromWishlist(user, product) {
  try {
    const wishlist = await Wishlist.findOne({ user });

    if (wishlist) {
      const itemIndex = wishlist.products.findIndex((item) => {
        return item.product.toString() === product.product;
      });

      if (itemIndex !== -1) {
        wishlist.products.splice(itemIndex, 1);
        return await wishlist.save();
      } else {
        return;
      }
    }
  } catch (error) {
    console.log(error);
  }
}

app.delete('/api/wishlists/:userId', async (req, res) => {
  try {
    const deletedItem = await removeFromWishlist(req.params.userId, req.body);
    // console.log(deletedItem);
    if (deletedItem) {
      res.status(200).json({ message: 'Item deleted from wishlist' });
    } else {
      res.status(404).json({ error: 'Item not found.' });
    }
  } catch {
    res.status(500).json({ error: 'Failed to delete product from wishlist' });
  }
});

//cart
async function getCartItems(user) {
  try {
    const products = await Cart.findOne({ user }).populate('products.product');
    // console.log(products);
    return products;
  } catch (error) {
    console.log(error);
  }
}

app.get('/api/carts/:userId', async (req, res) => {
  {
    try {
      const getCart = await getCartItems(req.params.userId);
      res.status(200).json(getCart);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get cart items' });
    }
  }
});

async function addToCart(user, product) {
  try {
    let cart = await Cart.findOne({ user });
    // console.log(user, product, cart);
    if (cart) {
      const itemIndex = cart.products.findIndex((item) => {
        // console.log(item.product.toString(), product.product);
        return item.product.toString() === product.product;
      });
      // console.log(itemIndex);

      if (itemIndex !== -1) {
        // console.log(cart.products[itemIndex].quantity);
        cart.products[itemIndex].quantity =
          cart.products[itemIndex].quantity + 1;
      } else {
        cart.products.push(product);
      }
    } else {
      cart = new Cart({ user, products: [{ product }] });
    }

    const saveCart = await cart.save();
    return saveCart;
  } catch (error) {
    console.log(error);
  }
}

app.post('/api/carts/:userId', async (req, res) => {
  try {
    const cartItem = await addToCart(req.params.userId, req.body);
    if (cartItem) {
      res.status(201).json({
        message: 'Item added to cart successfully',
        cart: cartItem,
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product to cart' });
  }
});

async function removeFromCart(user, product) {
  try {
    const cart = await Cart.findOne({ user });
    // console.log(user, product);

    if (cart) {
      const itemIndex = cart.products.findIndex((item) => {
        return item.product.toString() === product.product;
      });
      // console.log(itemIndex);

      if (itemIndex !== -1) {
        cart.products.splice(itemIndex, 1);
        return await cart.save();
      } else {
        return;
      }
    }
  } catch (error) {
    console.log(error);
  }
}

app.delete('/api/carts/:userId', async (req, res) => {
  try {
    const deletedItem = await removeFromCart(req.params.userId, req.body);
    // console.log(deletedItem);
    if (deletedItem) {
      res.status(200).json({ message: 'Item deleted from cart' });
    } else {
      res.status(404).json({ error: 'Item not found.' });
    }
  } catch {
    res.status(500).json({ error: 'Failed to delete product from cart' });
  }
});

async function increaseQuantity(user, product) {
  try {
    const cart = await Cart.findOne({ user });
    // console.log(user, product);

    if (cart) {
      const itemIndex = cart.products.findIndex((item) => {
        return item.product.toString() === product.product;
      });
      // console.log(itemIndex);

      if (itemIndex !== -1) {
        cart.products[itemIndex].quantity =
          cart.products[itemIndex].quantity + 1;
      } else {
        return;
      }
    }
    const saveCart = await cart.save();
    return saveCart;
  } catch (error) {
    console.log(error);
  }
}

app.put('/api/carts/:userId/increase', async (req, res) => {
  try {
    const item = await increaseQuantity(req.params.userId, req.body);
    // console.log(item);
    if (item) {
      res
        .status(200)
        .json({ message: 'Increased the quantity of item in the cart' });
    } else {
      res.status(404).json({ error: 'Item not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to increase quantity' });
  }
});

async function decreaseQuantity(user, product) {
  try {
    const cart = await Cart.findOne({ user });
    // console.log(user, product);

    if (cart) {
      const itemIndex = cart.products.findIndex((item) => {
        return item.product.toString() === product.product;
      });
      // console.log(itemIndex);

      if (itemIndex !== -1 && cart.products[itemIndex].quantity > 1) {
        // console.log(cart.products[itemIndex].quantity);
        cart.products[itemIndex].quantity =
          cart.products[itemIndex].quantity - 1;
        return await cart.save();
      } else {
        cart.products.splice(itemIndex, 1);
        await cart.save();
        return;
      }
    }
  } catch (error) {
    console.log(error);
  }
}

app.put('/api/carts/:userId/decrease', async (req, res) => {
  try {
    const item = await decreaseQuantity(req.params.userId, req.body);
    // console.log(item);
    if (item) {
      res
        .status(200)
        .json({ message: 'Decreased the quantity of item in the cart' });
    } else {
      res.status(404).json({ error: 'Item removed from the cart.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to decrease quantity' });
  }
});

//move (cart -> wishlist)
async function moveToWishlist(user, product) {
  try {
    const cart = await Cart.findOne({ user });

    const itemIndex = cart.products.findIndex((item) => {
      return item.product.toString() === product.product;
    });
    console.log(itemIndex);

    if (itemIndex !== -1) {
      cart.products.splice(itemIndex, 1);
    }
    await cart.save();

    let wishlist = await Wishlist.findOne({ user });
    console.log(wishlist);

    if (wishlist) {
      const existingItem = wishlist.products.find(
        (item) => item.product.toString() === product.product
      );
      console.log(existingItem);

      if (!existingItem) {
        wishlist.products.push(product);
      }
    } else {
      wishlist = new Wishlist({ user, products: [{ product }] });
    }
    return await wishlist.save();
  } catch (error) {
    console.log(error);
  }
}

app.put('/api/carts/:userId/move/wishlist', async (req, res) => {
  try {
    const item = await moveToWishlist(req.params.userId, req.body);
    console.log(item);
    if (item) {
      res.status(200).json({ message: 'Item moved to wishlist successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to move an item to wishlist' });
  }
});

//move (wishlist -> cart)
async function moveToCart(user, product) {
  try {
    const wishlist = await Wishlist.findOne({ user });

    const itemIndex = wishlist.products.findIndex((item) => {
      return item.product.toString() === product.product;
    });
    console.log(itemIndex);

    if (itemIndex !== -1) {
      wishlist.products.splice(itemIndex, 1);
    }
    await wishlist.save();

    let cart = await Cart.findOne({ user });

    if (cart) {
      const existingItem = cart.products.find(
        (item) => item.product.toString() === product.product
      );
      console.log(existingItem);

      if (!existingItem) {
        cart.products.push(product);
      } else {
        existingItem.quantity = existingItem.quantity + 1;
      }
    } else {
      cart = new Cart({ user, products: [{ product }] });
    }
    return await cart.save();
  } catch (error) {
    console.log(error);
  }
}

app.put('/api/wishlists/:userId/move/cart', async (req, res) => {
  try {
    const item = await moveToCart(req.params.userId, req.body);
    console.log(item);
    if (item) {
      res.status(200).json({ message: 'Item moved to cart successfully' });
    } else {
      res.status(404).json({ error: 'Item is already present in the cart' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to move an item to cart' });
  }
});
