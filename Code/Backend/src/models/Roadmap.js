const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Roadmap = sequelize.define(
  "Roadmap",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    project_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
  tableName: "roadmaps",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
}
);

module.exports = Roadmap;
