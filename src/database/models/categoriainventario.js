const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return categoriainventario.init(sequelize, DataTypes);
}

class categoriainventario extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'categoriainventario',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "categoriainventario_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "categoriainventario_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return categoriainventario;
  }
}
