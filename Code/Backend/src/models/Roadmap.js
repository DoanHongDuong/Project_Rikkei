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
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM("PLANNED", "ACTIVE", "COMPLETED", "ARCHIVED"),
      defaultValue: "PLANNED"
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
  tableName: "roadmaps",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
}
);

module.exports = Roadmap;
