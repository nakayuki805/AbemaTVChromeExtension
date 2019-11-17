import gulp from 'gulp';
import gutil from 'gulp-util';
import livereload from 'gulp-livereload';
import args from './lib/args';
import hub from 'gulp-hub';

var tasks = new hub([
    './clean.js',
    './fonts.js',
    './images.js',
    './locales.js',
    './manifest.js',
    './pages.js',
    './rootfiles.js',
    './scripts.js',
    './sounds.js',
    './styles.js',
    './version.js',
    './chromereload.js' //諸々->chromereload->build->pack,defaultの順
    // './tasks/build.js'
    // './tasks/pack.js'
    // './tasks/default.js'
]);
gulp.registry(tasks);

// In order to make chromereload work you'll need to include
// the following line in your `scipts/background.ts` file.
//
//    import 'chromereload/devonly';
//
// This will reload your extension everytime a file changes.
// If you just want to reload a specific context of your extension
// (e.g. `pages/options.html`) include the script in that context
// (e.g. `scripts/options.js`).
//
// Please note that you'll have to restart the gulp task if you
// create new file. We'll fix that when gulp 4 comes out.

gulp.task('chromereload', cb => {
    // This task runs only if the
    // watch argument is present!
    if (!args.watch) return cb();

    // Start livereload server
    livereload.listen({
        reloadPage: 'Extension',
        quiet: !args.verbose
    });

    gutil.log('Starting', gutil.colors.cyan("'livereload-server'"));

    // The watching for javascript files is done by webpack
    // Check out ./tasks/scripts.js for further info.
    gulp.watch('app/manifest.json', gulp.series('manifest'));
    gulp.watch('app/styles/**/*.css', gulp.series('styles:css'));
    gulp.watch('app/styles/**/*.less', gulp.series('styles:less'));
    gulp.watch('app/styles/**/*.scss', gulp.series('styles:sass'));
    gulp.watch('app/pages/**/*.html', gulp.series('pages'));
    gulp.watch('app/_locales/**/*', gulp.series('locales'));
    gulp.watch('app/images/**/*', gulp.series('images'));
    gulp.watch('app/fonts/**/*.{woff,ttf,eot,svg}', gulp.series('fonts'));
});
