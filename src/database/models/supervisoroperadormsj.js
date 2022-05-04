const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return supervisoroperadormsj.init(sequelize, DataTypes);
}

class supervisoroperadormsj extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idsupervisor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'supervisor',
        key: 'id'
      }
    },
    mensaje: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    idoperador: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'operador',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'supervisoroperadormsj',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "supervisoroperadormsj_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return supervisoroperadormsj;
  }
}
