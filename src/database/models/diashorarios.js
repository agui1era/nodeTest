const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return diashorarios.init(sequelize, DataTypes);
}

class diashorarios extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idhorarios: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'horarios',
        key: 'id'
      }
    },
    iddiaspermitidos: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'diaspermitidos',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'diashorarios',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "diashorarios_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "diashorarios_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return diashorarios;
  }
}
