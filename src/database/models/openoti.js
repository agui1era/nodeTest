const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return openoti.init(sequelize, DataTypes);
}

class openoti extends Sequelize.Model {
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
      idnotificacion: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: 'notificacion',
          key: 'id'
        }
      },
      fechaleido: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      sequelize,
      tableName: 'openoti',
      schema: 'public',
      timestamps: true,
      indexes: [
        {
          name: "openoti_pk",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "openoti_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    });
    return openoti;
  }
}
