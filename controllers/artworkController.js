const { Artwork, User, Comment, Like } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const db = require('../config/db'); // adjust the path according to your project structure


// Helper: Get likes count and whether current user liked the artwork
async function getLikesData(artwork_id, user_id) {
  const likesCount = await Like.count({ where: { artwork_id } });
  const liked = await Like.findOne({ where: { artwork_id, user_id } });
  return { likes: likesCount, liked: !!liked };
}

// Show feed with all artworks
exports.feed = async (req, res) => {
  try {
    const user_id = req.session.user.id;

    const artworks = await Artwork.findAll({
      include: [{ model: User, as: 'artist', attributes: ['full_name', 'email'] }],
      order: [['created_at', 'DESC']],
    });

    for (const artwork of artworks) {
      const comments = await Comment.findAll({
        where: { artwork_id: artwork.id },
        include: [{ model: User, as: 'user', attributes: ['full_name'] }],
        order: [['created_at', 'ASC']],
      });

      const likesData = await getLikesData(artwork.id, user_id);
      artwork.dataValues.comments = comments;
      artwork.dataValues.likes = likesData.likes;
      artwork.dataValues.liked = likesData.liked;
    }

    res.render('artworks/feed', { artworks });
  } catch (err) {
    console.error('Error fetching artworks:', err);
    res.status(500).send('Error fetching artworks');
  }
};

// Show artworks uploaded by current user
exports.myArtworks = async (req, res) => {
  try {
    const user_id = req.session.user.id;

    const artworks = await Artwork.findAll({
      where: { user_id },
      include: [{ model: User, as: 'artist', attributes: ['full_name', 'email'] }],
      order: [['created_at', 'DESC']],
    });

    for (const artwork of artworks) {
      const comments = await Comment.findAll({
        where: { artwork_id: artwork.id },
        include: [{ model: User, as: 'user', attributes: ['full_name'] }],
        order: [['created_at', 'ASC']],
      });

      const likesData = await getLikesData(artwork.id, user_id);
      artwork.dataValues.comments = comments;
      artwork.dataValues.likes = likesData.likes;
      artwork.dataValues.liked = likesData.liked;
    }

    res.render('artworks/myArtworks', { artworks, editingId: null });
  } catch (err) {
    console.error('Error fetching your artworks:', err);
    res.status(500).send('Error fetching your artworks');
  }
};

// Show edit form for an artwork
exports.editMyArtworksView = async (req, res) => {
  try {
    const user_id = req.session.user.id;
    const editingId = parseInt(req.params.id, 10);

    const artworks = await Artwork.findAll({
      where: { user_id },
      include: [{ model: User, as: 'artist', attributes: ['full_name', 'email'] }],
      order: [['created_at', 'DESC']],
    });

    for (const artwork of artworks) {
      const comments = await Comment.findAll({
        where: { artwork_id: artwork.id },
        include: [{ model: User, as: 'user', attributes: ['full_name'] }],
        order: [['created_at', 'ASC']],
      });

      const likesData = await getLikesData(artwork.id, user_id);
      artwork.dataValues.comments = comments;
      artwork.dataValues.likes = likesData.likes;
      artwork.dataValues.liked = likesData.liked;
    }

    res.render('artworks/myArtworks', { artworks, editingId });
  } catch (err) {
    console.error('Error loading edit view:', err);
    res.status(500).send('Error loading edit view');
  }
};

// Update artwork with new data
exports.updateArtwork = async (req, res) => {
  try {
    const user_id = req.session.user.id;
    const artwork_id = parseInt(req.params.id, 10);
    const { title, description } = req.body;

    const artwork = await Artwork.findByPk(artwork_id);

    if (!artwork) return res.status(404).send('Artwork not found');
    if (artwork.user_id !== user_id) return res.status(403).send('Unauthorized');

    const updateData = { title, description };

    if (req.file) {
      // New image uploaded
      updateData.image_url = `/uploads/${req.file.filename}`;
    }

    await artwork.update(updateData);

    res.redirect('/my-artworks');
  } catch (err) {
    console.error('Error updating artwork:', err);
    res.status(500).send('Error updating artwork');
  }
};

// Upload a new artwork
exports.uploadArtwork = async (req, res) => {
  try {
    const user_id = req.session.user.id;
    const { title, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !imageUrl) {
      return res.status(400).send('Title and artwork image are required');
    }

    await Artwork.create({
      title,
      description,
      image_url: imageUrl,
      user_id,
    });

    res.redirect('/my-artworks');
  } catch (err) {
    console.error('Error uploading artwork:', err);
    res.status(500).send('Error uploading artwork');
  }
};

// View a single artwork detail page
exports.viewArtwork = async (req, res) => {
  try {
    const user_id = req.session.user.id;
    const artwork_id = req.params.id;

    const artwork = await Artwork.findByPk(artwork_id, {
      include: [{ model: User, as: 'artist', attributes: ['full_name'] }],
    });

    if (!artwork) return res.status(404).send('Artwork not found');

    const comments = await Comment.findAll({
      where: { artwork_id },
      include: [{ model: User, as: 'user', attributes: ['full_name'] }],
      order: [['created_at', 'ASC']],
    });

    const likesData = await getLikesData(artwork_id, user_id);

    // Attach likes to artwork for rendering
    artwork.dataValues.likes = likesData.likes;
    artwork.dataValues.liked = likesData.liked;

    res.render('artworks/view', {
      artwork,
      comments, // pass separately to avoid EJS error
      user: req.session.user // optional, if EJS needs it
    });

  } catch (err) {
    console.error('Error viewing artwork:', err);
    res.status(500).send('Error viewing artwork');
  }
};
// Like or unlike an artwork
exports.likeArtwork = async (req, res) => {
  try {
    const userId = req.user.id;      // or req.session.user.id depending on your auth
    const artworkId = req.params.id;

    // Check if the user already liked the artwork
    const existingLike = await Like.findOne({
      where: { user_id: userId, artwork_id: artworkId },
    });

    if (existingLike) {
      // Unlike the artwork
      await existingLike.destroy();
    } else {
      // Like the artwork
      await Like.create({ user_id: userId, artwork_id: artworkId });
    }

    // Count total likes for this artwork
    const likesCount = await Like.count({
      where: { artwork_id: artworkId },
    });

    res.json({ liked: !existingLike, likes: likesCount });
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// Post a comment on artwork
exports.commentArtwork = async (req, res) => {
  try {
    const user_id = req.session.user.id;
    const artwork_id = req.params.id;
    const { comment } = req.body;

    if (!comment || comment.trim() === '') {
      return res.status(400).send('Comment cannot be empty');
    }

    await Comment.create({
      artwork_id,
      user_id,
      text: comment.trim(),
    });

    res.redirect(`/artworks/${artwork_id}`);
  } catch (err) {
    console.error('Error posting comment:', err);
    res.status(500).send('Error posting comment');
  }
};

exports.deleteArtwork = async (req, res) => {
  try {
    const user_id = req.session.user.id;
    const artwork_id = req.params.id;

    const artwork = await Artwork.findByPk(artwork_id);

    if (!artwork)
      return res.status(404).json({ success: false, message: 'Artwork not found' });

    if (artwork.user_id !== user_id)
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    // Delete all comments related to the artwork
    await Comment.destroy({ where: { artwork_id } });

    // Delete all likes related to the artwork
    await Like.destroy({ where: { artwork_id } });

    // Now delete the artwork itself
    await artwork.destroy();

    res.json({ success: true, message: 'Artwork deleted successfully' });
  } catch (err) {
    console.error('Error deleting artwork:', err);
    res.status(500).json({ success: false, message: 'Error deleting artwork' });
  }
};
