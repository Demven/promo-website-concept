var express = require("express"),
    app = express(),
    path = require("path"),
    configs = require(path.join(__dirname, "configs/configs.json")),
    DataAccessFactory = require(path.join(__dirname, "classes/DataAccess"));

// Config express application
app.set("trust proxy", true);
app.set("x-powered-by", false);
app.set("port", process.env.PORT || 3000);

app.use(require("body-parser").json());
app.use(require("body-parser").urlencoded({extended: true}));
app.use(require("cookie-parser")());
app.use(require("compression")());
app.use(require("method-override")());
app.use(function(req, res, next){
    DataAccessFactory.setAccess({
        db: "no access",
        faker: true
    });
    next();
});

// Routes is here
var products = require(path.join(__dirname, "APIHandlers/products.js"));
/**
 * @api {get} /api/v1/products Request List of products
 * @apiVersion 0.1.0
 * @apiName GetProducts
 * @apiGroup Products
 *
 * @apiParam {String} [type="default"] Type of list [random]
 *
 * @apiSuccess {Number} id Unique product id
 * @apiSuccess {String} name Product name
 * @apiSuccess {String} image URL to product image
 * @apiSuccess {String} user Owner of product
 * @apiSuccess {String} description Product description
 * @apiSuccess {String} category Product category
 * @apiSuccess {Number} favorites Number of favorites
 * @apiSuccess {Boolean} isFavoriteAllow Is favorite allowed for current user
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       id: 649
 *       name: "Hartmann-Mayer"
 *       image: "http://lorempixel.com/640/480/fashion"
 *       user: "Willow.Mayer74"
 *       description: "qui quo occaecati vel et"
 *       category: "calista"
 *       favorites: 733
 *       isFavoriteAllow: false
 *     }
 *
 */
app.get("/api/v1/products", products.getList);

/// error handlers

app.listen(app.get("port"));