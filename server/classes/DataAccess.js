// Modules dependencies
var _ = require("lodash"),
    // node js standard utils
    util = require("util");

// Data access class
var DataAccess = function(configs){};

// Base initializer
DataAccess.prototype.initialize = function(configs){
    var that = this;
    _.extend(that, configs);
};

DataAccess.prototype.setOptions = function(options){
    // setting options for data access
    var that = this;
    that.options = _.extend(that.options || {}, options || {});
};

// Class that give access to base access class
var DataAccessFactory = function(){};

DataAccessFactory.create = function(prototypeExtend){
    var Func = function(){
        var that = this;
        DataAccess.prototype.initialize.apply(that, arguments);
    };
    // Inherit all prototype methods
    util.inherits(Func, DataAccess);
    _.extend(Func.prototype, prototypeExtend || {});
    return Func;
};

module.exports = DataAccessFactory;
