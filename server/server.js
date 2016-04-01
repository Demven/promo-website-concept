var express = require("express"),
    app = express(),
    path = require("path"),
    auth = require('./utils/auth'),
    configs = require(path.join(__dirname, "configs/configs.json"));
/*
 * Configuration express application
 * */
app.set("trust proxy", true);
app.set("x-powered-by", false);
app.set("port", process.env.PORT || 4000);
/*app.set("dataSrcType", process.env.dataSrc || "remote");*/

// Data source access
/*app.set("dataSrc", (function(){
    var dbConfigs = null, db,
        mongoHelpers = new (require(path.join(__dirname, "classes/MongoDBHelpers.js")))();
    if(app.get("dataSrcType") === "remote"){
        dbConfigs = configs.db.remote;
    } else if (app.get("dataSrcType") == "local") {
        //Here must be some fake DB connection
    }
    db = require("monk")(mongoHelpers.createAuthenticationLink(dbConfigs));
    return {
        db: db,
        session: db
    };
}()));*/

app.use(express.static('public'));
app.use(require("body-parser").json());
app.use(require("body-parser").urlencoded({extended: true}));
app.use(require("cookie-parser")());
app.use(require("compression")());
/*app.use(require("method-override")());*/

/*app.use(function(req, res, next){
    req.dataSrc = app.get("dataSrc");
    next();
});*/

// Routes
app.get("/", auth.basicAuth('dar', 'dar2016'), function(req, res) {
    res.sendFile(path.join(__dirname, '../public', 'dar.html'));
});

app.listen(app.get("port"));
console.info("Server started on localhost:" + app.get("port"));
