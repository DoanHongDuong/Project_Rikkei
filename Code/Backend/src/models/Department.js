const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Department = sequelize.define(
  "Department",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
}, {
    tableName: "departments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
}   
);

module.exports = Department;