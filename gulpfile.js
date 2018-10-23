const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const browserSync = require('browser-sync').create();

gulp.task('clean', () => {
    return gulp.src('dist')
      .pipe($.clean());
});

gulp.task('html', () => {
    return gulp.src('src/*.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('styles', () => {
    return gulp.src('src/styles/*.scss')
        .pipe(
            $.sass({
                outputStyle: 'compressed'
            }).on('error', $.sass.logError))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('scripts', () => {
    return gulp.src('src/scripts/**/*.js')
		.pipe($.eslint())
		.pipe($.eslint.format())
		.pipe($.babel())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('images', () => {
    return gulp.src('src/images/*')
		.pipe($.imagemin())
        .pipe(gulp.dest('dist/images'));
});

gulp.task('watch', ['images', 'scripts', 'styles', 'html'], () => {
	gulp.watch('src/scripts/**/*.js', ['scripts']);
	gulp.watch('src/styles/**/*.scss', ['styles']);
	gulp.watch('src/images/**/*', ['images']);
	gulp.watch('src/**/*.html', ['html']);
});

gulp.task('serve', ['watch'], () => browserSync.init({
	files: ['dist/**', '!dist/**/*.map'],
	server: './dist'
}));

gulp.task('default', ['serve']);

gulp.task('build', ['clean'], () => {
    gulp.start('images', 'scripts', 'styles', 'html');
});
