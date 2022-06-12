const { PrismaClient } = require("@prisma/client");
const router = require("express").Router();
const  { product, product_Category } = new PrismaClient;


// ADD CATEGORY
router.post("/add", async (req, res) => {
    try{
        const newCategory = await product_Category.create({
            data:{
                name: req.body.name,
                description: req.body.description
            }
        });

        res.status(200).json(newCategory);
    }catch(err){
        res.status(500).json(err);
    }
})

// UPDATE CATEGORY
router.put("/:id", async (req, res) => {
    try{
        const updatedCategory = await product_Category.update({
            data:{
                name: req.body.name,
                description: req.body.description
            }
        });
        res.status(200).json(updatedCategory);
    }catch(err){
        res.status(500).json(err);
    }
});


// DELETE CATEGORY AND ITS PRODUCT
router.delete("/:id", async (req, res) => {
    try{
        if(await product.findMany({ where: { category_id: req.params.id } }) != null){
            await product.deleteMany({ where: { category_id: req.params.id } });
        }
        await product_Category.delete({ where: { id: req.params.id } });
        res.status(200).json("Category and Its product has been deleted.")
    }catch(err){
        res.status(500).json(err);
    }
})


// GET ALL CATEGORIES

router.get("/", async (req, res) => {
    try{
    const categories = await product_Category.findMany();
    res.status(200).json(categories);
    }catch(err){
        res.status(500).json(err)
    }
});



// GET CATEGORY BY ID AND PRODUCTS
router.get("/:id", async (req, res) => {
    try{
        const category = await product_Category.findUnique({ where: { id: req.params.id } });
        const productsByCategory = await product.findMany({ where: { category_id: req.params.id } });
        res.status(200).json({category, productsByCategory});
    }catch{
        res.status(500).json(err);
    }
    
})
module.exports = router;