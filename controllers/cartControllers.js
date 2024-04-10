const EmployeeCart = require('../models/Cart')
const ProductSchema = require('../models/Product')

module.exports.getCart = async (req, res) => {
    try {
        const employeeId = req.user.id;
        let employeeCart = await EmployeeCart.findOne({ employeeId });
        if (employeeCart) employeeCart = await employeeCart.populate('items.productId');
        res.render('cart', { cartItems: employeeCart ? employeeCart.items : [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports.postCart = async (req, res) => {
    try {
        const { productId, name, price, imageUrl, quantity } = req.body;
        const employeeID = req.user.id;
        let employeeCart = await EmployeeCart.findOne({ employeeId: employeeID });
        if (!employeeCart) {
            await EmployeeCart.create({
                employeeId: employeeID,
                items: [{ productId: productId, name: name, price: price, imageUrl: imageUrl, quantity: quantity }]
            });
        } else {
            const existingItemIndex = employeeCart.items.findIndex(item => item.productId.toString() === productId);
            if (existingItemIndex !== -1) employeeCart.items[existingItemIndex].quantity += quantity;
            else employeeCart.items.push({ productId: productId, name: name, price: price, imageUrl: imageUrl, quantity: quantity })
            await employeeCart.save()
        }
        console.log(employeeID, 'added ', name,' to cart')
        res.status(201).json({ message: 'Item added to cart successfully', cart: employeeCart });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: error.message });
    }
};

module.exports.postCheckQuantity = async (req, res) => {
    try {
        const { productId } = req.body;
        const employeeId = req.user.id;
        const product = await ProductSchema.dummyProduct.findById(productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        let cartItem = await EmployeeCart.findOne({ employeeId })
        // cartItem = await cartItem.populate({ path: 'items', match: { productId: productId } });
        let cartQuantity = 0;
        if (cartItem) {
            cartItem = await cartItem.populate({ path: 'items', match: { productId: productId } });
            cartQuantity = cartItem.items.reduce((total, item) => {
                if (item.productId.toString() === productId) total += item.quantity;
                return total;
            }, 0);
        }
        res.status(200).json({ quantity: product.stock, cartQuantity });
    } catch (error) {
        console.log(error)
         res.status(400).json({ error: error.message });
    }
}

module.exports.postRemoveCartProduct = async(req, res)=>{
    try {
        const { productId } = req.body
        const employeeId = req.user.id
        const employeeCart = await EmployeeCart.findOne({ employeeId });
        if (!employeeCart) return res.status(404).json({ error: 'Cart not found' });
        employeeCart.items = employeeCart.items.filter(item => item._id.toString() !== productId);
        await employeeCart.save();
        res.status(200).json({ message: 'Product removed from cart successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}