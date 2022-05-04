const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return parada.init(sequelize, DataTypes);
}

class parada extends Sequelize.Model {
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
    idmaqrel: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    inventarioreq: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    idcategoriaparada: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'categoriadeparada',
        key: 'id'
      }
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'parada',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "parada_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return parada;
  }
}
