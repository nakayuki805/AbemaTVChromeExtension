//import requireDir from 'require-dir'
import gulp from 'gulp';
import hub from 'gulp-hub';
// import build from './tasks/build';
// Check out the tasks directory
// if you want to modify tasks!
//requireDir('./tasks')
var tasks = new hub([
    './tasks/clean.js',
    './tasks/fonts.js',
    './tasks/images.js',
    './tasks/locales.js',
    './tasks/manifest.js',
    './tasks/pages.js',
    './tasks/rootfiles.js',
    './tasks/scripts.js',
    './tasks/sounds.js',
    './tasks/styles.js',
    './tasks/version.js',
    './tasks/chromereload.js' //諸々->chromereload->build->pack,defaultの順
    // './tasks/build.js'
    // './tasks/pack.js'
    // './tasks/default.js'
]);
var buildTasks = new hub([
    './tasks/build.js'
    // './tasks/pack.js'
    // './tasks/default.js'
]);
// gulp.registry(tasks);
gulp.registry(buildTasks);
// import pack from './tasks/pack';

// export { build, pack };
// exports.build = build;
// gulp.task('build', build);

// pack
import { colors, log } from 'gulp-util';
import zip from 'gulp-zip';
import packageDetails from './package.json';
import args from './tasks/lib/args';
// import hub from 'gulp-hub';

function getPackFileType() {
    switch (args.vendor) {
        case 'firefox':
            return '.xpi';
        default:
            return '.zip';
    }
}
// var tasks = new hub(['./build.js']);
// gulp.registry(tasks);

// gulp.task(
//     'pack',
//     gulp.series('build', () => {
//         let name = packageDetails.name;
//         let version = packageDetails.version;
//         let filetype = getPackFileType();
//         let filename = `${name}-${version}-${args.vendor}${filetype}`;
//         return gulp
//             .src(`dist/${args.vendor}/**/*`)
//             .pipe(zip(filename))
//             .pipe(gulp.dest('./packages'))
//             .on('end', () => {
//                 let distStyled = colors.magenta(`dist/${args.vendor}`);
//                 let filenameStyled = colors.magenta(`./packages/${filename}`);
//                 log(`Packed ${distStyled} to ${filenameStyled}`);
//             });
//     })
// );
export const pack = gulp.series('build', () => {
    let name = packageDetails.name;
    let version = packageDetails.version;
    let filetype = getPackFileType();
    let filename = `${name}-${version}-${args.vendor}${filetype}`;
    return gulp
        .src(`dist/${args.vendor}/**/*`)
        .pipe(zip(filename))
        .pipe(gulp.dest('./packages'))
        .on('end', () => {
            let distStyled = colors.magenta(`dist/${args.vendor}`);
            let filenameStyled = colors.magenta(`./packages/${filename}`);
            log(`Packed ${distStyled} to ${filenameStyled}`);
        });
});

// default
gulp.task('default', gulp.series('build'));
