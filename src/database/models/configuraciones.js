const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return configuraciones.init(sequelize, DataTypes);
}

class configuraciones extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    pais: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    nombreempresa: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    foto: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    thingsboardurl: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'configuraciones',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "configuraciones_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "newtpk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return configuraciones;
  }
}
