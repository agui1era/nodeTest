const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return sensor.init(sequelize, DataTypes);
}

class sensor extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idcategoriasensor: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'categoriasensor',
        key: 'id'
      }
    },
    idmaquina: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'maquina',
        key: 'id'
      }
    },
    idreferencia: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'sensor',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "sensor_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "sensor_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return sensor;
  }
}
