const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return proceso.init(sequelize, DataTypes);
}

class proceso extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    idplanta: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'planta',
        key: 'id'
      }
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'proceso',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "proceso_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return proceso;
  }
}
