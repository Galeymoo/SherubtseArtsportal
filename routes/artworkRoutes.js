const express = require('express');
const artworkController = require('../controllers/artworkController');
const { ensureAuth } = require('../middleware/authMiddleware');

module.exports = function(upload) {
  const router = express.Router();

  router.get('/feed', ensureAuth, artworkController.feed);
  router.get('/my-artworks', ensureAuth, artworkController.myArtworks);
  router.get('/artworks/:id', ensureAuth, artworkController.viewArtwork);
  router.post('/upload', ensureAuth, upload.single('image'), artworkController.uploadArtwork);
  router.post('/artworks/:id/like', ensureAuth, artworkController.likeArtwork);
  router.post('/artworks/:id/comment', ensureAuth, artworkController.commentArtwork);
  router.delete('/artworks/:id', ensureAuth, artworkController.deleteArtwork);

  // Edit artwork routes:
  router.get('/my-artworks/edit/:id', ensureAuth, artworkController.editMyArtworksView);
  router.post('/my-artworks/edit/:id', ensureAuth, upload.single('image'), artworkController.updateArtwork);

  return router;
};
