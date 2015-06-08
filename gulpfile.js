'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
var del = require('del');
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var jasmine = require('gulp-jasmine');

var paths = {
	entries: ['src/main/js/main.js'],
	js: ['src/main/js/**/*.js'],
	testjs: ['src/test/js/**/*.js'],
	target: './',
	bundleFile: 'bundle.js'
};

gulp.task('clean', function (done) {
	del([paths.target + paths.bundleFile], done);
});

gulp.task('js', ['clean'], function () {

	return browserify({
		entries: paths.entries,
		debug: false
	})
		.bundle()
		.on('error', function (err) {
			gutil.log(err);
			this.emit('end');
		})
		.pipe(source(paths.bundleFile))
		.pipe(gulp.dest(paths.target));

});

gulp.task('watch', function () {
	var sources = paths.js;
	gulp.watch(sources, ['js']);
});

gulp.task('test', function () {
	return gulp
		.src(paths.testjs)
		.pipe(jasmine());
});

gulp.task('default', ['watch', 'js']);
