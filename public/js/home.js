function slideShow(type, mode, autoPlay) {
    let finish = function (n) {
        const gal = $('.galleria');
        for (let i = 1; i < n; i++)gal.append("<img src='images/news/" + type + i + ".png'>");
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
        //noinspection ES6ModulesDependencies,JSUnusedLocalSymbols
        $.get("images/news/" + type + i + ".png").done(function (result) {
            console.log("success" + i);
            recur(i + 1);
        }).fail(function () {
            console.log("end at " + i);
            finish(i);
        });
    };
    recur(1);
}