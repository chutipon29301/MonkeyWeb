$(document).ready(function () {
    // get studentID
    let cookie = getCookieDict()
    let ID = cookie.monkeyWebUser;
    // var for cr & fhb data
    let course = [];
    let hybrid = [];
    // get default quarter
    $.post("post/getConfig", function (config) {
        let year = config.defaultQuarter.quarter.year;
        let quarter = config.defaultQuarter.quarter.quarter;
        $("#pageHead").html("CR60Q" + quarter + " & FHB");
        // get student cr
        $.post("post/studentProfile", { studentID: ID }, function (std) {
            $.post("post/gradeCourse", { grade: std.grade, year: year, quarter: quarter }, function (cr) {
                for (let i = 0; i < std.courseID.length; i++) {
                    for (let j = 0; j < cr.course.length; j++) {
                        if (std.courseID[i] === cr.course[j].courseID) {
                            course.push(cr.course[j]);
                        }
                    }
                }
                // get student fhb
                $.post("post/v1/listStudentHybrid", { studentID: ID, year: year, quarter: quarter }, function (fhb) {
                    for (let i = 0; i < fhb.length; i++) {
                        hybrid.push(fhb[i]);
                    }
                    fillButt(course, hybrid);
                })
            })
        })
    })
    // set date picker
    $("#datePicker").datetimepicker({
        format: "DD/MM/YYYY",
        daysOfWeekDisabled: [1, 3, 5]
    });
    // add event when pick date
    $("#datePicker").on("dp.change", function () {
        fillButt(course, hybrid);
    })
    // toggle pick button
    $(".btn-default").click(function () {
        if ($(this).html() != "&nbsp;") {
            $(this).toggleClass("btn-default btn-success")
        }
    })
});
// func for add data to butt when pick date
function fillButt(course, fhb) {
    $(".selector").html("&nbsp;").addClass("disabled btn-default").removeClass("btn-success");
    let pickDate = $('#datePicker').data('DateTimePicker').date();
    if (pickDate.day() == 2 || pickDate.day() == 4) {
        for (let i = 0; i < fhb.length; i++) {
            let fhbDate = moment(fhb[i].day);
            if (fhbDate.day() == pickDate.day()) {
                $("#btn8").html("FHB: " + fhb[i].subject).removeClass("disabled");
            }
        }
    } else {
        for (let i = 0; i < course.length; i++) {
            let crDate = moment(course[i].day);
            if (crDate.day() == pickDate.day()) {
                $.post("post/name", { userID: course[i].tutor[0] }, function (name) {
                    $("#btn" + crDate.hour()).html(course[i].courseName + " - " + name.nicknameEn).removeClass("disabled");
                })
            }
        }
        for (let i = 0; i < fhb.length; i++) {
            let fhbDate = moment(fhb[i].day);
            if (fhbDate.day() == pickDate.day()) {
                $("#btn" + fhbDate.hour()).html("FHB: " + fhb[i].subject).removeClass("disabled");
            }
        }
    }
}