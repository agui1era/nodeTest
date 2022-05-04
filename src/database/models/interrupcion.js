const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return interrupcion.init(sequelize, DataTypes);
}

class interrupcion extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    horainicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    duracion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tipo: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'parada',
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
    idturno: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'turno',
        key: 'id'
      }
    },
    necesitaconfirmacion: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    quiennecesitaconfirmacion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    quiennecesitaconfirmacionuser: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    quiencreaconfirmacion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    quiencreaconfirmacionuser: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    comentario: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'interrupcion',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "interrupcion_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "interrupcion_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return interrupcion;
  }
}
