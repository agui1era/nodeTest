const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return dettursupervisor.init(sequelize, DataTypes);
}

class dettursupervisor extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idturno: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'turno',
        key: 'id'
      }
    },
    idsupervisor: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'supervisor',
        key: 'id'
      }
    },
    horainicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    horafin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    idalerta: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'dettursupervisor',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "dettursupervisor_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return dettursupervisor;
  }
}
