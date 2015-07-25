var gulp       = require('gulp');
var browserify = require('browserify');
var gutil      = require('gulp-util');
var source     = require('vinyl-source-stream');

var logerr = function(err){ console.log(err); gutil.beep(); };

// ---------------------------------------------------
// JavaScript tasks
// ---------------------------------------------------
gulp.task('js', function(){
    browserify({
      entries: './js/app.js'
    })
    .bundle().on('error', logerr)
    .pipe(source('app.js'))
    .pipe(gulp.dest('../public'));
});

gulp.task('vendor', function(){
    browserify({
      entries: './js/global.js'
    })
    .bundle().on('error', logerr)
    .pipe(source('global.js'))
    .pipe(gulp.dest('../public'));
});

// ---------------------------------------------------
// Live Coding
// ---------------------------------------------------
gulp.task('watch', function(){
  gulp.watch('js/**/*.js', ['js', 'vendor']);
});
