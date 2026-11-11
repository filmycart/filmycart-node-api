
const { Op } = require('sequelize');
const { Product, Category } = require('../models');

// Get Products (with pagination, search, category and price filters)
exports.products = async (req, res, next) => {
    try {
        const page = Math.max(1, Number(req.query.page || 1));
        const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));

        const where = {
            isActive: true
        };

        // Filter by Category
        if (req.query.categoryId) {
            where.categoryId = req.query.categoryId;
        }

        // Search by Product Name
        if (req.query.q) {
            where.name = {
                [Op.like]: `%${req.query.q}%`
            };
        }

        // Filter by Price Range
        if (req.query.minPrice || req.query.maxPrice) {
            where.price = {
                [Op.between]: [
                    Number(req.query.minPrice || 0),
                    Number(req.query.maxPrice || 999999999)
                ]
            };
        }

        const result = await Product.findAndCountAll({
            where,
            include: [
                {
                    model: Category,
                    as: 'category'
                }
            ],
            limit,
            offset: (page - 1) * limit,
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: result.rows,
            meta: {
                page,
                limit,
                total: result.count,
                pages: Math.ceil(result.count / limit)
            }
        });

    } catch (e) {
        next(e);
    }
};

// Get Single Product by ID or Slug
exports.product = async (req, res, next) => {
    try {
        const p = await Product.findOne({
            where: {
                [Op.or]: [
                    { id: req.params.id },
                    { slug: req.params.id }
                ],
                isActive: true
            },
            include: [
                {
                    model: Category,
                    as: 'category'
                }
            ]
        });

        if (!p) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: p
        });

    } catch (e) {
        next(e);
    }
};

// Create Product
exports.createProduct = async (req, res, next) => {
    try {
        const p = await Product.create(req.body);

        res.status(201).json({
            success: true,
            data: p
        });

    } catch (e) {
        next(e);
    }
};

// Update Product
exports.updateProduct = async (req, res, next) => {
    try {
        const p = await Product.findByPk(req.params.id);

        if (!p) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        await p.update(req.body);

        res.json({
            success: true,
            data: p
        });

    } catch (e) {
        next(e);
    }
};

// Delete Product (Soft Delete)
exports.deleteProduct = async (req, res, next) => {
    try {
        const p = await Product.findByPk(req.params.id);

        if (!p) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        await p.update({
            isActive: false
        });

        res.json({
            success: true,
            message: 'Product disabled'
        });

    } catch (e) {
        next(e);
    }
};

// Get Active Categories
exports.categories = async (req, res, next) => {
    try {
        const categories = await Category.findAll({
            where: {
                status: true
            },
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: categories
        });

    } catch (e) {
        next(e);
    }
};

// Get Single Category by ID or Slug
exports.category = async (req, res, next) => {
    try {
        const p = await Category.findOne({
            where: {
                [Op.or]: [
                    { id: req.params.id },
                    { slug: req.params.id }
                ],
                status: true
            },
            include: [
                {
                    model: Category,
                    as: 'parentCategory',
                    attributes: ['id', 'name', 'slug', 'description'],
                    required: false
                },
                {
                    model: Category,
                    as: 'subCategories',
                    attributes: ['id', 'name', 'slug', 'description'],
                    where: {
                        status: true
                    },
                    required: false
                }
            ]
        });

        if (!p) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        return res.json({
            success: true,
            data: p
        });

    } catch (e) {
        next(e);
    }
};

// Get Active Sub Categories
exports.subCategories = async (req, res, next) => {
    try {
        const p = await Category.findOne({
            where: {
                [Op.or]: [
                    { id: req.params.id },
                    { slug: req.params.id }
                ],
                status: true
            },
            include: [
                {
                    model: Category,
                    as: 'parentCategory',
                    attributes: ['id', 'name', 'slug', 'description'],
                    required: false
                },
                {
                    model: Category,
                    as: 'subCategories',
                    attributes: ['id', 'name', 'slug', 'description'],
                    where: {
                        status: true
                    },
                    required: false
                }
            ]
        });

        if (!p) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        return res.json({
            success: true,
            data: p
        });

    } catch (e) {
        next(e);
    }
};

// Create Category
exports.createCategory = async (req, res, next) => {
    try {
        const category = await Category.create(req.body);

        res.status(201).json({
            success: true,
            data: category
        });

    } catch (e) {
        next(e);
    }
};

// Create Sub Category
exports.createSubCategory = async (req, res, next) => {
    try {
        const category = await Category.create(req.body);

        res.status(201).json({
            success: true,
            data: category
        });

    } catch (e) {
        next(e);
    }
};

// Update Category
exports.updateCategory = async (req, res, next) => {
    try {
        const c = await Category.findByPk(req.params.id);

        if (!c) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        await c.update(req.body);

        res.json({
            success: true,
            data: c
        });

    } catch (e) {
        next(e);
    }
};

// Update SubCategory
exports.updateSubCategory = async (req, res, next) => {
    try {
        const c = await Category.findByPk(req.params.id);

        if (!c) {
            return res.status(404).json({
                success: false,
                message: 'Sub Category not found'
            });
        }

        await c.update(req.body);

        res.json({
            success: true,
            data: c
        });

    } catch (e) {
        next(e);
    }
};
