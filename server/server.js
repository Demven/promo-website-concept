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
var products = require(path.join(__dirname, "handlers/products.js"));

app.get("/api/v1/products", products.getList);

/// error handlers

app.listen(app.get("port"));