const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return horarios.init(sequelize, DataTypes);
}

class horarios extends Sequelize.Model {
    static init(sequelize, DataTypes) {
        super.init({
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            nombre: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            horainicio: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            horasdelturno: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            borrado: {
                type: DataTypes.BOOLEAN,
                allowNull: true
            },
            horafin: {
                type: DataTypes.STRING(255),
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'horarios',
            schema: 'public',
            timestamps: true,
            indexes: [
                {
                    name: "dethorasturnoaaa_pkey",
                    unique: true,
                    fields: [
                        {name: "id"},
                    ]
                },
                {
                    name: "horarios_pkey",
                    unique: true,
                    fields: [
                        {name: "id"},
                    ]
                },
            ]
        });
        return horarios;
    }
}
