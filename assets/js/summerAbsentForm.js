$(document).ready(function () {
    var cookie = getCookieDict();
    $.post("post/studentProfile", { studentID: cookie.monkeyWebUser }).then((data) => {
        log(data.courseID)
        $.post("post/gradeCourse", { grade: data.grade, quarter: "summer" }).then((cr) => {
            log(cr.course)
            for (let i = 0; i < data.courseID.length; i++) {
                for (let j = 0; j < cr.course.length; j++) {
                    // log(moment(cr.course[j].day).hour())
                    // log(data.courseID[i] === cr.course[j].courseID)
                    if (data.courseID[i] === cr.course[j].courseID) {
                        // log($(".btn-default").length)
                        let temp = moment(cr.course[j].day).hour();
                        let btn = $(".btn-default");
                        for (let k = 0; k < btn.length; k++) {
                            // log(temp)
                            if (("" + temp).length > 1) {
                                if (btn[k].id.slice(4, 6) == temp) {
                                    $(btn[k]).removeClass("disabled")
                                }
                            } else {
                                if (btn[k].id.slice(4, 6) == "0" + temp) {
                                    $(btn[k]).removeClass("disabled")
                                }
                            }
                        }
                    }
                }
            }
        })
    })
    $(".btn").click(function () {
        if (this.className.indexOf("disabled") < 0) {
            if (this.id.slice(0, 1) === "a") {
                if (this.className.indexOf("btn-default") >= 0) {
                    this.className = this.className.replace("btn-default", "btn-danger");
                } else this.className = this.className.replace("btn-danger", "btn-default");
            } else {
                if (this.className.indexOf("btn-default") >= 0) {
                    this.className = this.className.replace("btn-default", "btn-info");
                } else this.className = this.className.replace("btn-info", "btn-default");
            }
        }
    });
    $("#submit").click(function () {
        var cookie = getCookieDict();
        var ID = cookie.monkeyWebUser;
        let day = [];
        if ($(".btn-danger").length > 0) {
            if ($("#sender").val().length > 0) {
                log($(".btn-danger").length)
                for (let i = 0; i < $(".btn-danger").length; i++) {
                    let temp = moment().hour($(".btn-danger")[i].id.slice(4, 6)).minute(0).date($(".btn-danger")[i].id.slice(1, 3)).month(9);
                    day.push(temp.valueOf());
                }
                $.post("post/addStudentAbsenceModifier", { studentID: ID, reason: "-", sender: $("#sender").val(), day: day }).then((data) => {
                    self.location = 'summerReceipt';
                })
            } else alert("กรุณาใส่ชื่อผู้ส่ง");
        } else self.location = 'summerReceipt';
    })
});