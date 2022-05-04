const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return categoriasensor.init(sequelize, DataTypes);
}

class categoriasensor extends Sequelize.Model {
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
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'categoriasensor',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "categoriasensor_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "categoriasensor_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return categoriasensor;
  }
}
