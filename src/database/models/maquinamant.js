const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return maquinamant.init(sequelize, DataTypes);
}

class maquinamant extends Sequelize.Model {
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
    },
    cadacuanto: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    duracion: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'maquinamant',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "maquinamant_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "maquinamant_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return maquinamant;
  }
}
