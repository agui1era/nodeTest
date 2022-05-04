const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return ordendetrabajopausa.init(sequelize, DataTypes);
}

class ordendetrabajopausa extends Sequelize.Model {
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
    horainicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    horareanuda: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ordendetrabajopausa',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "ordendetrabajopausa_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "ordendetrabajopausa_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return ordendetrabajopausa;
  }
}
