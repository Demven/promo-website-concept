// Modules
var _ = require("lodash"),
    path = require("path"),
    DataAccessFactory = require(path.join(__dirname, "../../classes/DataAccess"));

// Data access constructor build from class factory
var ProductsDataAccess = DataAccessFactory.create({
    getProducts: function(options){
        var that = this;
        that.setOptions(options);
        return that.access.find({});
    }
});

// Export constructor
module.exports = ProductsDataAccess;
