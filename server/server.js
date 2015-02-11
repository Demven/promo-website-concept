var express = require("express"),
    app = express(),
    path = require("path"),
    configs = require(path.join(__dirname, "configs/configs.json"));
/*
 * Configuration express application
 * */
app.set("trust proxy", true);
app.set("x-powered-by", false);
app.set("port", process.env.PORT || 4002);
app.set("dataSrcType", process.env.dataSrc || "db");

// Data source access
// TODO here need to implement access to fake data
app.set("dataSrc", (function(){
    var access = null,
        dataSrcType = app.get("dataSrcType");
    if(dataSrcType === "db"){
        access = require("monk")("mongodb://inspirr:Neph1711@192.241.227.182:27000/inspirr");
    } else if (dataSrcType == "fake") {
        //Here must be some fake data object
        //access = require("fake data object");
    }
    return {
        type: dataSrcType,
        db: access,
        session: access
    };
}()));

app.use(require("body-parser").json());
app.use(require("body-parser").urlencoded({extended: true}));
app.use(require("cookie-parser")());
app.use(require("compression")());
app.use(require("method-override")());

app.use(function(req, res, next){
    req.dataSrc = app.get("dataSrc");
    next();
});

// Routes
var products = require(path.join(__dirname, "APIHandlers/products.js"));
/**
 * @api {get} /api/v1/products Request List of products
 * @apiVersion 0.1.0
 * @apiName GetProducts
 * @apiGroup Products
 *
 * @apiParam {String} [type="default"] Type of list [random]
 *
 * @apiSuccess {Number} _id Unique product id
 * @apiSuccess {String} name Product name
 * @apiSuccess {String} image URL to product image
 * @apiSuccess {String} user Owner of product
 * @apiSuccess {String} description Product description
 * @apiSuccess {String} category Product category
 * @apiSuccess {Number} favorites Number of favorites
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       _id: "54d53b1ad96a0ab17e5a9113",
 *       name: "Hartmann-Mayer",
 *       image: "http://lorempixel.com/640/480/fashion",
 *       user: "Willow.Mayer74",
 *       description: "qui quo occaecati vel et",
 *       category: "calista",
 *       favorites: 733
 *     }
 *
 */
app.get("/api/v1/products", products.configureDataAccess, products.getList);


var categories = require(path.join(__dirname, "APIHandlers/categories.js"));
/**
 * @api {get} /api/v1/categories Request List of categories
 * @apiVersion 0.1.0
 * @apiName GetCategories
 * @apiGroup Categories
 *
 * @apiSuccess {Number} _id Unique category id
 * @apiSuccess {String} name Category name
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": "54d53b1ad96a0ab17e5a9113",
 *       "name": "Musics"
 *     }
 *
 */
app.get("/api/v1/categories", categories.configureDataAccess, categories.getList);


app.listen(app.get("port"));
