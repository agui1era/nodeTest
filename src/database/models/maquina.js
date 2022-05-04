const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return maquina.init(sequelize, DataTypes);
}

class maquina extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    conSensor: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    oeeesperado: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lugar: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    subproductoasignado: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    idproceso: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'proceso',
        key: 'id'
      }
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'maquina',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "maquina_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return maquina;
  }
}
