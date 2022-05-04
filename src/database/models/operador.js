const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return operador.init(sequelize, DataTypes);
}

class operador extends Sequelize.Model {
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
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'operador',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "operador_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return operador;
  }
}
