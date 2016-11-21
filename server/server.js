var express = require("express"),
    app = express(),
    //https = require('https'),
    fs = require('fs'),
    path = require("path"),
    auth = require('./utils/auth'),
    configs = require(path.join(__dirname, "configs/configs.json"));
/*
 * Configuration express application
 * */
app.set("trust proxy", true);
app.set("x-powered-by", false);
app.set("port", process.env.PORT || 4000);

var httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'ssl/server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl/server.crt'))
};

app.use(express.static('public'));
app.use(require("body-parser").json());
app.use(require("body-parser").urlencoded({extended: true}));
app.use(require("cookie-parser")());
app.use(require("compression")());
/*app.use(require("method-override")());*/


// Routes
app.get("/", auth.basicAuth('dar', 'dar2016'), function(req, res) {
    res.sendFile(path.join(__dirname, '../public', 'dar.html'));
});

app.listen(app.get("port"));
//https.createServer(httpsOptions, app).listen(443);
console.info("Server started on localhost: 4000");
