const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return tiposuscripcion.init(sequelize, DataTypes);
}

class tiposuscripcion extends Sequelize.Model {
    static init(sequelize, DataTypes) {
        super.init({
            id: {
                autoIncrement: true,
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true
            },
            gatillo: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            tipo: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

        }, {
            sequelize,
            tableName: 'tiposuscripcion',
            schema: 'public',
            timestamps: true,
            indexes: [
                {
                    name: "tiposuscripcion_pk",
                    unique: true,
                    fields: [
                        {name: "id"},
                    ]
                },
                {
                    name: "tiposuscripcion_pkey",
                    unique: true,
                    fields: [
                        {name: "id"},
                    ]
                },
            ]
        });
        return tiposuscripcion;
    }
}
