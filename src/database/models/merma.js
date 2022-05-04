const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return merma.init(sequelize, DataTypes);
}

class merma extends Sequelize.Model {
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
    tableName: 'merma',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "merma_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return merma;
  }
}
