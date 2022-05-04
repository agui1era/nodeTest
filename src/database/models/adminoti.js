const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return adminoti.init(sequelize, DataTypes);
}

class adminoti extends Sequelize.Model {
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
      tableName: 'adminoti',
      schema: 'public',
      timestamps: true,
      indexes: [
        {
          name: "adminoti_pk",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
        {
          name: "adminoti_pkey",
          unique: true,
          fields: [
            { name: "id" },
          ]
        },
      ]
    });
    return adminoti;
  }
}
