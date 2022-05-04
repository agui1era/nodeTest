const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return subproducto.init(sequelize, DataTypes);
}

class subproducto extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true
    },
    formato: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pesoenvase: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pesofinal: {
      type: DataTypes.STRING,
      allowNull: true
    },
    esperadooee: {
      type: DataTypes.STRING,
      allowNull: true
    },
    esperadomerma: {
      type: DataTypes.STRING,
      allowNull: true
    },
    unidad: {
      type: DataTypes.STRING,
      allowNull: true
    },

    condicion: {
      type: DataTypes.STRING,
      allowNull: true
    },

    sku: {
      type: DataTypes.STRING,
      allowNull: true
    },
    velprod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    stdprod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    idproducto: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'producto',
        key: 'id'
      }
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'subproducto',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "subproducto_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return subproducto;
  }
}
