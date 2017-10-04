// param
var useM = 0;
var useP = 0;
var maxM = 0;
var maxP = 0;
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
    $.post("post/getConfig", (config) => {
        year = config.defaultQuarter.quarter.year;
        quarter = config.defaultQuarter.quarter.quarter;
        $("#pageHead").html("CR60Q" + config.defaultQuarter.quarter.quarter + " & FHB");
    }).then($.post("post/studentProfile", { studentID: ID }, (profile) => {
        let promise = [];
        for (let i in profile.courseID) {
            promise.push($.post("post/courseInfo", { courseID: profile.courseID[i] }));
        }
        // get course & fhb info
        Promise.all([Promise.all(promise).then((crInfo) => {
            for (let i in crInfo) {
                if (crInfo[i].quarter === quarter) {
                    course.push(crInfo[i]);
                }
            }
        }), $.post("post/v1/listStudentHybrid", { studentID: ID, year: year, quarter: quarter }, (hybrid) => {
            for (let i in hybrid) {
                fhb.push(hybrid[i]);
                if (hybrid[i].subject == "M") {
                    maxM += 3;
                } else {
                    maxP += 3;
                }
            }
        })]).then(() => {
            fillTable(ID, fhb, course);
            fillButt(course, fhb);
        })
    }));
    // add event when pick date
    $("#datePicker").on("dp.change", function () {
        fillTable(ID, fhb, course);
        fillButt(course, fhb);
    });
    // add toggle when click button
    $(".selector").click(function () {
        if (!($(this).hasClass("disabled"))) {
            $(this).toggleClass("btn-default btn-success");
        }
    });
    // add event when submit
    $("#submit").click(function () {
        let bool = haveFHB();
        if ($(".btn-success").length == 0) {
            alert("กรุณาเลือกวิชาที่ต้องการลา");
        } else if (!($("#reasonInput").val())) {
            alert("กรุณาใส่เหตุผล");
        } else if (!($("#senderInput").val())) {
            alert("กรุณาใส่ชื่อผู้แจ้ง");
        } else if ((maxM - useM) <= 0 && bool[0]) {
            alert("ลา FHB:M ครบแล้ว");
        } else if ((maxP - useP) <= 0 && bool[1]) {
            alert("ลา FHB:P ครบแล้ว");
        } else {
            sendData(ID);
        }
    });
});
// func for fill data in button
function fillButt(cr, fhb) {
    // log(cr);
    // log(fhb);
    $(".selector").addClass("disabled btn-default").removeClass("btn-success").html("&nbsp;");
    let pickDate = $('#datePicker').data('DateTimePicker').date();
    if (pickDate.day() == 2 || pickDate.day() == 4) {
        for (let i in fhb) {
            if (moment(fhb[i].day).day() == pickDate.day()) {
                $("#btn8").html("FHB:" + fhb[i].subject.slice(0, 1)).removeClass("disabled");
            }
        }
    } else {
        for (let i in fhb) {
            if (moment(fhb[i].day).day() == pickDate.day()) {
                $("#btn" + moment(fhb[i].day).hour()).html("FHB:" + fhb[i].subject.slice(0, 1)).removeClass("disabled");
            }
        }
        for (let i in cr) {
            if (moment(cr[i].day).day() == pickDate.day()) {
                $("#btn" + moment(cr[i].day).hour()).html(cr[i].courseName).removeClass("disabled");
            }
        }
    }
}
// func for fill table
function fillTable(ID, fhb, cr) {
    useP = 0;
    useM = 0;
    $("#absentTableBody").empty();
    $("#presentTableBody").empty();
    let pickDate = $('#datePicker').data('DateTimePicker').date();
    let startDate = moment(0).year(pickDate.year()).month(pickDate.month() - 3).date(pickDate.date());
    $.post("post/listStudentAttendanceModifierByStudent", { studentID: ID, start: startDate.valueOf() }, (data) => {
        for (let i in data.modifier) {
            if (data.modifier[i].reason == "addFHB:M") {
                useM -= 1;
                $("#presentTableBody").append("<tr><td class='text-center'>" + moment(data.modifier[i].day).format("ddd DD MMM HH:mm") + " - <strong>FHB:M</strong></td></tr>");
            } else if (data.modifier[i].reason == "addFHB:P") {
                useP -= 1;
                $("#presentTableBody").append("<tr><td class='text-center'>" + moment(data.modifier[i].day).format("ddd DD MMM HH:mm") + "- <strong>FHB:P</strong></td></tr>");
            } else if (data.modifier[i].reason != "ลา" && data.modifier[i].reason != "เพิ่ม") {
                for (let j = 0; j < fhb.length; j++) {
                    if (moment(fhb[j].day).hour() == moment(data.modifier[i].day).hour() && moment(fhb[j].day).day() == moment(data.modifier[i].day).day()) {
                        let str = "";
                        if (fhb[j].subject == "M") {
                            useM += 1;
                            str = "FHB:M";
                        } else {
                            useP += 1;
                            str = "FHB:P";
                        }
                        $("#absentTableBody").append("<tr><td class='text-center'>" + moment(data.modifier[i].day).format("ddd DD MMM HH:mm") + " - <strong>" + str + "</strong></td></tr>");
                    }
                }
                for (let j = 0; j < cr.length; j++) {
                    if (moment(cr[j].day).hour() == moment(data.modifier[i].day).hour() && moment(cr[j].day).day() == moment(data.modifier[i].day).day()) {
                        $("#absentTableBody").append("<tr><td class='text-center'>" + moment(data.modifier[i].day).format("ddd DD MMM HH:mm") + " - <strong>" + cr[j].courseName + "</strong></td></tr>");
                    }
                }
            }
        }
        $("#mathSum").html("โควต้าลา FHB:M เหลือ " + (maxM - useM) + "/" + maxM);
        $("#phySum").html("โควต้าลา FHB:P เหลือ " + (maxP - useP) + "/" + maxP);
    });
}
// func for check have fhb
function haveFHB() {
    let bool = [false, false];
    for (let i = 0; i < $(".btn-success").length; i++) {
        if ($($(".btn-success")[i]).html() == "FHB:M") bool[0] = true;
        if ($($(".btn-success")[i]).html() == "FHB:P") bool[1] = true;
    }
    return bool;
}
// func for send data
function sendData(ID) {
    let pickDate = $('#datePicker').data('DateTimePicker').date();
    let emer = emergencyCheck(pickDate);
    if (emer) {
        if (confirm("ต้องการลาฉุกเฉิน")) {
            sendAbsentModifier(ID, pickDate);
        }
    } else {
        sendAbsentModifier(ID, pickDate);
    }
}
// func for check emergency absent
function emergencyCheck(pickDate) {
    let now = moment();
    let time = moment(0).year(pickDate.year()).month(pickDate.month()).date(pickDate.date()).hour(18);
    let aDayValue = 24 * 60 * 60 * 1000;
    if (pickDate.day() == 0) {
        if (time.valueOf() - now.valueOf() < (2 * aDayValue)) return true;
        else return false;
    } else if (time.valueOf() - now.valueOf() < aDayValue) {
        return true;
    } else return false;
}
// func for send absent to server
function sendAbsentModifier(ID, pickDate) {
    let absent = [];
    if (pickDate.day() == 2 || pickDate.day() == 4) {
        for (let i = 0; i < $(".btn-success").length; i++) {
            absent.push(pickDate.hour(17).minute(0).second(0).millisecond(0).valueOf());
        }
    } else {
        for (let i = 0; i < $(".btn-success").length; i++) {
            let hour = $($(".btn-success")[i]).attr("id").slice(3);
            absent.push(pickDate.hour($($(".btn-success")[i]).attr("id").slice(3)).minute(0).second(0).millisecond(0).valueOf());
        }
    }
    // log(absent)
    $.post("post/addStudentAbsenceModifier", { studentID: ID, day: absent, reason: $("#reasonInput").val(), sender: $("#senderInput").val() }, (data) => {
        if (confirm("ยืนยันการลา")) {
            location.reload();
        }
    })
}