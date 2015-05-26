/**
 * Created by Dakal Oleksandr on 1/12/15.
 */
var gulp = require("gulp"),
    path = require("path"),
    argv = require("yargs").argv,
    _ = require("lodash"),
// Task to run in order
    runSequence = require("run-sequence").use(gulp);

// Load all gulp plugins
var plugins = require("gulp-load-plugins")({
    pattern: "gulp-*",
    scope: ["devDependencies"],
    lazy: true
});

// Helpers. Log function that throw error and exit from task
var transformRevFilename = function (file, hash) {
    var ext = path.extname(file.path);
    return path.basename(file.path, ext) + "-" + hash.substr(0, 10) + ext;
};

//*********************************
//********* Clean tasks ***********
//*********************************
var del = require("del");
// Clean previous build
gulp.task("build:clean", function (cb) {
    return del(["public"], cb);
});
// Clean folder with revisions information
gulp.task("revisions:clean", function (cb) {
    return del(["revisions"], cb);
});
// Clean docs folders
gulp.task("docs:clean", function (cb) {
    // Read sources
    return del(["docs"], cb);
});

//*********************************
//*********** Build CSS ***********
//*********************************
// Build CSS files
gulp.task("build:css", function () {
    // Read sources
    var src = gulp.src("assets/stylus/*.styl");
    // Generate stylus code
    src = src.pipe(plugins.stylus({
            compress: true,
            // Generate inline sources
            sourcemap: {
                inline: true
            }
        }))
        .pipe(plugins.sourcemaps.init({
            loadMaps: true
        }))
        // PostCSS process to add prefixes
        .pipe(plugins.autoprefixer())
        .pipe(plugins.cssUrlVersioner())
        // Source map write
        .pipe(plugins.sourcemaps.write("."))
        // Write to distributive folder
        .pipe(gulp.dest("public/css"))
        .pipe(plugins.filter("*.css"))
        // File size of files
        .pipe(plugins.filesize());

    // Validate CSS
    if(!(argv["skip-validation"] || argv["skip-css-validation"])){
        src = src.pipe(plugins.csslint("csslintrc.json"))
            .pipe(plugins.csslint.reporter())
    }

    return src;
});


//*********************************
//*********** Build JS ************
//*********************************

// Build javascript
gulp.task("build:js", function () {
    // Read sources
    var src = gulp.src(["assets/js/**/*", "!assets/js/vendor/**"]);

    // Write to distributive folder
    src = src.pipe(gulp.dest("public/js"))
        // Filter *.js
        .pipe(plugins.filter("**/*.js"))
        // Show filesize of generated files
        .pipe(plugins.filesize());

    // Validate CSS
    if(!(argv["skip-validation"] || argv["skip-js-validation"])){
        src = src.pipe(plugins.jshint())
            .pipe(plugins.jshint.reporter())
    }
    return src;
});

//*********************************
//********** Build HTML ***********
//*********************************

// Build HTML entry point
gulp.task("build:html", function () {
    // Read sources
    var src = gulp.src(["assets/html/**"]);
    // Production version
/*    if (argv.production) {
        src = src.pipe(plugins.cdnizer([
                // matches all root angular files
                "google:angular"
            ]));
    }*/
    // Minify HTMl
    src = src.pipe(plugins.htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest("public"));
    return src;
});


//*********************************
//********** Build fonts **********
//*********************************
// Copy static resources
gulp.task("build:fonts", function () {
    // Read sources
    return gulp.src(["assets/fonts/**"])
        .pipe(gulp.dest("public/fonts"));
});
gulp.task("build:vendors", function () {
    // Read sources
    return gulp.src(["assets/js/vendor/**"])
        .pipe(gulp.dest("public/js/vendor"));
});
//*********************************
//********* Build images **********
//*********************************
gulp.task("build:images", function () {
    // Read sources
    return gulp.src("assets/images/**")
        .pipe(gulp.dest("public/images"));
});
//*********************************
//********** Build GZIP ***********
//*********************************
gulp.task("build:gzip", function () {
    // Read sources
    return gulp.src("public/**")
        .pipe(plugins.pako())
        .pipe(gulp.dest("public"));
});
//**********************************
//********* Server tasks ***********
//**********************************
gulp.task("server:static", function () {
    plugins.connect.server({
        root: "public",
        port: 8080
    });
});
gulp.task("server:api", function (done) {
    var runHint = (function (argv, runSequence) {
        if(!(argv["skip-validation"] || argv["skip-js-validation"])){
            return function() { runSequence("js:server:hint") };
        } else {
            return _.noop;
        }
    }(argv, runSequence));
    // Done triggers only once
    plugins.nodemon({
        script: "server/server.js",
        ext: "js json",
        ignore: ["assets/**", "public/**", "node_modules/**", "tests/**"],
        env: {
            NODE_ENV: argv.production ? "production" : "development",
            PORT: 4002,
            dataSrc: argv.db || "remote"
        }
    })
    .on("start", _.once(function () {
        setTimeout(function () {
            runHint();
            done();
        }, 1000);
    }))
    .on("change", function(){
            runHint();
        });
});
//*********************************
//********** Revisions ************
//*********************************
// Build HTML entry point
gulp.task("revisions:create", function () {

});

//*********************************
//********* Watch tasks ***********
//*********************************
gulp.task("watch", function () {
    gulp.watch("assets/html/**", function () {
        runSequence("build:html");
    });
    gulp.watch("assets/stylus/**", function () {
        runSequence("build:css");
    });
    gulp.watch("assets/js/**", function () {
        runSequence("build:js");
    });
});

//*********************************
//******* Validation tasks ********
//*********************************
gulp.task("js:server:hint", function () {
    return gulp.src("server/{,**/}*.js")
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter("jshint-stylish"));
});

//*********************************
//********** Docs tasks ***********
//*********************************
gulp.task("docs:api", function (done) {
    var apidoc = require("apidoc");
    apidoc.createDoc({
        src: "server/",
        dest: "docs/api/"
    });
    done();
});

gulp.task("docs:server", function () {
    return gulp.src("server/{,**/}*.js")
        .pipe(plugins.yuidoc.parser({
            "paths": ["server/**/"],
            "project": {
                "name": "Inspirr",
                "description": "Inspirr documentation",
                "version": "0.1.0"
            }
        }))
        .pipe(plugins.yuidoc.generator({
            "themedir": "node_modules/yuidoc-lucid-theme",
            "helpers": ["node_modules/yuidoc-lucid-theme/helpers/helpers.js"]
        }))
        .pipe(gulp.dest("docs/server"));
});
//***********************************
//********** Tests tasks ***********
//***********************************
gulp.task("tests", function () {
    return gulp.src("tests/api.js", {read: false})
        .pipe(plugins.mocha({reporter: "spec", timeout: 3000}));
});
//***********************************
//********** Complex tasks ***********
//***********************************

gulp.task("build", function (callback) {
    runSequence("build:clean",
        ["build:css", "build:js"], ["build:fonts", "build:images", "build:vendors"],
        "build:html", "build:gzip", callback);
});

gulp.task("default", function (callback) {
    runSequence("build", ["server:static"/*, "server:api", "watch"*/], callback);
});

/** DEFAULT COPY
 * @see https://github.com/krry/heroku-buildpack-nodejs-gulp-bower
 */
gulp.task("heroku:dev", function (callback) {
    runSequence("build", ["server:static", "server:api"/*, "watch"*/], callback);
});

gulp.task("production", function (callback) {
    runSequence("build", "server:api", callback);
});


gulp.task("docs", function () {
    runSequence("docs:clean", ["docs:api", "docs:server"]);
});

/*// Save revision
 .pipe(plugins.revAll.manifest({fileName: "CSSManifest.json"}))
 // Revert plumber

 .pipe(gulp.dest("revisions"));*/
/*
 // Generate gzip
 .pipe(plugins.pako.gzip())
 // Add versions
 .pipe(plugins.revAll({
 transformFilename: transformRevFilename
 }))

 // Replace revisions due to manifiest
 /* .pipe(plugins.revCollector({
 replaceReved: true,
 revSuffix: "-[0-9a-f]{10}-?"
 }))*/

