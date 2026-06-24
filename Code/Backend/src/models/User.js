const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Department = require("./Department");

const User = sequelize.define('User', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    full_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('ADMIN', 'PM', 'MEMBER'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'DISABLED'),
        allowNull: false,
        defaultValue: 'ACTIVE'
    },
    department_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: Department,
            key: 'id'
        }
    }
    ,
    password_changed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_login_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
});

Department.hasMany(User, { foreignKey: 'department_id' });
User.belongsTo(Department, { foreignKey: 'department_id' });
module.exports = User;