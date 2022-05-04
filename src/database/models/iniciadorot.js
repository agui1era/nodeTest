const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return iniciadorot.init(sequelize, DataTypes);
}

class iniciadorot extends Sequelize.Model {
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
    username: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    creador: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'iniciadorot',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "iniciadorot_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "iniciadorot_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return iniciadorot;
  }
}
