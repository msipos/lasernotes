var babel = require("gulp-babel");
var concat = require('gulp-concat');
var del = require('del');
var gulp = require('gulp');
var minimist = require('minimist'); // CLI parsing
var nano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var webpack = require('webpack-stream');

var knownOptions = {
  string: 'env',
  default: {env: 'dev'}
};
var options = minimist(process.argv.slice(2), knownOptions);

console.log(options.env);
var version = '0003'; // Make sure it matches base.html, base_front.html, base_blog.html.

var config = {
    debug: options.env === 'dev',
    destination: '../backend/static',
    js: {
        inputLibs: [
            "bower_components/jquery/dist/jquery.js",
            "bower_components/bootstrap/dist/js/bootstrap.js",
            "bower_components/bootbox/bootbox.js",
            "bower_components/bootstrap-datepicker/dist/js/bootstrap-datepicker.js",
            "bower_components/sjcl/sjcl.js",
            "bower_components/underscore/underscore.js",
            "bower_components/backbone/backbone.js",
            "bower_components/urijs/src/URI.js",
            "bower_components/marked/marked.min.js",
            "bower_components/notifyjs/dist/notify.js"
            //"bower_components/react/react.js",
            //"bower_components/react/react-dom.js"
        ],
        outLibs: "js/libs_" + version + ".js",
        entry: "js/entry.js",
        input: [
            "js/**/*.js"
        ],
        out: "js/app_" + version + ".js"
    },
    css: {
        input: [
            "bower_components/bootstrap/dist/css/bootstrap.css",
            "bower_components/bootstrap-datepicker/dist/css/bootstrap-datepicker3.css",
            "bower_components/font-awesome/css/font-awesome.css",
            "css/**/*.css"
        ],
        out: "css/app_" + version + ".css"
    },
    fonts: {
        input: [
            "bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf",
            "bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff",
            "bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff2",
            "bower_components/font-awesome/fonts/*.*",
            "archive/fonts/*.*"
        ],
        out: "fonts"
    },
    ts: {
        input: [
            "templates/**/*.html"
        ],
        out: "ts"
    }
};

if (options.env === 'dev') {
  config.js.inputLibs.push("bower_components/bluebird/js/browser/bluebird.js");
} else {
  config.js.inputLibs.push("bower_components/bluebird/js/browser/bluebird.min.js");
}

gulp.task('clean', function() {
  del.sync([config.destination], {force: true});
});

gulp.task('fonts', ['clean'], function() {
    return gulp.src(config.fonts.input)
            .pipe(gulp.dest(config.destination + '/' + config.fonts.out));
});

gulp.task('jslibs', ['clean'], function() {
    var p = gulp.src(config.js.inputLibs).pipe(concat(config.js.outLibs));
    if (!config.debug) {
        p = p.pipe(uglify());
    }
    return p.pipe(gulp.dest(config.destination));
});

gulp.task('webpack', ['jslibs', 'clean'], function() {
    var p = gulp.src(config.js.entry)
        .pipe(webpack({
            output: {
                filename: config.js.out
            }
        }))
        .pipe(babel())
    if (!config.debug) {
        p = p.pipe(uglify());
    }
    return p.pipe(gulp.dest(config.destination));
});

gulp.task('css', ['clean'], function() {
    var p = gulp.src(config.css.input).pipe(concat(config.css.out));
    if (!config.debug) {
        p = p.pipe(nano());
    }
    return p.pipe(gulp.dest(config.destination));
});

gulp.task('ts', ['clean'], function() {
    return gulp.src(config.ts.input)
               .pipe(gulp.dest(config.destination + '/' + config.ts.out));
});

gulp.task('build', ['webpack', 'css', 'fonts', 'ts']);

gulp.task('watch', function() {
    var dirs = config.js.input;
    dirs = dirs.concat(config.css.input);
    dirs = dirs.concat(config.ts.input);
    gulp.watch(dirs, ['build']);
});

gulp.task('default', ['build', 'watch']);
