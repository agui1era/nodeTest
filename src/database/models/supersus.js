const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return supersus.init(sequelize, DataTypes);
}

class supersus extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      idsupervisor: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: 'supervisor',
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
      tableName: 'supersus',
      schema: 'public',
      timestamps: true,
      indexes: [
        {
          name: "supersus_pk",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "supersus_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    });
    return supersus;
  }
}
