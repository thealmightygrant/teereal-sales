var gulp = require('gulp')
, gutil = require('gulp-util')
, sass = require('gulp-sass')
, rename = require('gulp-rename')
, plumber = require('gulp-plumber')
, connect = require('gulp-connect')
, rimraf = require('gulp-rimraf')
, debug = require('gulp-debug')
, wrap = require('gulp-headerfooter')
, through2 = require('through2')
, browserify = require('browserify')
, merge_stream = require('merge-stream')
, src_stream = require('vinyl-source-stream')
, watchify = require('watchify')
// L==> for use with browserify during watch, see http://tylermcginnis.com/reactjs-tutorial-pt-2-building-react-applications-with-gulp-and-browserify/
, uglify = require('gulp-uglify')
, build_html = require('./_gulp/compile')

var build_page = function(chunk, encoding, next) {
    var html = build_html(chunk)
    this.push(html);
    next(); 
};

gulp.task('js-clean', function () {
  gulp.src('dist/js/**/*.js', {read: false}).pipe(rimraf())
})

gulp.task('js', ['js-clean'], function () {
  //var dynamic_stream = 
  browserify('./src/js/main.js')
    .bundle()
  //.pipe(uglify()) //NOTE: only for production
    .pipe(src_stream('main.js'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(connect.reload())
  
  //var static_stream = gulp.src('./src/js/vendor/*.js')
  //      .pipe(gulp.dest('./dist/js'))

  //return merge_stream(dynamic_stream, static_stream);
})

gulp.task('assets-clean', function () {
  gulp.src(['dist/img'], {read: false}).pipe(rimraf())
})

gulp.task('assets', ['assets-clean'], function () {
  gulp.src('./assets/**')
    .pipe(gulp.dest('./dist/'))
})

gulp.task('css-clean', function () {
  gulp.src('dist/css/**/*.css', {read: false}).pipe(rimraf())
})

gulp.task('sass', ['css-clean'], function () {
  gulp.src('./src/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(rename({extname: '.css'}))
    .pipe(gulp.dest('./dist/css'))
    .pipe(connect.reload())
})

gulp.task('html-clean', function () {
  gulp.src(['dist/*','!dist/css','!dist/js','!dist/img'], {read: false}).pipe(rimraf())
})
 
gulp.task('html', ['html-clean'], function () {
  gulp.src('src/templates/**/*.hbs')
    .pipe(wrap.header('./src/partials/header.hbs'))
    .pipe(wrap.footer('./src/partials/footer.hbs'))
    .pipe(through2.obj(build_page))
    .pipe(rename({extname: '.html'}))
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload())
})

gulp.task('connect', function() {
  connect.server({
    port: 8000,
    root: 'dist/',
    livereload: true
  });
});

gulp.task('sass:watch', ['sass'], function () {
  gulp.watch('./src/sass/**/*.scss', ['sass']);
})

gulp.task('html:watch', ['html'], function () {
  gulp.watch('./src/**/*.hbs', ['html']);
})

gulp.task('js:watch', ['js'], function () {
  gulp.watch('./src/js/**/*.js', ['js']);
})

gulp.task('assets:watch', ['assets'], function () {
  gulp.watch('./assets/**/*.*', ['assets']);
})

gulp.task('watch', ['sass:watch', 'html:watch', 'js:watch', 'assets:watch'])

gulp.task('default', ['html', 'js', 'sass', 'assets'])

gulp.task('serve', ['watch', 'connect'])
