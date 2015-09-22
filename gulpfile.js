var gulp = require('gulp');
var merge = require('merge-stream');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var handlebarsHTML = require('gulp-compile-handlebars');

gulp.task('sass', function () {
  gulp.src('./src/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist/css'));
});
 
gulp.task('sass:watch', function () {
  gulp.watch('./src/sass/**/*.scss', ['sass']);
});

gulp.task('compile-html', function () {
  return gulp.src('src/templates/**/*.hbs')
    .pipe(handlebarsHTML({}, {
      batch: ["./src/partials"]
    }))
    .pipe(rename({extname: '.html'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['compile-html']);
