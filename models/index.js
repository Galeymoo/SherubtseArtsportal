const sequelize = require('../config/db');

// Import models
const User = require('./User'); // not './user'
const Artwork = require('./artwork');
const Comment = require('./comment');
const Like = require('./like');

// 1. User can upload many artworks
User.hasMany(Artwork, { foreignKey: 'user_id', as: 'artworks' });

// 2. Each artwork belongs to one user (artist)
Artwork.belongsTo(User, { foreignKey: 'user_id', as: 'artist' });

// 3. Many-to-many: Users can like many artworks
Artwork.belongsToMany(User, { through: Like, foreignKey: 'artwork_id', as: 'usersWhoLiked' });
User.belongsToMany(Artwork, { through: Like, foreignKey: 'user_id', as: 'userLikedArtworks' });

// 4. User has many comments
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' }); // for eager loading

// 5. Artwork has many comments
Artwork.hasMany(Comment, { foreignKey: 'artwork_id', as: 'comments' });
Comment.belongsTo(Artwork, { foreignKey: 'artwork_id', as: 'artwork' });

const db = { sequelize, User, Artwork, Comment, Like };

module.exports = db;
