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
        var cookie = getCookieDict();
        var ID = cookie.monkeyWebUser;
        let day = [];
        if ($(".btn-danger").length > 0) {
            if ($("#sender").val().length > 0) {
                for (let i = 0; i < $(".btn-danger").length; i++) {
                    let temp = moment().hour($(".btn-danger")[i].id.slice(4, 6)).minute(0).date($(".btn-danger")[i].id.slice(1, 3)).month(9);
                    day.push(temp.valueOf());
                }
                $.post("post/addStudentAbsenceModifier", { studentID: ID, reason: "-", sender: $("#sender").val(), day: day }).then((data) => {
                    self.location = 'summerReceipt';
                })
            }else alert("กรุณาใส่ชื่อผู้ส่ง");
        } else self.location = 'summerReceipt';
    })
});