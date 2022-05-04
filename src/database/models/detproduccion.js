const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return detproduccion.init(sequelize, DataTypes);
}

class detproduccion extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    hora: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    cantidad: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    idprodturn: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'productoturno',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'detproduccion',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "detproduccion_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "detproduccion_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return detproduccion;
  }
}
