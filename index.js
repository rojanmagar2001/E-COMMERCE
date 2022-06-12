const express = require("express");
const app = express();
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const userRoute = require("./routes/user");
const categoryRoute = require("./routes/category");
const cartRoute = require("./routes/cart");


require("dotenv").config();




app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/users", userRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/cart", cartRoute);



app.listen(5000, ()=>{
    console.log("Connected to the backend.")
})