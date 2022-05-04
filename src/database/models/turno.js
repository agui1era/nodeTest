const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return turno.init(sequelize, DataTypes);
}

class turno extends Sequelize.Model {
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
    idhorario: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'horarios',
        key: 'id'
      }
    },
    horainicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    velocidad: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    sensor: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    mermas: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    produccionesperada: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    horario: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    procesado: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    prodtotal: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    horastotales: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dia: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    horafin: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'turno',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "turno_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "turno_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return turno;
  }
}
