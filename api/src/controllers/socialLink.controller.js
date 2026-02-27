const SocialLink = require('../models/SocialLink');

// Get the current social links (creates default record if none exists)
exports.getLinks = async (req, res) => {
  try {
    let links = await SocialLink.findOne({
      order: [['updatedAt', 'DESC']]
    });

    // If no record exists, create a default empty one
    if (!links) {
      links = await SocialLink.create({
        instagramUrl: '',
        facebookUrl: '',
        youtubeUrl: '',
        twitterUrl: ''
      });
    }

    res.json(links);
  } catch (error) {
    console.error('Error fetching social links:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

// Update social links (admin only)
exports.updateLinks = async (req, res) => {
  try {
    const { instagramUrl, facebookUrl, youtubeUrl, twitterUrl } = req.body;

    let links = await SocialLink.findOne({
      order: [['updatedAt', 'DESC']]
    });

    if (links) {
      links.instagramUrl = instagramUrl ?? links.instagramUrl;
      links.facebookUrl = facebookUrl ?? links.facebookUrl;
      links.youtubeUrl = youtubeUrl ?? links.youtubeUrl;
      links.twitterUrl = twitterUrl ?? links.twitterUrl;
      await links.save();
    } else {
      links = await SocialLink.create({
        instagramUrl: instagramUrl || '',
        facebookUrl: facebookUrl || '',
        youtubeUrl: youtubeUrl || '',
        twitterUrl: twitterUrl || ''
      });
    }

    res.json({ message: 'Enlaces sociales actualizados exitosamente', links });
  } catch (error) {
    console.error('Error updating social links:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};
