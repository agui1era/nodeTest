const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return planta.init(sequelize, DataTypes);
}

class planta extends Sequelize.Model {
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
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'planta',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "planta_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return planta;
  }
}
