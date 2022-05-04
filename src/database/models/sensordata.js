const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return sensordata.init(sequelize, DataTypes);
}

class sensordata extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idsensor: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    idmaquina: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    idsubproducto: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'subproducto',
        key: 'id'
      }
    },
    idordendetrabajo: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'ordendetrabajo',
        key: 'id'
      }
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: true
    },
    produccion: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'sensordata',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "sensordata_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "sensordata_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return sensordata;
  }
}
