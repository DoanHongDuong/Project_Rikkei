const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Task = require('./Task');
const User = require('./User');

const TaskHistory = sequelize.define('TaskHistory', {
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
    updated_by: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    action_type: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    field_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    old_value: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    new_value: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'task_history',
    timestamps: false
});

Task.hasMany(TaskHistory, { foreignKey: 'task_id', as: 'history' });
TaskHistory.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });
TaskHistory.belongsTo(User, { foreignKey: 'updated_by', as: 'updatedBy' });

module.exports = TaskHistory;
