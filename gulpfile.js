/**
 * Created by Dakal Oleksandr on 1/12/15.
 */

var gulp = require("gulp"),
// Load all gulp plugins
    plugins = require("gulp-load-plugins")({
        pattern: "gulp-*",
        scope: ["devDependencies"],
        lazy: true
    }),
// Build configurations
    configs = require("./build/configs.json"),
// Log function that throw error and exit from task
    error = function (error) {
        plugins.notify.onError(["Error plugin: " + error.plugin, error.message].join("\n"));
        this.end();
    };


gulp.task("css:build", function () {
    // Read sources
    var CSSSourcesStream = gulp.src(configs.assets.src.styles);
    // Source map initialization
    return CSSSourcesStream.pipe(plugins.sourcemaps.init())
        // Compile stylus
        .pipe(plugins.stylus()).on("error", error)
        // Validate CSS
        .pipe(plugins.csslint()).on("error", error)
        // PostCSS process to add prefixes
        .pipe(plugins.autoprefixer({
            // Here will be specific versions of browser
        })).on("error", error)
        // Compress css
        .pipe(plugins.csso()).on("error", error)
        // Add versions
        .pipe(plugins.revAll())
        // Notify user
        .pipe(plugins.notify("CSS ready"))
        // Write maps
        .pipe(plugins.sourcemaps.write(".")).on("error", error)
        // Write to destination
        .pipe(gulp.dest(configs.assets.dest.styles))
        // Save revision
        .pipe(plugins.revAll.manifest({ fileName: "CSSManifest.json" }))
        .pipe(gulp.dest(configs.assets.dest.revisions));
});

gulp.task("html:build", function () {
    // Read sources
    var HTMLSourcesStream = gulp.src([configs.assets.src.revisions, configs.assets.src.html]);
    return HTMLSourcesStream.pipe(plugins.revCollector({
        replaceReved: true
    }))
        // Minify
        //.pipe(plugins.htmlmin()).on("error", error)
        .pipe(gulp.dest(configs.assets.dest.html));
});