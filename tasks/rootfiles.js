import gulp from 'gulp'
import gulpif from 'gulp-if'
import livereload from 'gulp-livereload'
import args from './lib/args'

gulp.task('rootfiles', () => {
  return gulp.src('app/*.{js,html}')
    .pipe(gulp.dest(`dist/${args.vendor}/`))
    .pipe(gulpif(args.watch, livereload()))
})
