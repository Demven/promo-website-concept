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
// Clean previous build
gulp.task("clean:previous:build", ["clear:revisions"], function () {
    // Get sources without reading and remove it
    return gulp.src(["public"], {read: false})
        // Clean
        .pipe(plugins.rimraf({force: true}));
});
// Clean folder with revisions information
gulp.task("clear:revisions", function () {
    // Get sources without reading and remove it
    return gulp.src(["revisions"], {read: false})
        .pipe(plugins.rimraf({force: true}));
});
// Clean docs folders
gulp.task("clean:docs", function () {
    // Read sources
    return gulp.src(["docs"], {read: false})
        .pipe(plugins.rimraf({force: true}));
});

//*********************************
//*********** Build CSS ***********
//*********************************
// Build CSS files
gulp.task("css:build:compile", function () {
    // Read sources
    return gulp.src("assets/stylus/*.styl")
        // Plumber to track and fix pipes
        .pipe(plugins.plumber())
        // Generate stylus code
        .pipe(plugins.stylus({
            compress: true,
            // Generate inline sources
            sourcemap: {
                inline: true
            }
        }))
        // Validate CSS
        .pipe(plugins.csslint("csslintrc.json"))
        .pipe(plugins.csslint.reporter())
        // Compile stylus
        .pipe(plugins.sourcemaps.init({
            loadMaps: true
        }))
        // PostCSS process to add prefixes
        .pipe(plugins.autoprefixer({
            // Here will be specific versions of browser
        }))
        .pipe(plugins.sourcemaps.write("."))
        // Write to distributive folder
        .pipe(gulp.dest("public/css"))
        .pipe(plugins.filter("*.css"))
        // Add versions
        .pipe(plugins.revAll({
            transformFilename: transformRevFilename
        }))
        // add versions to urls
        .pipe(plugins.cssUrlVersioner())
        // File size of files
        .pipe(plugins.filesize())
        // Write to destination
        .pipe(gulp.dest("public/css"))
        // Save revision
        .pipe(plugins.revAll.manifest({fileName: "CSSManifest.json"}))
        // Revert plumber
        .pipe(plugins.plumber.stop())
        .pipe(gulp.dest("revisions"));
});
// Create gzipped files to not load server with dynamic gzip generation
gulp.task("css:build:gzip", function () {
    return gulp.src("public/css/*.css")
        .pipe(plugins.pako.gzip())
        .pipe(gulp.dest("public/css"));
});
// Complex task to build css
gulp.task("css:build", function () {
    return runSequence("css:build:compile", "css:build:gzip");
});


//*********************************
//*********** Build JS ************
//*********************************

// Build javascript
gulp.task("js:build:compile", function () {
    // Read sources
    var JSSourcesStream = gulp.src("assets/js/{,**/}*.js");
    // Validate JS
    JSSourcesStream = JSSourcesStream
        // Plumber to track and fix pipes
        .pipe(plugins.plumber())
        // Validate JS
        .pipe(plugins.jshint({
            "globals": {
                "angular": true
            },
            "browser": true
        }))
        .pipe(plugins.jshint.reporter(require("jshint-stylish"), {verbose: true}));

    // Production version
    if (argv.production) {
        JSSourcesStream = JSSourcesStream
            .pipe(plugins.ngAnnotate())
            .pipe(plugins.uglify());
    }

    // Write to distributive folder
    return JSSourcesStream.pipe(gulp.dest("public/js"))
        // Show filesize of generated files
        .pipe(plugins.filesize())
        // Add versions
        .pipe(plugins.revAll({
            transformFilename: transformRevFilename
        }))
        // Write to destination
        .pipe(gulp.dest("public/js"))
        // Save revision
        .pipe(plugins.revAll.manifest({fileName: "JSManifest.json"}))
        // Revert pipes
        .pipe(plugins.plumber.stop())
        .pipe(gulp.dest("revisions"));
});
// Generate gzip packages
gulp.task("js:build:gzip", function () {
    return gulp.src("public/js/*.js")
        .pipe(plugins.pako.gzip())
        .pipe(gulp.dest("public/js"));
});
// Complex task to build JS
gulp.task("js:build", function () {
    return runSequence("js:build:compile", "js:build:gzip");
});

//*********************************
//********** Build HTML ***********
//*********************************

// Build HTML entry point
gulp.task("html:build", ["css:build:compile", "js:build:compile"], function () {
    // Read sources
    var HTMLSourcesStream = gulp.src(["revisions/*.json", "assets/html/{,**/}*.html"]);
    HTMLSourcesStream = HTMLSourcesStream
        // Replace revisions due to manifiest
        .pipe(plugins.revCollector({
            replaceReved: true,
            revSuffix: "-[0-9a-f]{10}-?"
        }))
        .pipe(plugins.filter("{,**/}*.html"));
    // Production version
    if (argv.production) {
        HTMLSourcesStream = HTMLSourcesStream
            .pipe(plugins.cdnizer([
                // matches all root angular files
                "google:angular"
            ]));
    }
    return HTMLSourcesStream
        // Minify HTMl
        .pipe(plugins.htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest("public"));
});

//*********************************
//********** Copy tasks ***********
//*********************************
// Copy static resources
gulp.task("copy:static", function () {
    // Read sources
    return gulp.src("assets/static/**")
        .pipe(gulp.dest("public"))
        .pipe(plugins.pako.gzip())
        .pipe(gulp.dest("public"));
});
//*********************************
//********* Images tasks **********
//*********************************
gulp.task("images:build", function () {
    // Read sources
    return gulp.src("assets/images/*.*")
        .pipe(gulp.dest("public/images"))
        .pipe(plugins.pako.gzip())
        .pipe(gulp.dest("public/images"));
});
//**********************************
//********* Server tasks ***********
//**********************************
gulp.task("connect:static", function () {
    plugins.connect.server({
        root: "public",
        port: 3002
    });
});
gulp.task("server:api", function (done) {
    // Done triggers only once
    plugins.nodemon({
        script: "server/server.js",
        ext: "js json",
        ignore: ["assets/**", "public/**", "node_modules/**"],
        env: {
            NODE_ENV: argv.production ? "production" : "development",
            PORT: 4002,
            dataSrc: argv.db || "remote"
        }
    })
    .on("start", _.once(function () {
        setTimeout(function () {
            done();
        }, 1000);
    }))
    .on("change", function(){
            runSequence("js:server:hint");
        });
});

//*********************************
//********* Watch tasks ***********
//*********************************
gulp.task("watch", function () {
    gulp.watch("assets/html/{,**/}*.html", function () {
        runSequence("html:build");
    });
    gulp.watch("assets/stylus/{,**/}*.styl", function () {
        runSequence("css:build", "html:build", "clear:revisions");
    });
    gulp.watch("assets/js/{,**/}*.js", function () {
        runSequence("js:build", "html:build", "clear:revisions");
    });
    gulp.watch("assets/static/**", ["copy:static"]);
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
gulp.task("api:docs", function (done) {
    var apidoc = require("apidoc");
    apidoc.createDoc({
        src: "server/",
        dest: "docs/api/"
    });
    done();
});

gulp.task("server:docs", function () {
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

gulp.task("default", function () {
    runSequence("clean:previous:build",
        ["html:build", "copy:static", "images:build"],
        ["clear:revisions", "connect:static", "server:api", "js:server:hint"], ["watch", "tests"]);
});

gulp.task("docs", function () {
    runSequence("clean:docs", ["api:docs", "server:docs"]);
});
