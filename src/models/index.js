
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Import Models
const User = require('./user')(sequelize, DataTypes);
const Category = require('./category')(sequelize, DataTypes);
const Product = require('./product')(sequelize, DataTypes);
const CartItem = require('./cart-item')(sequelize, DataTypes);
const WishlistItem = require('./wishlist-item')(sequelize, DataTypes);
const Order = require('./order')(sequelize, DataTypes);
const OrderItem = require('./order-item')(sequelize, DataTypes);
const Payment = require('./payment')(sequelize, DataTypes);
const RefreshToken = require('./refresh-token')(sequelize, DataTypes);


// User - RefreshToken Associations
User.hasMany(RefreshToken, {
    foreignKey: 'userId',
    as: 'refreshTokens'
});

RefreshToken.belongsTo(User, {
    foreignKey: 'userId'
});

// Category - SubCategory Self Association
Category.hasMany(Category, {
    foreignKey: 'sub_cat_id',
    as: 'subCategories'
});

Category.belongsTo(Category, {
    foreignKey: 'sub_cat_id',
    as: 'parentCategory'
});

Product.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category'
});

// User - CartItem Associations
User.hasMany(CartItem, {
    foreignKey: 'userId'
});

CartItem.belongsTo(User, {
    foreignKey: 'userId'
});

Product.hasMany(CartItem, {
    foreignKey: 'productId'
});

CartItem.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});

// User - WishlistItem Associations
User.hasMany(WishlistItem, {
    foreignKey: 'userId'
});

WishlistItem.belongsTo(User, {
    foreignKey: 'userId'
});

Product.hasMany(WishlistItem, {
    foreignKey: 'productId'
});

WishlistItem.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});

// User - Order Associations
User.hasMany(Order, {
    foreignKey: 'userId'
});

Order.belongsTo(User, {
    foreignKey: 'userId'
});

// Order - OrderItem Associations
Order.hasMany(OrderItem, {
    foreignKey: 'orderId',
    as: 'items'
});

OrderItem.belongsTo(Order, {
    foreignKey: 'orderId'
});

OrderItem.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});

// Order - Payment Associations
Order.hasOne(Payment, {
    foreignKey: 'orderId',
    as: 'payment'
});

Payment.belongsTo(Order, {
    foreignKey: 'orderId'
});

// Export Models
module.exports = {
    sequelize,
    User,
    Category,
    Product,
    CartItem,
    WishlistItem,
    Order,
    OrderItem,
    Payment,
    RefreshToken
};