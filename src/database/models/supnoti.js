const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return supnoti.init(sequelize, DataTypes);
}

class supnoti extends Sequelize.Model {
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
    tableName: 'supnoti',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "supnoti_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "supnoti_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return supnoti;
  }
}
