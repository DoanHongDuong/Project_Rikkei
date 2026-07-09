const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Project = require('./Project');
const User = require('./User');

const ProjectMember = sequelize.define('ProjectMember', {
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
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    role: {
        type: DataTypes.ENUM('MEMBER', 'LEAD', 'REVIEWER'),
        allowNull: false,
        defaultValue: 'MEMBER'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    joined_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    left_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    added_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: User,
            key: 'id'
        }
    }
}, {
    tableName: 'project_members',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['project_id', 'user_id']
        }
    ]
});

Project.hasMany(ProjectMember, { foreignKey: 'project_id', as: 'members' });
ProjectMember.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
ProjectMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
ProjectMember.belongsTo(User, { foreignKey: 'added_by', as: 'adder' });

User.hasMany(ProjectMember, { foreignKey: 'user_id', as: 'project_memberships' });

module.exports = ProjectMember;
