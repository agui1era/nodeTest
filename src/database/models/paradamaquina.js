const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return paradamaquina.init(sequelize, DataTypes);
}

class paradamaquina extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idmaquina: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'maquina',
        key: 'id'
      }
    },
    idparada: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'parada',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'paradamaquina',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "paradamaquina_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "paradamaquina_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return paradamaquina;
  }
}
