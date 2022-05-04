const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return detturoperador.init(sequelize, DataTypes);
}

class detturoperador extends Sequelize.Model {
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
    idturno: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'turno',
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
    }
  }, {
    sequelize,
    tableName: 'detturoperador',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "detturoperador_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return detturoperador;
  }
}
