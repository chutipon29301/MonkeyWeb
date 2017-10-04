// param
var useM = 0;
var useP = 0;
var maxM = 0;
var maxP = 0;
var firstname = "";
var nickname = "";
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
        nickname = profile.nickname;
        firstname = profile.firstname;
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
            $(".btn-success").toggleClass("btn-default btn-success");
            $(this).toggleClass("btn-default btn-success");
        }
    });
    // add event when submit
    $("#submit").click(function () {
        if ($(".btn-success").length == 0) {
            alert("กรุณาเลือกเวลาที่ต้องการเพิ่ม");
        } else if (!($("#senderInput").val())) {
            alert("กรุณาใส่ชื่อผู้แจ้ง");
        } else {
            sendData(ID);
        }
    });
});
// func for fill data in button
function fillButt(cr, fhb) {
    // log(cr);
    // log(fhb);
    $(".selector").addClass("btn-default").removeClass("disabled btn-success course");
    let pickDate = $('#datePicker').data('DateTimePicker').date();
    if (pickDate.day() == 2 || pickDate.day() == 4) {
        $("#btn8").html("17-19");
        $("#btn10").html("&nbsp;");
        $("#btn13").html("&nbsp;");
        $("#btn15").html("&nbsp;");
        for (let i in fhb) {
            if (moment(fhb[i].day).day() == pickDate.day()) {
                $("#btn8").html("FHB:" + fhb[i].subject.slice(0, 1)).addClass("disabled");
            }
        }
    } else {
        $("#btn8").html("8-10");
        $("#btn10").html("10-12");
        $("#btn13").html("13-15");
        $("#btn15").html("15-17");
        for (let i in fhb) {
            if (moment(fhb[i].day).day() == pickDate.day()) {
                $("#btn" + moment(fhb[i].day).hour()).html("FHB:" + fhb[i].subject.slice(0, 1)).addClass("disabled course");
            }
        }
        for (let i in cr) {
            if (moment(cr[i].day).day() == pickDate.day()) {
                $("#btn" + moment(cr[i].day).hour()).html(cr[i].courseName).addClass("disabled course");
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
// func for send data
function sendData(ID) {
    let pickDate = $('#datePicker').data('DateTimePicker').date();
    sendAbsentModifier(ID, pickDate);
}
// func for send absent to server
function sendAbsentModifier(ID, pickDate) {
    let absent = [];
    let str = "\n" + nickname + " " + firstname + "\n" + "ต้องการเพิ่ม:";
    if (pickDate.day() == 2 || pickDate.day() == 4) {
        for (let i = 0; i < $(".btn-success").length; i++) {
            absent.push(pickDate.hour(17).minute(0).second(0).millisecond(0).valueOf());
            str += ("\n" + $("#subjInput").val().slice(0, 5));
            str += (" - " + pickDate.format("ddd DD/MM/YYYY รอบ HH:mm"));
        }
    } else {
        for (let i = 0; i < $(".btn-success").length; i++) {
            let hour = $($(".btn-success")[i]).attr("id").slice(3);
            absent.push(pickDate.hour($($(".btn-success")[i]).attr("id").slice(3)).minute(0).second(0).millisecond(0).valueOf());
            str += ("\n" + $("#subjInput").val().slice(0, 5));
            str += (" - " + pickDate.format("ddd DD/MM/YYYY รอบ HH:mm"));
        }
    }
    // log(absent)
    $.post("post/addStudentAbsenceModifier", { studentID: ID, day: absent, reason: "add" + $("#subjInput").val().slice(0, 5), sender: $("#senderInput").val() }, (data) => {
        if (confirm("ยืนยันการเพิ่ม")) {
            $.post("post/lineNotify", { recipient: "MonkeyAdmin", message: str }, () => {
                location.reload();
            })
        }
    })
}