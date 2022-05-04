const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return gruponot.init(sequelize, DataTypes);
}

class gruponot extends Sequelize.Model {
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
    }
  }, {
    sequelize,
    tableName: 'gruponot',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "gruponot_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "gruponot_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return gruponot;
  }
}
