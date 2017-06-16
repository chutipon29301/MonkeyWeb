const gal = $('.galleria');
let autoPlay = false;
let ind = '';

function slideShow(mode) {
    const testAutoplay = $.get('images/news/1.png', function (data, status) {
        // autoPlay = true;
        // ind = 'a';
    }).success(()=>{
        return true;
        // autoPlay = true;
    }).error(()=>{
        // autoPlay = false;
        return false;
    });

    log(testAutoplay.statusText === "Not Found");

    testAutoplay.then((isAutoPlay)=>{
        let promise = [];
        for (let i = 1;;i++){
            let loop = true;
            log('in loop');
            promise.append($.get('images/news/' + ind + i + '.PNG', function (data, status) {
                loop = false;
                gal.append('<img src="images/news/' + ind + i + '.PNG">');
                log('in auto' + i);
            }));
            if (loop) break;
        }
        Promise.all(promise).then(()=>{
            Galleria.loadTheme('galleria/themes/' + mode + '/galleria.' + mode + '.min.js');
            Galleria.run($('.galleria'), {
                extend: function () {
                    this.setOptions('transition', 'fade');
                    if (autoPlay) {
                        this.play(5000);
                    }
                }
            });
        });
    });
    // for (let i = 1; ; i++) {
    //     let loop = true;
    //     log('in loop');
    //     $.get('images/news/' + ind + i + '.PNG', function (data, status) {
    //         loop = false;
    //         gal.append('<img src="images/news/' + ind + i + '.PNG">');
    //         log('in auto' + i);
    //     });
    //     if (loop) break;
    // }
    // Galleria.loadTheme('galleria/themes/' + mode + '/galleria.' + mode + '.min.js');
    // Galleria.run($('.galleria'), {
    //     extend: function () {
    //         this.setOptions('transition', 'fade');
    //         if (autoPlay) {
    //             this.play(5000);
    //         }
    //     }
    // });
}
