const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return detgrupnot.init(sequelize, DataTypes);
}

class detgrupnot extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    idgruponot: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'gruponot',
        key: 'id'
      }
    },
    idmaquina: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'maquina',
        key: 'id'
      }
    },
    idtiposuscripcion: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'tiposuscripcion',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'detgrupnot',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "detgrupnot_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "detgrupnot_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return detgrupnot;
  }
}
