const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Project = require('./Project');
const User = require('./User');
const RoadmapItem = require('./RoadmapItem');

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    project_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Project,
            key: 'id'
        }
    },
    roadmap_item_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    parent_task_id: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    assignee_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: User,
            key: 'id'
        }
    },
    created_by: {
        type: DataTypes.BIGINT,
        allowNull: false,
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
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('TODO', 'IN_PROGRESS', 'REVIEW', 'BLOCKED', 'DONE', 'CANCELED'),
        allowNull: false,
        defaultValue: 'TODO'
    },
    priority: {
        type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
        allowNull: false,
        defaultValue: 'MEDIUM'
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    deadline: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true
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
        references: {
            model: User,
            key: 'id'
        }
    }
}, {
    tableName: 'tasks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    defaultScope: {
        where: {
            is_deleted: false
        }
    }
});

Task.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Task.belongsTo(User, { foreignKey: 'assignee_id', as: 'assignee' });
Task.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Task.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });
Task.belongsTo(User, { foreignKey: 'deleted_by', as: 'deleter' });
Task.belongsTo(RoadmapItem, { foreignKey: 'roadmap_item_id', as: 'roadmapItem' });

Project.hasMany(Task, { foreignKey: 'project_id', as: 'tasks' });
User.hasMany(Task, { foreignKey: 'assignee_id', as: 'assigned_tasks' });
RoadmapItem.hasMany(Task, { foreignKey: 'roadmap_item_id', as: 'tasks' });

module.exports = Task;