/*
 * Categories Data Access constructor
 * */
var CategoriesDataAccess = require("../DataAccess/categories/categories.js");
module.exports = {
    configureDataAccess: function (req, res, next) {
        req.dataAccess = new CategoriesDataAccess({
            access: req.dataSrc.db.get("categories")
        });
        next();
    },
    getList: function (req, res, next) {
        req.dataAccess.getCategories().success(function(doc){
            res.status(200).send(doc);
        });
    }
};
