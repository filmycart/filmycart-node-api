'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('refresh_tokens', {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false
            },

            user_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },

            token_hash: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: true
            },

            expires_at: {
                type: Sequelize.DATE,
                allowNull: false
            },

            revoked_at: {
                type: Sequelize.DATE,
                allowNull: true
            },

            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },

            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        await queryInterface.addIndex(
            'refresh_tokens',
            ['user_id']
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable('refresh_tokens');
    }
};