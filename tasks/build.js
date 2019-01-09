import gulp from 'gulp'
//import gulpSequence from 'gulp-sequence'

gulp.task('build', gulp.series(
  'clean', gulp.parallel(
    'manifest',
    'scripts',
    'styles',
    'pages',
    'locales',
    'images',
    'fonts',
    'sounds',
    'rootfiles',
    'chromereload'
  )
))
