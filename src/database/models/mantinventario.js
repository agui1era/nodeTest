const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return mantinventario.init(sequelize, DataTypes);
}

class mantinventario extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tipo: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'parada',
        key: 'id'
      }
    },
    idinventario: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'inventario',
        key: 'id'
      }
    },
    cantidad: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'mantinventario',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "mantinventario_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return mantinventario;
  }
}
