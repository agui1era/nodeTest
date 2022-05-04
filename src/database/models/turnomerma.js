const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return turnomerma.init(sequelize, DataTypes);
}

class turnomerma extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idordendetrabajo: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'ordendetrabajo',
        key: 'id'
      }
    },
    idmerma: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'merma',
        key: 'id'
      }
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    problema: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    accion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    responsable: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    operador: {
      type: DataTypes.STRING(255),
      allowNull: true
    },



  }, {
    sequelize,
    tableName: 'turnomerma',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "turnomerma_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "turnomerma_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return turnomerma;
  }
}
