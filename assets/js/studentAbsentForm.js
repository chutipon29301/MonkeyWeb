// var for summary data
var remainMathAbsent = 0;
var remainPhyAbsent = 0;
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
                    fillSummary(ID, hybrid);
                })
            })
        })
    })
    // set date picker
    $("#datePicker").datetimepicker({
        format: "DD/MM/YYYY",
        daysOfWeekDisabled: [1, 3, 5],
        minDate: moment()
    });
    // add event when pick date
    $("#datePicker").on("dp.change", function () {
        fillButt(course, hybrid);
        fillSummary(ID, hybrid);
    })
    // toggle pick button
    $(".btn-default").click(function () {
        if ($(this).html() != "&nbsp;") {
            $(this).toggleClass("btn-default btn-success")
        }
    })
    // add event when submit
    $("#submit").click(function () {
        if ($(".btn-success").length > 0) {
            if ($("#reasonInput").val()) {
                if ($("#senderInput").val()) {
                    let state = true;
                    for (let i = 0; i < $(".btn-success").length; i++) {
                        if (state) {
                            if ($($(".btn-success")[i]).html().slice(5) == "PH" && remainPhyAbsent <= 0) {
                                state = false;
                                alert("ลา FHB:P ครบจำนวนแล้ว");
                            } else if ($($(".btn-success")[i]).html().slice(5) == "M" && remainMathAbsent <= 0) {
                                state = false;
                                alert("ลา FHB:M ครบจำนวนแล้ว");
                            }
                        }
                    }
                    if (state) {
                        log("Send data =>");
                        sendData(ID);
                    }
                } else alert("กรุณาใส่ชื่อผู้แจ้ง")
            } else alert("กรุณาใส่เหตุผลในการลา");
        } else alert("กรุณาเลือกวิชาที่ต้องการลา");
    })
});
// func for send data to server
function sendData(ID) {
    let pickDate = $('#datePicker').data('DateTimePicker').date();
    let state = true;
    let time = [];
    if (emer(pickDate)) {
        state = confirm("ต้องการลาฉุกเฉิน");
    }
    if (state) {
        let day = moment().date(pickDate.date()).month(pickDate.month()).year(pickDate.year()).minute(0).second(0).millisecond(0);
        if (pickDate.day() == 2 || pickDate.day() == 4) {
            time.push(parseInt(day.hour(17).valueOf()));
        } else {
            for (let i = 0; i < $(".btn-success").length; i++) {
                time.push(parseInt(day.hour($($(".btn-success")[i]).attr("id").slice(3)).valueOf()));
            }
        }
    }
    log(time)
    $.post("post/addStudentAbsenceModifier", { studentID: ID, day: time, reason: $("#reasonInput").val(), sender: $("#senderInput").val() }, function (data) {
        location.reload();
    })
}
function emer(day) {
    let now = moment().minute(0).second(0).millisecond(0);
    let picked = moment().year(day.year()).month(day.month()).date(day.date()).hour(18).minute(0).second(0).millisecond(0);
    let aDay = 24 * 60 * 60 * 1000;
    if (day.day() == 0) {
        if (picked.valueOf() - now.valueOf() > aDay * 2) {
            return false;
        } else return true;
    } else {
        if (picked.valueOf() - now.valueOf() > aDay) {
            return false;
        } else return true;
    }
}
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
// func for fill summary data
function fillSummary(ID, fhb) {
    let allPhyAbsent = 0;
    let allMathAbsent = 0;
    remainPhyAbsent = 0;
    remainMathAbsent = 0;
    $("#summaryPhy").empty().html("FHB:Physic&nbsp;");
    $("#summaryMath").empty().html("FHB:Math&nbsp;");
    for (let i = 0; i < fhb.length; i++) {
        if (fhb[i].subject === "PH") {
            remainPhyAbsent += 3;
        } else {
            remainMathAbsent += 3;
        }
    }
    allPhyAbsent = remainPhyAbsent;
    allMathAbsent = remainMathAbsent;
    let pickDate = $('#datePicker').data('DateTimePicker').date();
    let pastDate = moment().day(pickDate.day()).month(pickDate.month() - 3).year(pickDate.year()).hour(0).minute(0).second(0).millisecond(0);
    $.post("post/listStudentAttendanceModifierByStudent", { studentID: ID, start: pastDate.valueOf() }, function (data) {
        // log(data)
        for (let i = 0; i < data.modifier.length; i++) {
            if (data.modifier[i].type === "absence") {
                if (data.modifier[i].day <= pickDate.valueOf()) {
                    if (data.modifier[i].reason != "ลา" && data.modifier[i].reason != "เพิ่ม") {
                        // log(data.modifier[i])
                        for (let j = 0; j < fhb.length; j++) {
                            if (moment(fhb[j].day).day() == moment(data.modifier[i].day).day() && moment(fhb[j].day).hour() == moment(data.modifier[i].day).hour()) {
                                (fhb[j].subject === "PH") ? remainPhyAbsent -= 1 : remainMathAbsent -= 1;
                            }
                        }
                    }
                }
            }
        }
        for (let i = 0; i < allMathAbsent; i++) {
            $("#summaryMath").append("<span class='glyphicon glyphicon-record' style='color:" + ((i >= remainMathAbsent) ? "red" : "green") + "'></span>");
        }
        for (let i = 0; i < allPhyAbsent; i++) {
            $("#summaryPhy").append("<span class='glyphicon glyphicon-record' style='color:" + ((i >= remainPhyAbsent) ? "red" : "green") + "'></span>");
        }
    })
}