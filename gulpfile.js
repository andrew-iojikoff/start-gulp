var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create(),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    del = require('del'),
    gulpIf = require('gulp-if'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    notify = require('gulp-notify'),  
    runSequence = require('run-sequence'),
    cssnano = require('gulp-cssnano'),
    sourcemaps   = require('gulp-sourcemaps');

gulp.task('sass', function(){
  return gulp.src('src/styles/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
        outputStyle: ':nested'                  
    }))
    .on('error', notify.onError({
        title: 'SASS',
        message: '<%= error.message %>' 
    }))
    .pipe(autoprefixer(['last 15 versions', '> 1%'], {cascade: false}))  
    .pipe(gulp.dest('src/styles/'))
    .pipe(cssnano())
    .pipe(rename({
        suffix: '.min',                          
        basename: 'styles'
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('src/styles/'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('_sass', function(){
    return gulp.src('src/styles/**/*.scss')
    .pipe(sass())
    .pipe(autoprefixer(['last 15 versions', '> 1%'], {cascade: false}))
    .pipe(cssnano())
    .pipe(rename({
        suffix: '.min',                          
        basename: 'styles'
    }))
    .pipe(gulp.dest('dist/styles/'));
});

gulp.task('browserSync', function() {
    browserSync.init({
         server: {
            baseDir: "src/",                   
            index: "index.html"
        },
        notify: false                           
    });
});

gulp.task('img', function (){
    return gulp.src('src/images/**/*')
    .pipe(cache(imagemin([                   
        imagemin.gifsicle(),                
        imagemin.jpegtran(),                   
        imagemin.optipng()])))                
    .pipe(gulp.dest('dist/images'));  
});

gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
});

gulp.task('clean:dist', function() {
  return del.sync('dist');
});

gulp.task('build', function () {
  runSequence('clean:dist', 
    ['sass', 'images', 'fonts']
  )
});

gulp.task('purgecss', function() {
    return gulp.src('src/**/*.css')
        .pipe(purgecss({
            content: ["src/**/*.html"]
        }))
        .pipe(gulp.dest('build/css'))
});

gulp.task('js', function() {
  gulp.src('src/**/*.js')
    .pipe(plumber({
        errorHandler: notify.onError({
            title: 'JS',
            message: '<%= error.message %>'
        })
    }))
    .pipe(uglify())                           
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(`src/js`))
    .pipe(browserSync.reload({
        stream: true                           
    }));
});

gulp.task('_js', function() {
    return gulp.src('src/js/index.js')
    .pipe(uglify())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest('dist/js'))
});

gulp.task('clean', function(){
    return del.sync('dist/js');
});


gulp.task('clear', function() {
    return cache.clearAll();
});

gulp.task('default', ['sass', 'js', 'browserSync'], function(){
   gulp.watch('src/styles/**/*.scss', ['sass']); 
   gulp.watch('src/*.html', browserSync.reload); 
   gulp.watch('src/js/**/*.js', browserSync.reload);  
});

gulp.task('build', ['clean', 'img', '_sass', 'jsLibs', '_js'], function(){
    var buildLib= gulp.src('vendor/**/*.js')
    .pipe(gulp.dest('dist/js'));

    var buildFonts = gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('dist/fonts/'));
});