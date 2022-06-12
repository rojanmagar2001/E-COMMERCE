const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { user, cart } = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");



// REGISTER A NEW USER
router.post("/register", async (req, res) => {
    try{
        if(await user.findUnique({where: {username: req.body.username}}) != null){
            return res.status(403).send("Username has been already taken.");
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = await user.create({
            data: {
                username: req.body.username,
                password: hashedPassword,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                contact: req.body.contact,
                cart: {
                    create: {total_cost: 0}
                },    
            }
        });
        const { password, ...others } = newUser;
        res.status(200).json({others});
    }catch(err){
        res.status(500).json(err);
    }
});


// LOGIN
router.post("/login", async(req, res) => {
    try{
        const loggedUser = await user.findUnique({
            where: {
                username: req.body.username
            }
        });
        if (!loggedUser){
            return res.status(401).json("Wrong Credentials!");
        }

        const userCart = await cart.findUnique({ where: { user_id: loggedUser.id } });
        const cart_id = userCart.id

        // Checking if the password is matched.
        if (await bcrypt.compare(req.body.password, loggedUser.password)){
            const accessToken = jwt.sign({
                id: loggedUser.id, cart_id: cart_id, isAdmin: loggedUser.isAdmin
            }, process.env.JWT_SEC, { expiresIn:"3d" });
            const { password, ...others } = loggedUser;
            res.status(200).json({others, accessToken});
        }
        else{
            res.status(401).json("Password Mismatched!");
        }
    }catch(err){
        res.status(500).json(err);
    }
});

module.exports = router;