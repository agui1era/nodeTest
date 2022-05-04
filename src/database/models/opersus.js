const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return opersus.init(sequelize, DataTypes);
}

class opersus extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      idoperador: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: 'operador',
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
      idtiposuscripcion: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: 'tiposuscripcion',
          key: 'id'
        }
      }
    }, {
      sequelize,
      tableName: 'opersus',
      schema: 'public',
      timestamps: true,
      indexes: [
        {
          name: "opersus_pk",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "opersus_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    });
    return opersus;
  }
}
