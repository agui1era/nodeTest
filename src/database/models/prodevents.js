const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return prodevents.init(sequelize, DataTypes);
}

class prodevents extends Sequelize.Model {
    static init(sequelize, DataTypes) {
        super.init({
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            ts: {
                type: DataTypes.DATE,
                allowNull: true
            },

            cantidad: {
                type: DataTypes.INTEGER,
                allowNull: true
            },


            maquina: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            ordendetrabajo: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            ordendetrabajotiempo: {
                type: DataTypes.STRING(255),
                allowNull: true
            },

            turno: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            turnotiempo: {
                type: DataTypes.STRING(255),
                allowNull: true
            },

            horario: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            producto: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            subproducto: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            modo: {
                type: DataTypes.STRING(255),
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'prodevents',
            schema: 'public',
            timestamps: true,
            indexes: [
                {
                    name: "prodevents_pk",
                    unique: true,
                    fields: [
                        {name: "id"},
                    ]
                },
                {
                    name: "prodevents_pkey",
                    unique: true,
                    fields: [
                        {name: "id"},
                    ]
                },
            ]
        });
        return prodevents;
    }
}
