const router=require('express').Router();
const {body,param}=require('express-validator');
const validate=require('../middleware/validate');
const auth=require('../middleware/auth');
const roles=require('../middleware/roles');
const a=require('../controllers/auth');
const c=require('../controllers/catalog');
const sc=require('../controllers/sub_catalog');
const s=require('../controllers/shopping');
const o=require('../controllers/orders');
const p=require('../controllers/payments');

//router.post('/auth/register',[body('name').trim().isLength({min:2,max:120}),body('email').isEmail().normalizeEmail(),body('password').isLength({min:10}).matches(/[A-Za-z]/).matches(/[0-9]/),body('phone').optional().isMobilePhone('any')],validate,a.register);

router.post('/auth/register',[
    body('name').trim().isLength({min:2,max:120}),
    //body('email').isEmail().normalizeEmail(),
    
    body('email').isEmail().trim(),
    
    body('password').isLength({min:10}).matches(/[A-Za-z]/).matches(/[0-9]/),
    body('phone').optional().isMobilePhone('any')
],validate,a.register);

router.post('/auth/register/admin',[
    body('name').trim().isLength({min:2,max:120}),
    body('email').isEmail().trim(),    
    body('password').isLength({min:10}).matches(/[A-Za-z]/).matches(/[0-9]/),
    body('phone').optional().isMobilePhone('any')
],validate,a.register);

router.post('/auth/login',[body('email').isEmail(),body('password').isString().notEmpty()],validate,a.login);
router.post('/auth/refresh',[body('refreshToken').isString().notEmpty()],validate,a.refresh);
router.get('/auth/me',auth,a.me);router.post('/auth/logout',auth,a.logout);

router.get('/products',c.products);router.get('/products/:id',c.product);
router.post('/products',auth,roles('admin'),[body('name').notEmpty(),body('slug').notEmpty(),body('sku').notEmpty(),body('price').isFloat({min:0}),body('stock').optional().isInt({min:0})],validate,c.createProduct);
router.put('/products/:id',auth,roles('admin'),c.updateProduct);
router.delete('/products/:id',auth,roles('admin'),c.deleteProduct);
router.get('/categories',c.categories);
router.post('/categories',auth,roles('admin'),[body('name').notEmpty(),body('slug').notEmpty()],validate,c.createCategory);
router.put('/categories/:id',auth,roles('admin'),c.updateCategory);
router.delete('/categories/:id',auth,roles('admin'),c.deleteCategory);

router.get('/sub-categories',c.subCategories);
router.post('/sub-categories',auth,roles('admin'),[body('name').notEmpty(),body('slug').notEmpty()],validate,c.createSubCategory);
router.put('/sub-categories/:id',auth,roles('admin'),c.updateSubCategory);
router.get('/category/:id',auth,roles('admin'),c.category);
router.get('/sub-category/:id',auth,roles('admin'),c.updateCategory);

router.get('/cart',auth,s.cart);
router.post('/cart',auth,[body('productId').isInt({min:1}),body('quantity').isInt({min:1,max:100})],validate,s.addCart);
router.patch('/cart/:id',auth,[body('quantity').isInt({min:1,max:100})],validate,s.updateCart);
router.delete('/cart/:id',auth,s.removeCart);
router.get('/wishlist',auth,s.wishlist);
router.post('/wishlist',auth,[body('productId').isInt({min:1})],validate,s.addWishlist);
router.delete('/wishlist/:productId',auth,s.removeWishlist);
router.post('/orders/checkout',auth,[body('shippingAddress').isObject(),body('shippingAddress.address1').notEmpty(),body('shippingAddress.city').notEmpty(),body('shippingAddress.postalCode').notEmpty(),body('shippingAddress.country').notEmpty()],validate,o.checkout);
router.get('/orders',auth,o.list);
router.get('/orders/:id',auth,o.detail);
router.patch('/admin/orders/:id/status',auth,roles('admin'),[body('status').isIn(['confirmed','processing','shipped','delivered','cancelled'])],validate,o.updateStatus);
router.post('/payments/razorpay/:orderId',auth,p.create);
router.post('/payments/razorpay/verify',auth,p.verify);

router.get('/admin/users',auth,roles('admin'),async(req,res,next)=>{
    try{
        const {User}=require('../models');
        const users=await User.findAll({
            attributes:['id','name','email','phone','role','status','createdAt'],
            order:[['createdAt','DESC']],limit:200
        });
        
        res.json({success:true,data:users});
    } catch(e){
        next(e);
    }
});

router.post('/admin/users', auth, roles('admin'), async (req, res, next) => {
    try {
        const { User } = require('../models');
        const bcrypt = require('bcryptjs');

        const { name, email, password, phone, role, status } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and password are required'
            });
        }

        // Check existing user
        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone: phone || null,
            role: role || 'user',
            status: status || 'active'
        });

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt
            }
        });

    } catch (e) {
        next(e);
    }
});

router.patch('/admin/users/:id/status',auth,roles('admin'),[body('status').isIn(['active','blocked'])],validate,async(req,res,next)=>{
    try{
        const {User}=require('../models');
        const user=await User.findByPk(req.params.id);
        if(!user) return res.status(404).json({success:false,message:'User not found'});
        if(user.id===req.user.id&&req.body.status==='blocked') return res.status(400).json({success:false,message:'Cannot block your own account'});
        await user.update({status:req.body.status});
        res.json({success:true,data:user});
    }catch(e){
        next(e);
    }});

router.get('/admin/dashboard',auth,roles('admin'),async(req,res,next)=>{
    try{
        const {Order,User,Product}=require('../models');
        const [orders,users,products,revenue]=await Promise.all([Order.count(),User.count(),Product.count(),Order.sum('totalAmount',{where:{paymentStatus:'paid'}})]);
        res.json({success:true,data:{orders,users,products,revenue:Number(revenue||0)}});
    }catch(e){
        next(e);
    }
});

module.exports=router;
