'use strict';

var gulp         = require('gulp'),
    watch        = require('gulp-watch'),
    uglify       = require('gulp-uglify'),
    sass         = require('gulp-sass'),
    rigger       = require('gulp-rigger'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS     = require('gulp-clean-css'),
    imagemin     = require('gulp-imagemin'),
    pngquant     = require('imagemin-pngquant'),
    cache        = require('gulp-cache'),
    spritesmith  = require('gulp.spritesmith'),
    rimraf       = require('rimraf'),
    browserSync  = require("browser-sync"),
    notify       = require("gulp-notify"),
    plumber      = require('gulp-plumber'),
    reload       = browserSync.reload;

var path = {
    build: {
        html: 'build/',
        js: 'build/js',
        css: 'build/css',
        img: 'build/img',
        fonts: 'build/fonts',
        spritesImg: 'build/img/sprite',
        spritesSCSS: 'src/style/partials'
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/main.js',
        style: 'src/style/main.scss',
        img: 'src/style/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        sprites: 'src/style/sprite/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/style/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        sprites: 'src/style/sprite/*.*'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    host: 'localhost',
    port: 9000,
    logPrefix: "LiveReload"
};

gulp.task('html:build', function() {
    gulp.src(path.src.html)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(notify("HTML Done!!!"))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function() {
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js))
        .pipe(notify("JS Done!!!"))
        .pipe(reload({stream: true}));
});

gulp.task('style:build', function() {
    gulp.src(path.src.style)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 3 versions', '>1%', 'ie 9'],
            cascade: false
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest(path.build.css))
        .pipe(notify("CSS Done!!!"))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function(){
    gulp.src(path.src.img)
        .pipe(cache(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()],
        interlaced: true
    })))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('sprite:build', function() {
    var spriteData =
        gulp.src(path.src.sprites)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: 'sprite.scss',
            imgPath: '../img/sprite/sprite.png',
            padding: 2
        }));
        spriteData.img.pipe(gulp.dest(path.build.spritesImg));
        spriteData.css.pipe(gulp.dest(path.build.spritesSCSS));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);

gulp.task('watch', function() {
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
    watch([path.watch.sprites], function(event, cb) {
        gulp.start('sprite:build');
    });
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function(cb) {
    rimraf(path.clean, cb);
});

gulp.task('clear', function() {
    return cache.clearAll();
});

gulp.task('default', [ 'build', 'webserver', 'watch']);
