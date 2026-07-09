const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Project = sequelize.define('Project', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'),
        allowNull: false,
        defaultValue: 'ACTIVE'
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    manager_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: User,
            key: 'id'
        }
    },
    created_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: User,
            key: 'id'
        }
    },
    updated_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: User,
            key: 'id'
        }
    }
}, {
    tableName: 'projects',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    defaultScope: {
        where: {
            is_deleted: false
        }
    }
});

Project.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });
Project.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Project.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });

User.hasMany(Project, { foreignKey: 'manager_id', as: 'managed_projects' });

module.exports = Project;
