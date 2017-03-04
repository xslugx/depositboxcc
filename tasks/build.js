'use strict';

var gulp = require('gulp');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var less = require('gulp-less');
var jetpack = require('fs-jetpack');
var kill = require('tree-kill');

var utils = require('./utils');

var projectDir = jetpack;
var srcDir = projectDir.cwd('./app');
var destDir = projectDir.cwd('./build');

var paths = {
    jsCodeToTranspile: [
        'app/**/*.js',
        '!app/main.js',
        '!app/spec.js',
        '!app/node_modules/**',
        '!app/lib/**'
    ],
    copyFromAppDir: [
        './main.js',
        './spec.js',
        './node_modules/**',
        './lib/**',
        './**/*.exe',
        './**/*.html',
        './**/*.dll',
        './images/**'
    ],
}

// -------------------------------------
// Tasks
// -------------------------------------

gulp.task('clean', function(callback) {
    return destDir.dirAsync('.', { empty: true });
});


var copyTask = function () {
    return projectDir.copyAsync('app', destDir.path(), {
        overwrite: true,
        matching: paths.copyFromAppDir
    });
};
gulp.task('copy', ['clean'], copyTask);
gulp.task('copy-watch', copyTask);


var transpileTask = function () {
    return gulp.src(paths.jsCodeToTranspile)
    .pipe(sourcemaps.init())
    .pipe(babel({ modules: 'amd' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(destDir.path()));
};
gulp.task('transpile', ['clean'], transpileTask);
gulp.task('transpile-watch', transpileTask);


var lessTask = function () {
    return gulp.src('app/stylesheets/main.less')
    .pipe(less())
    .pipe(gulp.dest(destDir.path('stylesheets')));
};
gulp.task('less', ['clean'], lessTask);
gulp.task('less-watch', lessTask);


gulp.task('finalize', ['clean'], function () {
    var manifest = srcDir.read('package.json', 'json');
    switch (utils.getEnvName()) {
        case 'development':
            // Add "dev" suffix to name, so Electron will write all
            // data like cookies and localStorage into separate place.
            manifest.name += '-dev';
            manifest.productName += '_dev';
            break;
        case 'test':
            // Add "test" suffix to name, so Electron will write all
            // data like cookies and localStorage into separate place.
            manifest.name += '-test';
            manifest.productName += '_test';
            // Change the main entry to spec runner.
            manifest.main = 'spec.js';
            break;
    }
    destDir.write('package.json', manifest);

    var configFilePath = projectDir.path('config/env_' + utils.getEnvName() + '.json');
    destDir.copy(configFilePath, 'env_config.json');
});


gulp.task('watch', function () {
    gulp.watch(paths.jsCodeToTranspile, ['transpile-watch']);
    gulp.watch(paths.copyFromAppDir, { cwd: 'app' }, ['copy-watch']);
    gulp.watch('app/**/*.less', ['less-watch']);
});


gulp.task('build', ['transpile', 'less', 'copy', 'finalize']);