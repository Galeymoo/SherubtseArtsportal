// models/Artwork.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Artwork = sequelize.define('Artwork', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  image_url: {
    type: DataTypes.TEXT,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'artworks',
  timestamps: false, // or true if using Sequelize's createdAt/updatedAt
});

module.exports = Artwork;
