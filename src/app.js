const express = require('express');
const fs = require('fs').promises;

class ProductManager {
  constructor() {
    this.path = './products.json';
  }

  async addProduct(title, description, price, thumbnail, code, stock) {
    try {
      const productsData = await fs.readFile(this.path, 'utf-8');
      const products = JSON.parse(productsData);

      if (!title || !description || !price || !thumbnail || !code || !stock) {
        console.log('Error: favor de llenar todos los campos');
        return;
      }

      if (products.some((product) => product.code === code)) {
        console.log('Error: el código ', code, ' ya se encuentra registrado.');
        return;
      }

      const newProduct = {
        id: products.length + 1,
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
      };

      products.push(newProduct);
      await fs.writeFile(this.path, JSON.stringify(products, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error al agregar producto:', error);
    }
  }

  async getProducts(limit) {
    try {
      const productsData = await fs.readFile(this.path, 'utf-8');
      let products = JSON.parse(productsData);

      if (limit) {
        products = products.slice(0, limit);
      }

      return products;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return [];
    }
  }

  async getProductById(id) {
    try {
      const productsData = await fs.readFile(this.path, 'utf-8');
      const products = JSON.parse(productsData);
      const foundProduct = products.find((p) => p.id === id);

      if (foundProduct) {
        return foundProduct;
      } else {
        console.log('Producto no encontrado');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener producto por ID:', error);
      return null;
    }
  }

  async updateProduct(id, value) {
    try {
      const productsData = await fs.readFile(this.path, 'utf-8');
      const products = JSON.parse(productsData);
      const index = products.findIndex((p) => p.id === id);

      if (index === -1) {
        console.error('Error: producto no encontrado');
        return;
      }

      products[index] = { ...products[index], ...value };
      await fs.writeFile(this.path, JSON.stringify(products, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error al actualizar producto:', error);
    }
  }

  async deleteProduct(id) {
    try {
      const productsData = await fs.readFile(this.path, 'utf-8');
      let products = JSON.parse(productsData);
      products = products.filter((p) => p.id !== id);
      await fs.writeFile(this.path, JSON.stringify(products, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  }
}

const app = express();
const port = 8080;

const productManager = new ProductManager();

app.get('/products', async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : null;
  const products = await productManager.getProducts(limit);
  res.json(products);
});

app.get('/products/:pid', async (req, res) => {
  const productId = parseInt(req.params.pid);
  const product = await productManager.getProductById(productId);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

app.listen(port, () => {
  console.log(`Servidor Express iniciado en http://localhost:${port}`);
});
