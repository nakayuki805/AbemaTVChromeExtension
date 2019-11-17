import gulp from 'gulp';
import hub from 'gulp-hub';
//import gulpSequence from 'gulp-sequence'
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
gulp.task(
    'build',
    gulp.series(
        'clean',
        gulp.parallel(
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
    )
);
// export const build = gulp.series(
//     'clean',
//     gulp.parallel(
//         'manifest',
//         'scripts',
//         'styles',
//         'pages',
//         'locales',
//         'images',
//         'fonts',
//         'sounds',
//         'rootfiles',
//         'chromereload'
//     )
// );
