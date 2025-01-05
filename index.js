require('dotenv').config();
const { initializeDatabase } = require('./db/db.connect');
const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const Product = require('./models/product.model');
const Category = require('./models/category.model');

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
      res.status(404).json({ error: 'Category doesn not exist' });
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
    const allProducts = await Product.find();
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
      res.status(404).json({ error: 'Product does not exist' });
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
