var gulp = require('gulp')
, path = require('path')
, extend = require('extend')
, gutil = require('gulp-util')
, stream = require('stream')
, merge = require('merge-stream')
, sass = require('gulp-sass')
, rename = require('gulp-rename')
, plumber = require('gulp-plumber')
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
  var html = '<div class="slide-container-arrow slide-container-arrow-left slide-container-arrow-left-green"></div>' +
    '<div class="slide-container-arrow slide-container-arrow-right slide-container-arrow-right-green"></div>' + 
    '<div class="slide-container-control-circles">' + 
    '<div class="slide-container-control-circles-inner">' + 
    '<div class="control-circle left-control-circle"></div>' + 
    '<div class="control-circle middle-control-circle"></div>' + 
    '<div class="control-circle right-control-circle active-control-circle"></div></div></div>';

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
  
gulp.task('js', function () {
  gulp.src('./src/js/**/*.js')
    .pipe(gulp.dest('./dist/js'))
})


gulp.task('sass', function () {
  gulp.src('./src/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(rename({extname: '.css'}))
    .pipe(gulp.dest('./dist/css'))
})
 
gulp.task('html', function () {
  gulp.src('src/templates/**/*.hbs')
    .pipe(wrap.header('./src/partials/header.hbs'))
    .pipe(wrap.footer('./src/partials/footer.hbs'))
    .pipe(build_page)
    .pipe(rename({extname: '.html'}))
    .pipe(gulp.dest('dist'))
})

gulp.task('sass:watch', function () {
  gulp.watch('./src/sass/**/*.scss', ['sass']);
})

gulp.task('html:watch', function () {
  gulp.watch('./src/**/*.hbs', ['html']);
})

gulp.task('js:watch', function () {
  gulp.watch('./src/js/**/*.js', ['js']);
})


gulp.task('watch', ['sass:watch', 'html:watch', 'js:watch'])

gulp.task('default', ['html', 'js', 'sass'])
