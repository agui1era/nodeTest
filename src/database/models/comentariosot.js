const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return comentariosot.init(sequelize, DataTypes);
}

class comentariosot extends Sequelize.Model {
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
    comentario: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    creador:{
      type: DataTypes.STRING(255),
      allowNull: true
    },
    borrado:{
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'comentariosot',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "comentariosot_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "comentariosot_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return comentariosot;
  }
}
