const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return produccionmaquina.init(sequelize, DataTypes);
}

class produccionmaquina extends Sequelize.Model {
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
    idproducto: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'producto',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'produccionmaquina',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "produccionmaquina_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return produccionmaquina;
  }
}
