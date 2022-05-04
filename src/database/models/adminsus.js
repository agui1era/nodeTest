const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return adminsus.init(sequelize, DataTypes);
}

class adminsus extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    super.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      idadministrador: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: 'administrador',
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
      tableName: 'adminsus',
      schema: 'public',
      timestamps: true,
      indexes: [
        {
          name: "adminsus_pk",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "adminsus_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    });
    return adminsus;
  }
}
