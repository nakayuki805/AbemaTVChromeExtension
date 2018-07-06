//import requireDir from 'require-dir'
import hub from 'gulp-hub'

// Check out the tasks directory
// if you want to modify tasks!
//requireDir('./tasks')
hub([
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
    './tasks/chromereload.js',//諸々->chromereload->build->pack,defaultの順
    './tasks/build.js',
    './tasks/pack.js',
    './tasks/default.js',
])