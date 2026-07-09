const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Task = require('./Task');
const User = require('./User');

const ExtensionRequest = sequelize.define('ExtensionRequest', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    task_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Task,
            key: 'id'
        }
    },
    requester_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    reviewed_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: User,
            key: 'id'
        }
    },
    current_deadline: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    requested_deadline: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'PENDING'
    },
    review_note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    requested_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'extension_requests',
    timestamps: false
});

// Associations
Task.hasMany(ExtensionRequest, { foreignKey: 'task_id', as: 'extensionRequests' });
ExtensionRequest.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });

User.hasMany(ExtensionRequest, { foreignKey: 'requester_id', as: 'requestedExtensions' });
ExtensionRequest.belongsTo(User, { foreignKey: 'requester_id', as: 'requester' });

User.hasMany(ExtensionRequest, { foreignKey: 'reviewed_by', as: 'reviewedExtensions' });
ExtensionRequest.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

module.exports = ExtensionRequest;
