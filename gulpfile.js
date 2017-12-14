

var gulp = require("gulp");
var browserSync = require("browser-sync").create();
var gulpImgResize = require("gulp-image-resize");
var cp = require("cross-spawn");
var merge2 = require('merge2');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');


// image config
var imgConfig = [
    {width:1500, crop: true, upscale: false, imageMagick: true},
    {width:1024, crop: true, upscale: false, imageMagick: true},
    {width:800, crop: true, upscale: false, imageMagick: true}
]

//css
gulp.task('build:css', function(){
    return gulp.src('./assets/scss/main.scss')
    .pipe( sourcemaps.init() )
    .pipe(sass({ outputStyle: 'expanded' }))
    .pipe( gulp.dest('./_site/assets/css/'))
    .pipe(rename( {suffix: '.min'} ))
    .pipe( postcss([autoprefixer(), cssnano()]) )
    .pipe( sourcemaps.write() )
    .pipe( gulp.dest('./_site/assets/css'))
    .pipe(browserSync.stream());
});

//browser-sync
gulp.task('browser-sync', function(){
    browserSync.init({
        server: {
            baseDir: "./_site/"
        }
    });
});

// build jekyll
gulp.task('build:jekyll', function(done){
    return cp.spawn('bundle', ['exec', 'jekyll', 'build'], {stdio: [0, 1, 2]})
        .on('close', done);
});

// build jekyll
gulp.task('rebuild:jekyll',['build:jekyll'], function(){
    browserSync.reload();
});

// image resize
gulp.task('images:work', function(){
    
    var streams = [];
    
    for( i=0 ; i < imgConfig.length ; i++){
        streams.push(
            gulp.src('./assets/img/works/**/*')
            .pipe(gulpImgResize({ 
                width:imgConfig[i].width, crop:imgConfig[i].crop, upscale:imgConfig[i].upscale, imageMagick:imgConfig[i].imageMagick
            }))
            .pipe(gulp.dest('./_site/assets/img/works/_' + imgConfig[i].width + '/'))
        );
    }
});

gulp.task('build', ['build:jekyll', 'build:css', 'images:work']);

//watch
gulp.task('watch', ['browser-sync'], function(){
    gulp.watch([
        '_data/**/*',
        '_includes/**/*',
        '_layouts/**/*',
        '_pages/**/*',
        '_posts/**/*',
        '_work/**/*',
        '_config.yml'
    ], ['rebuild:jekyll']);
    gulp.watch(['assets/scss/**/*'], ['build:css']);
});