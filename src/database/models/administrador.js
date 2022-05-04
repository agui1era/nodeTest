const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return administrador.init(sequelize, DataTypes);
}

class administrador extends Sequelize.Model {
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
    apellido: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    foto: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    usuario: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'administrador',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "administrador_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return administrador;
  }
}
