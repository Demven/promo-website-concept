// Modules
var _ = require("lodash"),
    path = require("path"),
    DataAccessFactory = require(path.join(__dirname, "../../classes/DataAccess"));

// Data access constructor build from class factory
var ProductsDataAccess = new DataAccessFactory();

// Data access functions
ProductsDataAccess.prototype.getList = function(options){
    var that = this;
    that.setOptions(options);
    if(that.access.faker){
        console.log("faker");
    }
};

// Export constructor
module.exports = ProductsDataAccess;