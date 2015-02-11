var ProductsDataAccess = require("../DataAccess/products/products.js");
module.exports = {
    configureDataAccess: function (req, res, next) {
        req.dataAccess = new ProductsDataAccess({
            access: req.dataSrc.db.get("products")
        });
        next();
    },
    getList: function (req, res, next) {
        req.dataAccess.getProducts().success(function(doc){
            res.status(200).send(doc);
        });
    }
};
