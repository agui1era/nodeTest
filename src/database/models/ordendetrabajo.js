const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return ordendetrabajo.init(sequelize, DataTypes);
}

class ordendetrabajo extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idsubproducto: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'subproducto',
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
    idproceso: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'proceso',
        key: 'id'
      }
    },
    idplanta: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'planta',
        key: 'id'
      }
    },
    horainicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    horainicioaccion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    formatoelegido: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    residuos: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    condicionelegida: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    unidadelegida: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    codigo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    estado: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    foto: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    creador: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    quiencomienza: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    quientermina: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tiempototal: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    creadoruser: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    quiencomienzauser: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    quienterminauser: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    horafinpredecida: {
      type: DataTypes.DATE,
      allowNull: true
    },
    horafincorte: {
      type: DataTypes.DATE,
      allowNull: true
    },
    horafinconfirmada: {
      type: DataTypes.DATE,
      allowNull: true
    },

    cantidadactual: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    borrado: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    cantidadesperada: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ordendetrabajo',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "ordendetrabajo_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "ordendetrabajo_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return ordendetrabajo;
  }
}
