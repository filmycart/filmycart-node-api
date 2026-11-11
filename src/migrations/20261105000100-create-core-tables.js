
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {

        // Users Table
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING(120),
                allowNull: false
            },
            email: {
                type: Sequelize.STRING(190),
                allowNull: false,
                unique: true
            },
            phone: {
                type: Sequelize.STRING(20),
                unique: true
            },
            password: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            role: {
                type: Sequelize.ENUM('customer', 'admin'),
                defaultValue: 'customer'
            },
            status: {
                type: Sequelize.ENUM('active', 'blocked'),
                defaultValue: 'active'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Categories Table
        await queryInterface.createTable('categories', {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING(120),
                allowNull: false
            },
            slug: {
                type: Sequelize.STRING(150),
                allowNull: false,
                unique: true
            },
            description: Sequelize.TEXT,
            sub_cat_id: {
                type: Sequelize.BIGINT.UNSIGNED
            },
            status: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Products Table
        await queryInterface.createTable('products', {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            category_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                references: {
                    model: 'categories',
                    key: 'id'
                },
                onDelete: 'SET NULL'
            },
            name: {
                type: Sequelize.STRING(200),
                allowNull: false
            },
            slug: {
                type: Sequelize.STRING(220),
                allowNull: false,
                unique: true
            },
            sku: {
                type: Sequelize.STRING(80),
                allowNull: false,
                unique: true
            },
            description: Sequelize.TEXT,
            price: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false
            },
            sale_price: Sequelize.DECIMAL(12, 2),
            stock: {
                type: Sequelize.INTEGER.UNSIGNED,
                defaultValue: 0
            },
            image_url: Sequelize.STRING(500),
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Cart Items Table
        await queryInterface.createTable('cart_items', {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            product_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'products',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            quantity: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 1
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        await queryInterface.addConstraint('cart_items', {
            fields: ['user_id', 'product_id'],
            type: 'unique',
            name: 'cart_user_product_unique'
        });

        // Wishlist Items Table
        await queryInterface.createTable('wishlist_items', {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            product_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'products',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        await queryInterface.addConstraint('wishlist_items', {
            fields: ['user_id', 'product_id'],
            type: 'unique',
            name: 'wishlist_user_product_unique'
        });

        // Orders Table
        await queryInterface.createTable('orders', {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            order_number: {
                type: Sequelize.STRING(40),
                allowNull: false,
                unique: true
            },
            user_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            subtotal: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false
            },
            shipping_amount: {
                type: Sequelize.DECIMAL(12, 2),
                defaultValue: 0
            },
            total_amount: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false
            },
            currency: {
                type: Sequelize.STRING(3),
                defaultValue: 'INR'
            },
            status: {
                type: Sequelize.ENUM(
                    'pending',
                    'confirmed',
                    'processing',
                    'shipped',
                    'delivered',
                    'cancelled'
                ),
                defaultValue: 'pending'
            },
            payment_status: {
                type: Sequelize.ENUM(
                    'unpaid',
                    'paid',
                    'failed',
                    'refunded'
                ),
                defaultValue: 'unpaid'
            },
            shipping_address: {
                type: Sequelize.JSON,
                allowNull: false
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Order Items Table
        await queryInterface.createTable('order_items', {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            order_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'orders',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            product_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'products',
                    key: 'id'
                }
            },
            product_name: {
                type: Sequelize.STRING(200),
                allowNull: false
            },
            sku: {
                type: Sequelize.STRING(80),
                allowNull: false
            },
            unit_price: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false
            },
            quantity: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false
            },
            line_total: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Payments Table
        await queryInterface.createTable('payments', {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            order_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                unique: true,
                references: {
                    model: 'orders',
                    key: 'id'
                }
            },
            provider: {
                type: Sequelize.STRING(40),
                allowNull: false
            },
            provider_order_id: Sequelize.STRING(120),
            provider_payment_id: Sequelize.STRING(120),
            amount: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false
            },
            currency: {
                type: Sequelize.STRING(3),
                defaultValue: 'INR'
            },
            status: {
                type: Sequelize.ENUM(
                    'created',
                    'authorized',
                    'captured',
                    'failed',
                    'refunded'
                ),
                defaultValue: 'created'
            },
            raw_response: Sequelize.JSON,
            created_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Refresh Tokens Table
        await queryInterface.createTable('refresh_tokens', {
            id: {
                type: Sequelize.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            token_hash: {
                type: Sequelize.STRING(64),
                allowNull: false,
                unique: true
            },
            expires_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            revoked_at: Sequelize.DATE,
            created_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });
    },

    async down(queryInterface) {
        const tables = [
            'refresh_tokens',
            'payments',
            'order_items',
            'orders',
            'wishlist_items',
            'cart_items',
            'products',
            'categories',
            'users'
        ];

        for (const table of tables) {
            await queryInterface.dropTable(table);
        }
    }
};
