// Modules
var _ = require("lodash"),
    path = require("path"),
    DataAccessFactory = require(path.join(__dirname, "../../classes/DataAccess"));
/**
 *
 * @class CategoriesDataAccess
 * @constructor
 */
// Data access constructor build from class factory
var CategoriesDataAccess = DataAccessFactory.create({
    getCategories: function(options){
        var that = this;
        that.setOptions(options);
        return that.access.find({});
    }
});

// Export constructor
module.exports = CategoriesDataAccess;
