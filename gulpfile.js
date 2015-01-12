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


gulp.task("stylus", function () {
    // Read sources
    var CSSSourcesStream = gulp.src(configs.assets.src.styles);
    // Source map initialization
    CSSSourcesStream.pipe(plugins.sourcemaps.init())
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
        // Versionization
        .pipe(plugins.revAll())
        // Notify user
        .pipe(plugins.notify("CSS ready"))
        // Write maps
        .pipe(plugins.sourcemaps.write(".")).on("error", error)
        // Write to destination
        .pipe(gulp.dest(configs.assets.dest.styles));
});