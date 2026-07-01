const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const RoadmapItem = sequelize.define(
  "RoadmapItem",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    roadmap_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM("TODO", "IN_PROGRESS", "DONE"),
      defaultValue: "TODO"
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    created_by: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    updated_by: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
  tableName: "roadmap_items",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
}
);

module.exports = RoadmapItem;
