$(document).ready(function () {
    $(".btn").click(function () {
        if (this.id.slice(0, 1) === "a") {
            if (this.className.indexOf("btn-default") >= 0) {
                this.className = this.className.replace("btn-default", "btn-danger");
            } else this.className = this.className.replace("btn-danger", "btn-default");
        } else {
            if (this.className.indexOf("btn-default") >= 0) {
                this.className = this.className.replace("btn-default", "btn-info");
            } else this.className = this.className.replace("btn-info", "btn-default");
        }
    });
    $("#submit").click(function () {
        if ($(".btn-danger").length > 0) postAbsent(0);
        else self.location = 'summerReceipt';
    })
});
function postAbsent(index) {
    if (index < $(".btn-danger").length) {
        var cookie = getCookieDict();
        var ID = cookie.monkeyWebUser;
        var time = moment().hour($(".btn-danger")[i].id.slice(4, 6)).date($(".btn-danger")[index].id.slice(1, 3)).month(9)
        $.post("post/addStudentAbsenceModifier", { studentID: ID, reason: "-", sender: $("#sender").val(), day: time.valueOf() }).then((data) => {
            postAbsent(index + 1)
        })
    } else {
        self.location = 'summerReceipt'
    }
}