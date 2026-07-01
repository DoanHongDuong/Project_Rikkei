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
      type: DataTypes.STRING(255),
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM("TODO", "IN_PROGRESS", "DONE"),
      defaultValue: "TODO"
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
  tableName: "roadmap_items",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
}
);

module.exports = RoadmapItem;
