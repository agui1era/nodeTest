const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return productoturno.init(sequelize, DataTypes);
}

class productoturno extends Sequelize.Model {
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
    idturno: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'turno',
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
    serie: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    formato: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    formatounidad: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    condicion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    activoenturno: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    cantidadesperada: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    mermas: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    velocidad: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'productoturno',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "productoturno_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "productoturno_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return productoturno;
  }
}
