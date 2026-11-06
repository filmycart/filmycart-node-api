module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'RefreshToken',
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },

            userId: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false
            },

            tokenHash: {
                type: DataTypes.STRING(64),
                allowNull: false,
                unique: true
            },

            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false
            },

            revokedAt: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        {
            tableName: 'refresh_tokens',
            timestamps: true,
            underscored: true
        }
    );
};