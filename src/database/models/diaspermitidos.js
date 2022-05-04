const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return diaspermitidos.init(sequelize, DataTypes);
}

class diaspermitidos extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      //primaryKey: true
    },
    permitido: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    num: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'diaspermitidos',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "diaspermitidos_pk",
        unique: true,
        fields: [
          { name: "nombre" },
        ]
      },
      {
        name: "diaspermitidos_pkey",
        unique: true,
        fields: [
          { name: "nombre" },
        ]
      },
    ]
  });
  return diaspermitidos;
  }
}
