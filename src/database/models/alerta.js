const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return alerta.init(sequelize, DataTypes);
}

class alerta extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idturno: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'turno',
        key: 'id'
      }
    },
    observacion: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'alerta',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "alerta_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "alerta_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return alerta;
  }
}
