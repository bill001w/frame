var gulp = require('gulp'),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');

gulp.task('default', function () {
    gulp.src('./less/weui.less')
        .pipe(less())
        .pipe(gulp.dest('dist'));
});

gulp.watch(['less/**/*.less'], ['default']);
