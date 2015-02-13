var MongoDBHelpers = function(){},
    mongoConnectPrefix = "mongodb://";
MongoDBHelpers.prototype.createAuthenticationLink = function(dbConfig){
    var userAuth = "";
    if(dbConfig.username && dbConfig.pass){
        userAuth = dbConfig.username + ":" + dbConfig.pass + "@";
    }
    return mongoConnectPrefix + userAuth + dbConfig.link + "/" + dbConfig.dbName;
};

module.exports = MongoDBHelpers;
