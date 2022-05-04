const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return subproductosmaquina.init(sequelize, DataTypes);
}

class subproductosmaquina extends Sequelize.Model {
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
      allowNull: false,
      references: {
        model: 'maquina',
        key: 'id'
      }
    },
    idsubproducto: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'subproducto',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'subproductosmaquina',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "subproductosmaquina_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return subproductosmaquina;
  }
}
