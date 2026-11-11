module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Category',
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
            slug: {
                type: DataTypes.STRING(150),
                allowNull: false,
                unique: true
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            subCatId: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true,
                field: 'sub_cat_id'
            },
            status: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: true,
                field: 'status'
            }
        },
        {
            tableName: 'categories',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            underscored: true
        }
    );
};