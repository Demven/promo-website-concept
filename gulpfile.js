var gulp = require("gulp"),
    argv = require("yargs").argv,
    bundle = require('gulp-bundle-assets'),
    rev = require('gulp-rev'),
    revReplace = require("gulp-rev-replace"),
    runSequence = require("run-sequence").use(gulp); // Task to run in order

// Load all gulp plugins
var plugins = require("gulp-load-plugins")({
    pattern: "gulp-*",
    scope: ["devDependencies"],
    lazy: true
});

//*********************************
//********* Clean tasks ***********
//*********************************
var del = require("del");
// Clean previous build
gulp.task("build:clean", function (cb) {
    return del(["public"], cb);
});


//*********************************
//*********** Build CSS ***********
//*********************************
// Build CSS files
gulp.task("build:css", function () {
    // Read sources
    var src = gulp.src("assets/stylus/*.styl");
    // Generate stylus code
    src = src
        .pipe(plugins.stylus({
            /*compress: true,
            // Generate inline sources
            sourcemap: {
                inline: true
            }*/
        }))
        .pipe(plugins.sourcemaps.init({
            loadMaps: true
        }))
        // PostCSS process to add prefixes
        .pipe(plugins.autoprefixer())
        // Source map write
        .pipe(plugins.sourcemaps.write("."))
        // Write to distributive folder
        .pipe(gulp.dest("public/css"))
        .pipe(plugins.filter("*.css"))
        // File size of files
        .pipe(plugins.filesize());

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

    return src;
});

//*********************************
//********** Build HTML ***********
//*********************************

// Build HTML entry point
gulp.task("build:html", function () {
    // Read sources
    var src = gulp.src(["assets/html/**"]);
    // Minify HTMl
    src = src
        .pipe(plugins.htmlmin({
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

//***********************************
//********** Revisions ***********
//***********************************
gulp.task('rev-manifest', function () {
    return gulp.src(['public/main.css', 'public/main.js'], {base: 'public'})
        .pipe(rev())
        .pipe(gulp.dest('public'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('public')); // write manifest to build dir;
});
gulp.task("rev:replace", function(){
    var manifest = gulp.src("public/rev-manifest.json");

    return gulp.src("public/dar.html")
        .pipe(revReplace({manifest: manifest}))
        .pipe(gulp.dest('public'));
});


//***********************************
//********** Complex tasks ***********
//***********************************
gulp.task("build", function (callback) {
    runSequence("build:clean",
        ["build:css", "build:js"], ["build:fonts", "build:images", "build:vendors"],
        "build:html", "build:gzip", callback);
});

gulp.task("watch", function () {
    gulp.watch("assets/html/**", function () {
        runSequence("build:html");
    });
    gulp.watch("assets/stylus/**", function () {
        runSequence("build:css", "bundle", "rev");
    });
    gulp.watch("assets/js/**", function () {
        runSequence("build:js", "bundle", "rev");
    });
    gulp.watch("assets/images/**", function () {
        runSequence("build:images");
    });
});

// Create bundles for styles and js
gulp.task('bundle', function() {
    return gulp.src('./bundle.config.js')
        .pipe(bundle())
        .pipe(gulp.dest('./public'));
});

// Create revisions
gulp.task("rev", function (callback) {
    runSequence("rev-manifest", "rev:replace", callback);
});

gulp.task("default", function (callback) {
    runSequence("build", "bundle", "rev", ["watch"], callback);
});

/** DEFAULT COPY
 * @see https://github.com/krry/heroku-buildpack-nodejs-gulp-bower
 */
gulp.task("heroku:dev", function (callback) {
    runSequence("build", "bundle", "rev", callback);
});

gulp.task("production", function (callback) {
    runSequence("build", "bundle", "rev", callback);
});

