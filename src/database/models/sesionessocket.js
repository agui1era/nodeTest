const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return sesionessocket.init(sequelize, DataTypes);
}

class sesionessocket extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idsocket: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'sesionessocket',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "sesionessocket_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "sesionessocket_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return sesionessocket;
  }
}
