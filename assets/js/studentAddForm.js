$(document).ready(function () {
    // get studentID
    let cookie = getCookieDict();
    let ID = cookie.monkeyWebUser;
    // var for year and Q
    let year = 2017;
    let quarter = 4;
    // Param
    let course = [];
    let fhb = [];
    // set date picker
    $("#datePicker").datetimepicker({
        format: "DD/MM/YYYY",
        daysOfWeekDisabled: [1, 3, 5],
        minDate: moment()
    });
    // get config
    $.post("post/getConfig").done((config) => {
        year = config.defaultQuarter.quarter.year;
        quarter = config.defaultQuarter.quarter.quarter;
        $.post("post/studentProfile", { studentID: ID }).done((profile) => {
            $.post("post/gradeCourse", { grade: profile.grade, year: year, quarter: quarter }).done((cr) => {
                // log(cr)
                for (let i = 0; i < profile.courseID.length; i++) {
                    for (let j = 0; j < cr.course.length; j++) {
                        if (profile.courseID[i] === cr.course[j].courseID) {
                            course.push(cr.course[j]);
                        }
                    }
                }
                $.post("post/v1/listStudentHybrid", { studentID: ID, year: year, quarter: quarter }).done((hybrid) => {
                    for (let i = 0; i < hybrid.length; i++) {
                        fhb.push(hybrid[i]);
                    }
                    // log(fhb);
                    fillTable(ID, fhb);
                    fillButt(course);
                })
            })
        })
    })
    // add event when pick date
    $("#datePicker").on("dp.change", function () {
        fillButt(course);
    })
    // toggle pick button
    $(".btn-default").click(function () {
        if (!($(this).hasClass("disabled"))) {
            $(".btn-success").toggleClass("btn-default btn-success");
            $(this).toggleClass("btn-default btn-success");
        }
    })
    // add event when submit
    $("#submit").click(function () {
        if ($(".btn-success").length == 0) {
            alert("กรุณาเลือกเวลา");
        } else if (!($("#senderInput").val())) {
            alert("กรุณาใส่ชื่อผู้ส่ง");
        } else {
            // alert("add" + $("#subjInput").val().slice(0, 5));
            let pickDate = $('#datePicker').data('DateTimePicker').date();
            let day = [];
            if (pickDate.day() === 2 || pickDate.day() === 4) {
                day.push(pickDate.hour(17).minute(0).second(0).millisecond(0).valueOf());
            } else {
                for (let i = 0; i < $(".btn-success").length; i++) {
                    day.push(parseInt(pickDate.hour($($(".btn-success")[i]).attr("id").slice(3)).minute(0).second(0).millisecond(0).valueOf()));
                }
            }
            // log(day);
            if (confirm("ต้องการเพิ่ม " + $("#subjInput").val() + " เวลา " + moment(day[0]).format("HH:mm") + " วันที่ " + moment(day[0]).format("DD/MM/YYYY")) == true) {
                $.post("post/addStudentAbsenceModifier", { studentID: ID, day: day, reason: "add" + $("#subjInput").val().slice(0, 5), sender: $("#senderInput").val() }).done((data) => {
                    location.reload();
                })
            }
        }
    })
});
// func for fill data in button
function fillButt(course) {
    $(".selector").html("&nbsp;").removeClass("disabled course btn-success").addClass("btn-default");
    let pickDate = $('#datePicker').data('DateTimePicker').date();
    if (pickDate.day() === 2 || pickDate.day() === 4) {
        $("#btn8").html("17-19");
        $("#btn10").addClass("disabled");
        $("#btn13").addClass("disabled");
        $("#btn15").addClass("disabled");
    } else {
        for (let i = 0; i < course.length; i++) {
            let crDate = moment(course[i].day);
            if (crDate.day() == pickDate.day()) {
                $.post("post/name", { userID: course[i].tutor[0] }, function (name) {
                    $("#btn" + crDate.hour()).html(course[i].courseName + " - " + name.nicknameEn).addClass("disabled course");
                })
            } else {
                $("#btn" + crDate.hour()).html(crDate.hour() + " - " + (crDate.hour() + 2));
            }
        }
    }
}
// func for fill data in table
function fillTable(ID, fhb) {
    let today = moment();
    $.post("post/listStudentAttendanceModifierByStudent", { studentID: ID, start: today.valueOf() }).done((data) => {
        // log(data.modifier)
        for (let i = 0; i < data.modifier.length; i++) {
            if (data.modifier[i].reason == "addFHB:M") {
                $("#presentTableBody").append("<tr><td class='text-center'>" + moment(data.modifier[i].day).format("ddd DD MMM HH:mm") + " MATH</td></tr>");
            } else if (data.modifier[i].reason == "addFHB:P") {
                $("#presentTableBody").append("<tr><td class='text-center'>" + moment(data.modifier[i].day).format("ddd DD MMM HH:mm") + " PHYSIC</td></tr>");
            } else if (data.modifier[i].reason != "ลา" && data.modifier[i].reason != "เพิ่ม" && data.modifier[i].subject == "") {
                for (let j = 0; j < fhb.length; j++) {
                    if (moment(fhb[j].day).hour() == moment(data.modifier[i].day).hour() && moment(fhb[j].day).day() == moment(data.modifier[i].day).day()) {
                        let str = (fhb[j].subject == "M") ? "MATH" : "PHYSIC";
                        $("#absentTableBody").append("<tr><td class='text-center'>" + moment(data.modifier[i].day).format("ddd DD MMM HH:mm") + " " + str + "</td></tr>");
                    }
                }
            }
        }
    })
}