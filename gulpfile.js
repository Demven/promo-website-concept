/**
 * Created by Dakal Oleksandr on 1/12/15.
 */

var gulp = require("gulp"),
    path = require("path"),
// Task to run in order
    runSequence = require("run-sequence"),
    nodemon = require("gulp-nodemon"),
    connect = require("gulp-connect"),
    apidoc = require("apidoc");

// Load all gulp plugins
var plugins = require("gulp-load-plugins")({
    pattern: "gulp-*",
    scope: ["devDependencies"],
    lazy: true
});

// Helpers. Log function that throw error and exit from task
var error = function (error) {
        console.log(["Error plugin: " + error.plugin, error.message].join("\n"));
        this.end();
    },
    transformRevFilename = function (file, hash) {
        var ext = path.extname(file.path);
        return path.basename(file.path, ext) + "-" + hash.substr(0, 10) + ext;
    };

// Clean previous build
gulp.task("clean:build", function (cb) {
    // Get sources without reading and remove it
    var CleanStream = gulp.src(["public", "revisions"], {read: false});
    return CleanStream.pipe(plugins.rimraf({force: true}));
});

// Clean tmp folders
gulp.task("clean:tmp", function (cb) {
    // Read sources
    var CleanStream = gulp.src(["revisions"], {read: false});
    return CleanStream.pipe(plugins.rimraf({force: true}));
});
// Clean tmp folders
gulp.task("clean:docs", function (cb) {
    // Read sources
    var CleanStream = gulp.src(["docs"], {read: false});
    return CleanStream.pipe(plugins.rimraf({force: true}));
});


// Build CSS files
gulp.task("css:build", function () {
    // Read sources
    return gulp.src("assets/stylus/*.styl")
        // Source map initialization
        .pipe(plugins.sourcemaps.init())
        // Compile stylus
        .pipe(plugins.stylus({
            compress: true
        })).on("error", error)
        // PostCSS process to add prefixes
        .pipe(plugins.autoprefixer({
            // Here will be specific versions of browser
        })).on("error", error)
        // versionization of css urls
        .pipe(plugins.cssUrlVersioner())
        // Write maps
        .pipe(plugins.sourcemaps.write(".")).on("error", error)
        // Write to distributive folder
        .pipe(gulp.dest("public/css"))
        // Filter only css files
        .pipe(plugins.filter("*.css"))
        // Validate CSS
        .pipe(plugins.csslint()).on("error", error)
        .pipe(plugins.csslint.reporter())
        // Add versions
        .pipe(plugins.revAll({
            transformFilename: transformRevFilename
        }))
        // Write to destination
        .pipe(gulp.dest("public/css"))
        // Save revision
        .pipe(plugins.revAll.manifest({fileName: "CSSManifest.json"}))
        .pipe(gulp.dest("revisions"));
});

// Build server sources
gulp.task("js:server:hint", function () {
    gulp.src("server/{,**/}*.js")
        .pipe(plugins.jshint()).on("error", error)
        .pipe(plugins.jshint.reporter("jshint-stylish"));
});

// Build javascript
gulp.task("js:build", function () {
    // Read sources
    var JSSourcesStream = gulp.src("assets/js/*.js");
    // Source map initialization
    return JSSourcesStream.pipe(plugins.sourcemaps.init())
        // Validate JS
        .pipe(plugins.jshint()).on("error", error)
        .pipe(plugins.jshint.reporter("jshint-stylish"))
        // Compress js
        .pipe(plugins.uglify()).on("error", error)
        // Write maps
        .pipe(plugins.sourcemaps.write(".")).on("error", error)
        // Write to distributive folder
        .pipe(gulp.dest("public/js"))
        // Filter only css files
        .pipe(plugins.filter("*.js"))
        // Add versions
        .pipe(plugins.revAll({
            transformFilename: transformRevFilename
        }))
        // Write to destination
        .pipe(gulp.dest("public/js"))
        // Save revision
        .pipe(plugins.revAll.manifest({fileName: "JSManifest.json"}))
        .pipe(gulp.dest("revisions"));
});

// Build HTML entry point
gulp.task("html:build", function () {
    // Read sources
    var HTMLSourcesStream = gulp.src(["revisions/*.json", "assets/html/*.html"]);
    return HTMLSourcesStream.pipe(plugins.revCollector({
        replaceReved: true,
        revSuffix: "-[0-9a-f]{10}-?"
    }))
        .pipe(plugins.filter("*.html"))
        // Minify HTMl
        .pipe(plugins.htmlmin({
            collapseWhitespace: true,
            removeComments: true
        })).on("error", error)
        .pipe(gulp.dest("public"));
});

// Copy static resources
gulp.task("copy:static", function () {
    // Read sources
    var StaticSourcesStream = gulp.src("assets/static/**");
    return StaticSourcesStream.pipe(gulp.dest("public"));
});

gulp.task("connect:static", function () {
    connect.server({
        root: "public"
    });
});

gulp.task("server:api", function () {
    nodemon({
        script: "server/server.js",
        ext: "js json",
        ignore: ["assets/*", "public/*"],
        env: {
            NODE_ENV: "development",
            PORT: 9000
        }
    })
    .on("change", ["js:server:hint"]);
});

gulp.task("watch", function () {
    gulp.watch("assets/stylus/*.styl", function () {
        runSequence("css:build", "html:build", "clean:tmp");
    });
    gulp.watch("assets/js/*.js", function () {
        runSequence("js:build", "html:build", "clean:tmp");
    });
    gulp.watch("assets/static/**", ["copy:static"]);
});

// BUILD TASKS
gulp.task("default", function () {
    runSequence("clean:build", ["css:build", "js:build"],
        ["html:build", "copy:static"], "clean:tmp", "connect:static", "server:api", "js:server:hint", "watch");
});

gulp.task("api:docs", function () {
    apidoc.createDoc({
        src: "server/",
        dest: "docs/api/"
    });
});

gulp.task("server:docs", function () {
    gulp.src("server/{,**/}*.js")
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

gulp.task("docs", function(){
    runSequence("clean:docs", ["api:docs", "server:docs"]);
});