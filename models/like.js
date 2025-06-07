// models/Like.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  artwork_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'likes',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'artwork_id'], // Ensure unique like per user per artwork
    },
  ],
});

module.exports = Like;
