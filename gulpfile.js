var gulp = require('gulp')
, path = require('path')
, extend = require('extend')
, gutil = require('gulp-util')
, stream = require('stream')
, merge = require('merge-stream')
, sass = require('gulp-sass')
, rename = require('gulp-rename')
, plumber = require('gulp-plumber')
, connect = require('gulp-connect')
, rimraf = require('gulp-rimraf')
, debug = require('gulp-debug')
, wrap = require('gulp-headerfooter')
, site_config = require('config')
, hbars = require('handlebars')


var build_page = new stream.Transform({
  objectMode: true,
  transform: function(chunk, encoding, next) {
    var html = build_html(chunk)
    this.push(html);
    next(); //AKA done
  }
});

function build_html(file) {
  var html = file.contents.toString()
    , meta = {}
    , scripts = {}
    , page_id = path.basename(file.path, '.hbs')

  // HTML HELPERS
  hbars.registerHelper('PANELCONTROLS', _panel_controls)
  hbars.registerHelper('MULTICOLUMN', _multi_column)
  hbars.registerHelper('COLUMN', _column)
  hbars.registerHelper('IMAGELINK', _img_link)
  hbars.registerHelper('BUTTON', _button)
  
  // INFO ONLY HELPERS
  hbars.registerHelper('META', __meta)
  hbars.registerHelper('INCLUDESCRIPT', __script)
  function __meta(opts) { meta = opts.hash; return ''; }
  function __script(opts) { if(opts.hash.name) scripts[opts.hash.name] = opts.hash; return ''; }  

  try{
    var ctx = extend({}, site_config, {page_id: page_id})
      , tpl = hbars.compile(html)
      , rendered = tpl(ctx) 
      , processed = update_placeholders(rendered, meta, scripts); 
  }
  catch(err){
    throw new gutil.PluginError('handlebars compilation issue: ', err, {
      fileName: file.path
    });
  }
  
  file.contents = new Buffer(processed)
  return file
}

function update_placeholders(rendered, meta, scripts) {
  //take care of meta tags
  if(Object.keys(meta).length){
    rendered = update_meta(rendered, meta);
  }

  if(Object.keys(scripts).length){
   rendered = update_scripts(rendered, scripts);
  }

  return rendered;
}

function update_scripts(rendered, scripts){
  Object.keys(scripts).forEach(function(key){
    if(scripts[key].head)
      rendered = rendered.replace(/^(<head>[\w\W]*?)<\/head>$/m, '$1' + '<script src="' + scripts[key].location + '"></script>\n</head>')
    else
      rendered = rendered.replace(/^(<body>[\w\W]*?)<\/body>$/m, '$1' + '<script src="' + scripts[key].location + '"></script>\n</body>')
  })

  return rendered;
}

function update_meta(rendered, meta){
  if(meta.title){
    rendered.replace('<title>[\w\s]*</title>', '<title>' + meta['title'] + '</title>');
    delete meta.title;
  }
  
  Object.keys(meta).forEach(function(key){
    rendered = rendered.replace(/^(<head>[\w\W]*?)<\/head>$/m, '$1' + '<meta name="' + key + '" content="' + meta[key] + '">\n</head>')  
  })

  return rendered;
}

function _panel_controls(info){
  var left_arrow = '<div class="slide-container-arrow slide-container-arrow-left slide-container-arrow-left-green"></div>'
  var right_arrow = '<div class="slide-container-arrow slide-container-arrow-right slide-container-arrow-right-green"></div>'
  
  var control_circles = '<div class="slide-container-control-circles">' + 
        '<div class="slide-container-control-circles-inner">' + 
        '<div class="control-circle left-control-circle"></div>' + 
        '<div class="control-circle middle-control-circle"></div>' + 
        '<div class="control-circle right-control-circle active-control-circle"></div>' +
        '</div></div>'

  return new hbars.SafeString(left_arrow + right_arrow + control_circles);
}

function _img_link(info){
  var opts = info.hash;
  opts.img || (opts.img = "/img/default-house.png")
  opts.href || (opts.href = "/browse/houses")

  var html = '<a href="' + opts.href + '" class="img-link">' +
        '<img src="' + opts.img + '" class="' + opts.cls + '">' + '</a>';

  return new hbars.SafeString(html);  
}

function _button(info){
  var opts = info.hash;
  opts.href || (opts.href = "/browse/houses")
  opts.cls || (opts.cls = "default-btn")
  opts.text || (opts.text = '')

  var html = '<div class="btn ' + opts.cls + '">' +
        '<a href="' + opts.href + '" class="btn-link">' + opts.text +
             '</a>' + '</div>';

  return new hbars.SafeString(html);  
}

function _multi_column(info){
  var opts = info.hash;
  opts.cls || (opts.cls = 'column-wrapper')
  opts.num || (opts.num = 2)

  var html = '<section class="' + opts.cls + ' multicolumn-' + opts.num + '">' +
             info.fn(this) + '</section>'

  return new hbars.SafeString(html);  
}

function _column(info){
  var opts = info.hash
    , html = ''

  opts.cls || (opts.cls = '')
  
  if(opts.i){
    html = '<div class="' + opts.cls + ' column column-' + opts.i + '">' + 
             info.fn(this) + '</div>'
  }
  
  return new hbars.SafeString(html);
}

gulp.task('js-clean', function () {
  gulp.src('dist/js/**/*.js', {read: false}).pipe(rimraf())
})

gulp.task('js', ['js-clean'], function () {
  gulp.src('./src/js/**/*.js')
    .pipe(gulp.dest('./dist/js'))
    .pipe(connect.reload())
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
    .pipe(build_page)
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
