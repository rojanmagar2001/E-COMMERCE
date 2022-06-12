const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { verifyTokenAndAuthorization } = require("../util");
const { user, cart, cart_Item }  = new PrismaClient;
const bcrypt = require("bcrypt");

// UPDATE USER

router.put("/:id", verifyTokenAndAuthorization , async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const updatedUser = await user.update({
            data:req.body,
            where: {
                id: req.params.id
            }
        }, { new: true });
        const { password, ...others } = updatedUser;
        res.status(200).json(others);
    }catch(err){
        res.status(500).json(err);
    }
});


//  DELETE USER

router.delete("/:id",verifyTokenAndAuthorization, async (req, res) => {
    try{
        const userCart = await cart.findUnique({ where: { user_id: req.params.id } });
        const userCart_Items = await cart_Item.findMany({ where: { cart_id: userCart.id } });
        if(userCart_Items != null){
            await cart_Item.deleteMany({ where: { cart_id: userCart.id } });
        }
        await cart.delete({ where: { user_id: req.params.id } });
        await user.delete({
            where: {
                id: req.params.id
            }
        });

        res.status(200).json("User has been successfully deleted.");
    }catch(err){
        res.status(500).json(err);
    }
})





module.exports = router;