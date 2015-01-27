/**
 * A utility that brokers HTTP requests...
 *
 * @class ProductsDataAccess
 * @constructor
 */
var ProductsDataAccess = require("../DataAccess/products/products.js"),
    // Create DAO
    ProductsDataAccessObject = new ProductsDataAccess();
module.exports = {
    getList: function (req, res, next) {
        res.status(200).send(ProductsDataAccessObject.getList({
            type: req.query.type || "default"
        }));
    }
};