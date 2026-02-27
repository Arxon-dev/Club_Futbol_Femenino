const { News } = require('../models');

// Obtener todas las noticias (publicadas)
exports.getAllNews = async (req, res) => {
  try {
    const news = await News.findAll({
      where: { published: true },
      order: [['createdAt', 'DESC']]
    });
    res.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ message: 'Error al obtener las noticias', error: error.message });
  }
};

// Obtener una noticia por ID
exports.getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await News.findByPk(id);

    if (!article) {
      return res.status(404).json({ message: 'Noticia no encontrada' });
    }

    res.json(article);
  } catch (error) {
    console.error('Error fetching news article:', error);
    res.status(500).json({ message: 'Error al obtener la noticia', error: error.message });
  }
};

// Crear una noticia (Admin)
exports.createNews = async (req, res) => {
  try {
    const article = await News.create(req.body);
    res.status(201).json(article);
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ message: 'Error al crear la noticia', error: error.message });
  }
};

// Actualizar una noticia (Admin)
exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await News.findByPk(id);

    if (!article) {
      return res.status(404).json({ message: 'Noticia no encontrada' });
    }

    await article.update(req.body);
    res.json(article);
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ message: 'Error al actualizar la noticia', error: error.message });
  }
};

// Eliminar una noticia (Admin)
exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await News.findByPk(id);

    if (!article) {
      return res.status(404).json({ message: 'Noticia no encontrada' });
    }

    await article.destroy();
    res.json({ message: 'Noticia eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ message: 'Error al eliminar la noticia', error: error.message });
  }
};
