const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const sync = require('browser-sync').create();
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const plumber = require("gulp-plumber");
const csso = require('gulp-csso');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;
const concat = require('gulp-concat');
const webp = require('gulp-webp');
const devip = require('dev-ip');
const imagemin = require('gulp-imagemin');
const del = require('del');

// Styles

const styles = () => {
  return gulp.src('./Source/SCSS/style.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer({
      overrideBrowserslist: ['last 2 versions'],
      grid: true
    })]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest("./Source/CSS/"))
    .pipe(sync.stream());
}

exports.styles = styles;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'Source'
    },
    notify: false,
    cors: true,
    ui: false,
    open: false,
    host: devip(["192.168.1.76", "192.168.1.80"])
  });
  done();
}


exports.server = server;

// Scripts
// './node_modules/jquery/dist/jquery.js','./Source/JS/**/*.js'

const scripts = () => {
  return gulp.src([
    './node_modules/jquery/dist/jquery.js',
    './Source/JS/libs/*js',
    './Source/JS/blocks/*.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest("./Source/JS/"))
    .pipe(sync.stream());
}

exports.scripts = scripts;

// Watcher

const watcher = () => {
  gulp.watch("Source/SCSS/**/*.scss", gulp.series("styles"));
  gulp.watch("Source/*.html").on("change", sync.reload);
  gulp.watch("Source/JS/blocks/*.js", gulp.series("scripts"));
}

// Images Webp

const createWebp = () => {
  return gulp.src("Source/img/img/*.{jpg,png}")
    .pipe(webp({
      quality: 80
    }))
    .pipe(gulp.dest('Source/img/img/'));
}

exports.createWebp = createWebp;


// Imagemin

const images = () => {
  return gulp.src("Source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.mozjpeg({
        quality: 85,
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("dist/img"))
}

exports.images = images;

// CleanDist

const cleanDist = () => {
  return del("dist")
}

exports.cleanDist = cleanDist;

// build 

const build = () => {
  return gulp.src([
      "Source/CSS/**",
      "Source/fonts/**",
      "Source/img/img/*.webp",
      "Source/JS/**",
      "Source/*.html",
    ], {
      base: "Source"
    })
    .pipe(gulp.dest("dist"))
}

exports.build = gulp.series(
  cleanDist, images, build
)

exports.default = gulp.series(
  styles, server, watcher
);

// build Server


const doneServer = (done) => {
  sync.init({
    server: {
      baseDir: 'dist'
    },
    notify: false,
    cors: true,
    ui: false,
    tunnel: 'reduslimbbsko',
    open: false,
    host: devip()
  });
  done();
}

exports.doneServer = doneServer;