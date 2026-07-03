const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Task = require('./Task');
const User = require('./User');

const Comment = sequelize.define('Comment', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    task_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: { model: Task, key: 'id' }
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: { model: User, key: 'id' }
    },
    parent_comment_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    deleted_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: { model: User, key: 'id' }
    }
}, {
    tableName: 'task_comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

Task.hasMany(Comment, { foreignKey: 'task_id', as: 'comments' });
Comment.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });

User.hasMany(Comment, { foreignKey: 'user_id', as: 'user_comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Comment, { foreignKey: 'deleted_by', as: 'deleted_comments' });
Comment.belongsTo(User, { foreignKey: 'deleted_by', as: 'deleter' });

Comment.hasMany(Comment, { foreignKey: 'parent_comment_id', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parent_comment_id', as: 'parent' });

module.exports = Comment;
