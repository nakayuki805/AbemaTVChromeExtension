import gulp from 'gulp'
import gulpif from 'gulp-if'
import livereload from 'gulp-livereload'
import args from './lib/args'

gulp.task('sounds', () => {
  return gulp.src('app/sounds/**/*')
    .pipe(gulp.dest(`dist/${args.vendor}/sounds`))
    .pipe(gulpif(args.watch, livereload()))
})
