const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return mantencion.init(sequelize, DataTypes);
}

class mantencion extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    fechaprogramada: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecharealizada: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecharealizadafin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    quiencrea: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    quienempieza: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    quientermina: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    idinterrupcion: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'interrupcion',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'mantencion',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "mantencion_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return mantencion;
  }
}
