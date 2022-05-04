const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return tiponotificacion.init(sequelize, DataTypes);
}

class tiponotificacion extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idtiposuscripcion: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'tiposuscripcion',
        key: 'id'
      }
    },
    idmaquina: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'maquina',
        key: 'id'
      }
    },
    idordendetrabajo: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'ordendetrabajo',
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
    info: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tiponotificacion',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "tiponotificacion_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "tiponotificacion_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return tiponotificacion;
  }
}
