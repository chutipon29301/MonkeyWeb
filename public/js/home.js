const gal = $('.galleria');
function slideShow(mode,autoPlay) {
    let finish = function (n) {
        for (let i = 1; i < n; i++)gal.append("<img src='images/news/" + i + ".png'>");
        Galleria.loadTheme('galleria/themes/' + mode + '/galleria.' + mode + '.min.js');
        Galleria.run(gal, {
            extend: function () {
                this.setOptions('transition', 'fade');
                if (autoPlay) {
                    this.play(5000);
                }
            }
        });
    };
    let recur = function (i) {
        //noinspection ES6ModulesDependencies
        $.get("images/news/" + i + ".png").success(function (result) {
            console.log("success" + i);
            recur(i + 1);
        }).error(function () {
            console.log("end at " + i);
            finish(i);
        });
    };
    recur(1);
}
