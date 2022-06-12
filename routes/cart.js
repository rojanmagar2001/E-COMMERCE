const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { verifyToken } = require("../util");
const { cart_Item, cart, product } = new PrismaClient;

// GET CART
router.get("/", verifyToken, async (req, res) => {
    try{
        const userCart_Items = await cart_Item.findMany({ where: { cart_id: req.user.cart_id } });
        res.status(200).json(userCart_Items);
    }catch(err){
        res.status(500).json(err);
    }
});

// DELETE ITEMS FROM CART
router.delete("/:id", verifyToken, async (req, res) => {
    try{
        const userCart_Item = await cart_Item.findUnique({ where: { id: req.params.id } });
        const userCart = await cart.findUnique({ where: { id: req.user.cart_id } });
        await cart_Item.delete({ where: { id: req.params.id } });

        await cart.update({
            data: {
                total_cost: userCart.total_cost - userCart_Item.cost
            },
            where: { id: req.user.cart_id }
        });
        res.status(200).json("Item has been deleted.");
    }catch(err){
        res.status(500).json(err)
    }
});

// ADD QUANTITY OF ITEM IN THE CART
router.put("/:id/add", verifyToken, async(req, res) => {
    try{
        const user_cartItem = await cart_Item.findUnique({ where: { id: req.params.id } });
        const cartProduct = await product.findUnique({ where: { id: user_cartItem.product_id } });
        const userCart = await cart.findUnique({ where: { id: req.user.cart_id } });

        await cart_Item.update({
            data: {
                quantity: user_cartItem.quantity + 1,
                cost: user_cartItem.cost + cartProduct.price
            },
            where: {
                id: req.params.id
            }
        });

        await cart.update({
            data: {
                total_cost: userCart.total_cost + cartProduct.price
            },
            where: {
                id: req.user.cart_id
            }
        });
        res.status(200).json("Quantity has been added");
    }catch(err){
        res.status(500).json(err);
    }
});


// DECREASE QUANTITY OF ITEM IN CART
router.put("/:id/decrease", verifyToken, async(req, res) => {
    try{
        const user_cartItem = await cart_Item.findUnique({ where: { id: req.params.id } });
        const cartProduct = await product.findUnique({ where: { id: user_cartItem.product_id } });
        const userCart = await cart.findUnique({ where: { id: req.user.cart_id } });
        if(user_cartItem.quantity > 1){
            await cart_Item.update({
                data: {
                    quantity: user_cartItem.quantity - 1,
                    cost: user_cartItem.cost - cartProduct.price
                },
                where: {
                    id: req.params.id
                }
            });
    
            await cart.update({
                data: {
                    total_cost: userCart.total_cost - cartProduct.price
                },
                where: {
                    id: req.user.cart_id
                }
            });
            res.status(200).json("Quantity has been decreased");
        }
        else{
            res.status(403).json("You are not allowed to do that");
        }    
    }catch(err){
        res.status(500).json(err);
    }
});
module.exports = router;
