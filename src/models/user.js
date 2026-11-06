module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },

            name: {
                type: DataTypes.STRING(120),
                allowNull: false
            },

            email: {
                type: DataTypes.STRING(190),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true
                }
            },

            phone: {
                type: DataTypes.STRING(20),
                allowNull: true,
                unique: true
            },

            password: {
                type: DataTypes.STRING(255),
                allowNull: false
            },

            //role: {
            //    type: DataTypes.ENUM('customer', 'admin'),
            //    defaultValue: 'customer'
            //},

            //status: {
            //    type: DataTypes.ENUM('active', 'blocked'),
            //    defaultValue: 'active'
            //}
        },
        {
            tableName: 'users',

            defaultScope: {
                attributes: {
                    exclude: ['password']
                }
            },

            scopes: {
                withPassword: {
                    attributes: {}
                }
            }
        }
    );

    return User;
};