const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return categoriadeparada.init(sequelize, DataTypes);
}

class categoriadeparada extends Sequelize.Model {
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
      allowNull: false
    },
    tipo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    clase: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    color: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    colorText: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    requiereInventario: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    alertacritica: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'categoriadeparada',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "categoriadeparada_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "categoriadeparada_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return categoriadeparada;
  }
}
