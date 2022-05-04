const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return indicadoresevents.init(sequelize, DataTypes);
}

class indicadoresevents extends Sequelize.Model {
    static init(sequelize, DataTypes) {
        super.init({
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },

            maquina: {
                type: DataTypes.STRING(255),
                allowNull: true
            },

            subproducto: {
                type: DataTypes.STRING(255),
                allowNull: true
            },

            ordendetrabajo: {
                type: DataTypes.STRING(255),
                allowNull: true
            },

            turno: {
                type: DataTypes.STRING(255),
                allowNull: true
            },

            ts: {
                type: DataTypes.DATE,
                allowNull: true
            },
            tipo: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            indicador: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            valor: {
                type: DataTypes.INTEGER,
                allowNull: true
            },

        }, {
            sequelize,
            tableName: 'indicadoresevents',
            schema: 'public',
            timestamps: false,
            indexes: [
                {
                    name: "indicadoresevents_pk",
                    unique: true,
                    fields: [
                        {name: "id"},
                    ]
                },
                {
                    name: "indicadoresevents_pkey",
                    unique: true,
                    fields: [
                        {name: "id"},
                    ]
                },
            ]
        });
        return indicadoresevents;
    }
}
