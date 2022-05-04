const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return notificacion.init(sequelize, DataTypes);
}

class notificacion extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idtiponotificacion: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'tiponotificacion',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'notificacion',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "notificacion_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "notificacion_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return notificacion;
  }
}
