const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { verifyTokenAndAdmin, verifyToken } = require("../util");
const { product, cart_Item, cart } = new PrismaClient;

// Add Products
router.post("/", verifyTokenAndAdmin, async (req, res) => {
    try{
        const newProduct = await product.create({
            data:{
                name: req.body.name,
                description: req.body.description,
                img: req.body.img,
                category: {
                    connect: {
                        id: req.body.category_id
                    }
                },
                inventory: {
                    create: {
                        stock: req.body.stock
                    }
                },
                price: req.body.price,
                discount: req.body.discount
            }
        });
        res.status(200).json(newProduct);
    }catch(err){
        res.status(500).json(err)
    }
});

// UPDATE PRODUCT

router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
    try{
        const updateProduct = await product.findUnique({ where: { id: req.params.id } });
        if(updateProduct != null){
            const updatedProduct = await product.update({ 
                data: req.body,
                where: {
                    id: req.params.id
                }
            }, { new: true });
            res.status(500).json(updatedProduct);
        }
    }catch(err){
        res.status(500).json(err);
    }
});

// DELETE PRODUCT

router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    try{
        await product.delete({ where: { id: req.params.id } });
        res.status(200).json("Product has been successfully deleted.");
    }catch(err){
        res.status(500).json(err);
    }
})


// GET ALL PRODUCTS
router.get("/", async (req, res) => {
    try{
    const Products = await product.findMany();
    res.status(200).json(Products);
    }catch(err){
        res.status(500).json(err);
    }
})


// GET PRODUCT BY ID
router.get("/:id", async (req, res) => {
    try{
        const getProduct = await product.findUnique({ where: { id: req.params.id } });
        res.status(200).json(getProduct);
    }catch(err){
        res.status(500).json(err);
    }
});


// ADDING PRODUCT TO CART

// Addiing cart_item to cart
router.post("/:id/AddToCart", verifyToken, async (req, res) => {
    try{
        const addItem = await cart_Item.findMany({ where: { cart_id: req.user.cart_id, product_id: req.params.id } });
        if (addItem.length == 0){
            const cartProduct = await product.findUnique({ where: { id: req.params.id } });
            const cost = cartProduct.price;
            const user_cartItem = await cart_Item.create({
                data: {
                    cart: {
                        connect: {
                            id: req.user.cart_id
                        }
                    },
                    product: {
                        connect: {
                            id: req.params.id
                        }
                    },
                    quantity: 1,
                    cost: cost 
                }
            });

            const userCart = await cart.findUnique({ where:{ id: req.user.cart_id } });
            await cart.update({ 
                data: {
                    total_cost: userCart.total_cost + user_cartItem.cost
                },
                where:{
                    id: req.user.cart_id
                }   
            });

            
            res.status(200).json("Product has been added to the cart.");
        }
        else{
            res.status(403).json("Product has already been added to the Cart.");
        }
        
    }catch(err){
        res.status(500).json(err);
    }
});




module.exports = router;