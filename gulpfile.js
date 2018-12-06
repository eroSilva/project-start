const gulp          = require('gulp');
const $             = require('gulp-load-plugins')();
const webpack       = require('webpack-stream');
const browserSync   = require('browser-sync');
const mqpacker      = require('css-mqpacker');
const cssnano       = require('cssnano');
const autoprefixer  = require('autoprefixer');

const paths = {
	extras: ['src/*.*', 'src/fonts/**/*'],
	styles: 'src/styles/**/*.scss',
	scripts: 'src/scripts/**/*.js',
	images: 'src/images/**/*.{png,jpeg,jpg,svg,gif}',
	dest: {
		styles: 'dist/css',
		scripts: 'dist/js',
		images: 'dist/img',
		extras: 'dist'
	}
}

gulp.task('clean', () => {
    return gulp.src(paths.dest.extras)
      .pipe($.clean());
});

gulp.task('extras', () => {
	return gulp.src(paths.extras, { base: 'src' })
		.pipe(gulp.dest(paths.dest.extras));
});

gulp.task('styles', () => {
	return gulp.src(paths.styles)
		.pipe($.plumber())
		.pipe( $.util.env.production ? $.util.noop() : $.sourcemaps.init() )
        .pipe(
            $.sass({
				outputStyle: $.util.env.production ? 'compressed' : 'nested',
				errLogToConsole: true,
				includePaths: [
					'node_modules',
					'src/styles'
				]
			}).on('error', $.sass.logError)
		)
		.pipe(
			$.postcss([
				mqpacker({ sort: true }),
				cssnano({
					autoprefixer: false,
					reduceIdents: false
				})
			])
		)
		.pipe($.postcss([autoprefixer()]))
		.pipe($.sourcemaps.write('.'))
		.pipe(gulp.dest(paths.dest.styles));
});

gulp.task('scripts', () => {
    return gulp.src(paths.scripts)
		.pipe($.eslint())
		.pipe($.eslint.format())
		.pipe(webpack({
			mode: $.util.env.production ? 'production' : 'development',
			output: {
				filename: 'app.min.js'
			},
			resolve: {
				modules: [
					'src/scripts',
					'node_modules'
				],
			},
			module: {
				rules: [
					{
						test: /\.m?js$/,
						exclude: /(node_modules)/,
						use: {
							loader: 'babel-loader',
							options: {
								presets: ['@babel/preset-env']
							}
					  }
					}
				]
			},
			plugins: [],
			devtool: $.util.env.production ? false : '#source-map'
		}))
        .pipe(gulp.dest(paths.dest.scripts));
});

gulp.task('images', () => {
    return gulp.src(paths.images)
		.pipe($.imagemin({
			optimizationLevel: $.util.env.production ? 5 : 1,
			progressive: true,
			interlaced: true,
			svgoPlugins: [{ removeViewBox: true }]
		}))
        .pipe(gulp.dest(paths.dest.images));
});

gulp.task('watch', ['scripts', 'styles', 'images', 'extras'], () => {
	gulp.watch(paths.scripts, ['scripts']);
	gulp.watch(paths.styles, ['styles']);
	gulp.watch(paths.images, ['images']);
	gulp.watch(paths.extras, ['extras']);
});

gulp.task('serve', ['watch'], () => browserSync({
	files: ['dist/**', '!dist/**/*.map'],
	server: {
		baseDir: ['dist']
	},
	open: !$.util.env.no
}));

gulp.task('default', ['clean'], () => gulp.start('serve'));

gulp.task('build', ['clean'], () => {
	$.util.env.production = true;

    gulp.start('images', 'scripts', 'styles', 'extras');
});
