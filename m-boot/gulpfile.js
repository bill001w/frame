var gulp = require('gulp'),
    less = require('gulp-less'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    cssmin = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer');

gulp.task('less', function () {
    gulp.src('./less/pc/m-boot.less')
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 100 versions'],
            cascade: false,
            remove: false
        }))
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/less/pc/'));

    gulp.src('./less/pc/**/*.js')
        .pipe(concat('m-boot.js'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/less/pc/'));

    gulp.src('./less/mobile/m-boot.less')
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 100 versions'],
            cascade: false,
            remove: false
        }))
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/less/mobile/'));

    gulp.src('./less/mobile/**/*.js')
        .pipe(concat('m-boot.js'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/less/mobile/'));
});

gulp.task('sass', function () {
    gulp.src('./sass/pc/m-boot.scss')
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 100 versions'],
            cascade: false,
            remove: false
        }))
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/sass/pc/'));

    gulp.src('./sass/pc/**/*.js')
        .pipe(concat('m-boot.js'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/sass/pc/'));

    gulp.src('./sass/mobile/m-boot.scss')
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 100 versions'],
            cascade: false,
            remove: false
        }))
        // .pipe(cssmin())
        // .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/sass/mobile/'));

    gulp.src('./sass/mobile/**/*.js')
        .pipe(concat('m-boot.js'))
        // .pipe(uglify())
        // .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/sass/mobile/'));
});

// gulp.watch(['./src/less/**/*.less', './src/**/*.js'], ['default']);