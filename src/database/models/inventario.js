const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return inventario.init(sequelize, DataTypes);
}

class inventario extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    categoria: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sku: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    stock: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'inventario',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "inventario_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return inventario;
  }
}
