const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return supervisor.init(sequelize, DataTypes);
}

class supervisor extends Sequelize.Model {
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
    usuario: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    foto: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'supervisor',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "supervisor_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "supervisor_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return supervisor;
  }
}
