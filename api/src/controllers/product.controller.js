const { Product } = require('../models');

// Obtener todos los productos disponibles
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { available: true },
      order: [['category', 'ASC'], ['name', 'ASC']]
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
};

// Obtener TODOS los productos (admin - incluye no disponibles)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['category', 'ASC'], ['name', 'ASC']]
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
};

// Crear producto (admin)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, sizes, available, contactWhatsApp } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Nombre y precio son obligatorios' });
    }
    const product = await Product.create({
      name, description, price, imageUrl, category,
      sizes: sizes || [],
      available: available !== undefined ? available : true,
      contactWhatsApp
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error al crear producto', error: error.message });
  }
};

// Actualizar producto (admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    const { name, description, price, imageUrl, category, sizes, available, contactWhatsApp } = req.body;
    await product.update({
      name: name || product.name,
      description: description !== undefined ? description : product.description,
      price: price !== undefined ? price : product.price,
      imageUrl: imageUrl !== undefined ? imageUrl : product.imageUrl,
      category: category || product.category,
      sizes: sizes !== undefined ? sizes : product.sizes,
      available: available !== undefined ? available : product.available,
      contactWhatsApp: contactWhatsApp !== undefined ? contactWhatsApp : product.contactWhatsApp
    });
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
  }
};

// Eliminar producto (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    await product.destroy();
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
  }
};
