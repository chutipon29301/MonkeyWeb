var stdCourse = [];
var stdHybrid = [];
var stdSkill = [];
$(document).ready(function () {
    // get studentID
    let cookie = getCookieDict();
    let ID = cookie.monkeyWebUser;
    // set date picker
    $("#datePicker").datetimepicker({
        format: "DD/MM/YYYY",
        daysOfWeekDisabled: [1, 3, 5],
        minDate: moment()
    });
    // add event when pick date
    $("#datePicker").on("dp.change", function () {
        $(".selector").html("-").addClass("blank btn-default").removeClass("cr hb sk btn-success");
        let pickDate = $('#datePicker').data('DateTimePicker').date();
        if (pickDate.day() === 2 || pickDate.day() === 4) {
            $(".btn8").html("17-19");
            fillHybrid(1);
        } else {
            $(".btn8").html("8-10");
            $(".btn10").html("10-12");
            $(".btn13").html("13-15");
            $(".btn15").html("15-17");
            fillCourse();
            fillHybrid(0);
            fillSkill();
        }
    });
    // add event when change state
    $("#typeInput").change(function () {
        $(".selector").removeClass("btn-success").addClass("btn-default");
        chkState();
    })
    // add toggle button effect
    $(".selector").click(function () {
        if (!($(this).hasClass("disabled"))) {
            $(".selector").removeClass("btn-success").addClass("btn-default");
            $(this).toggleClass("btn-default btn-success");
        }
    })
    // add event when submit
    $("#submit").click(function () {
        if ($(".btn-success").length > 0) {
            if ($("#senderInput").val()) {
                sendRequest(ID);
            } else alert("กรุณาใส่ผู้แจ้ง")
        } else alert("กรุณาเลือกรอบที่ต้องการลา");
    })
    // clear button to default
    $(".selector").html("-").addClass("blank").removeClass("cr hb sk");
    let pickDate = $('#datePicker').data('DateTimePicker').date();
    if (pickDate.day() === 2 || pickDate.day() === 4) {
        $(".btn8").html("17-19");
    } else {
        $(".btn8").html("8-10");
        $(".btn10").html("10-12");
        $(".btn13").html("13-15");
        $(".btn15").html("15-17");
    }
    // get course data
    studentProfile(ID).then(profileData => {
        let promise = [];
        for (let i in profileData.courseID) {
            promise.push(courseInfo(profileData.courseID[i]));
        }
        Promise.all(promise).then(data => {
            stdCourse = data.filter(function (data) {
                if (data.quarter === presentQuarter && data.year === year) return true;
                else return false;
            })
            fillCourse();
        });
    })
    // get hybrid data
    listStudentHybrid(year, presentQuarter, ID).then(hybridData => {
        stdHybrid = hybridData;
        let pickDate = $('#datePicker').data('DateTimePicker').date();
        if (pickDate.day() === 2 || pickDate.day() === 4) {
            fillHybrid(1);
        } else {
            fillHybrid(0);
        }
    })
    // get skill data
    listStudentSkill(year, presentQuarter, ID).then(skillData => {
        stdSkill = skillData;
        fillSkill();
    })
});
// fill cr data to button
function fillCourse() {
    let pickDate = $('#datePicker').data('DateTimePicker').date();
    for (let i = 0; i < stdCourse.length; i++) {
        let cr = stdCourse[i];
        if (moment(cr.day).day() === pickDate.day()) {
            $(".btn" + moment(cr.day).hour()).html("CR:" + cr.courseName).removeClass("blank").addClass("cr");
        }
    }
    chkState();
}
// fill hb data to button
function fillHybrid(type) {
    let pickDate = $('#datePicker').data('DateTimePicker').date();
    for (let i = 0; i < stdHybrid.length; i++) {
        let hb = stdHybrid[i];
        if (type === 0) {
            if (moment(hb.day).day() === pickDate.day()) {
                $(".btn" + moment(hb.day).hour()).html("FHB:" + hb.subject).removeClass("blank").addClass("hb").attr("id", hb.hybridID);
            }
        } else {
            if (moment(hb.day).day() === pickDate.day()) {
                $(".btn8").html("FHB:" + hb.subject).removeClass("blank").addClass("hb").attr("id", hb.hybridID);
            }
        }
    }
    chkState();
}
// fill sk data to button
function fillSkill() {
    let pickDate = $('#datePicker').data('DateTimePicker').date();
    for (let i = 0; i < stdSkill.length; i++) {
        let sk = stdSkill[i];
        if (moment(sk.day).day() === pickDate.day()) {
            if (moment(sk.day).hour() <= 9) {
                $(".btn8").html("SKILL").removeClass("blank").addClass("sk");
            } else if (moment(sk.day).hour() <= 12) {
                $(".btn10").html("SKILL").removeClass("blank").addClass("sk");
            } else if (moment(sk.day).hour() <= 14) {
                $(".btn13").html("SKILL").removeClass("blank").addClass("sk");
            } else {
                $(".btn15").html("SKILL").removeClass("blank").addClass("sk");
            }
        }
    }
    chkState();
}
// check button state
function chkState() {
    let pickDate = $('#datePicker').data('DateTimePicker').date();
    if (pickDate.day() === 2 || pickDate.day() === 4) {
        if ($("#typeInput").val() == 0) {
            $(".blank,.sk,.cr").addClass("disabled");
            $(".hb").removeClass("disabled");
        } else {
            $(".hb,.sk,.cr,.blank").addClass("disabled");
            $(".btn8").removeClass("disabled");
        }
    } else {
        if ($("#typeInput").val() == 0) {
            $(".blank,.sk,.cr").addClass("disabled");
            $(".hb").removeClass("disabled");
        } else {
            $(".blank").removeClass("disabled");
            $(".hb,.sk,.cr").addClass("disabled");
        }
    }
}
// send data to server
function sendRequest(ID) {
    $("#loaderModal").modal();
    let pickDate = $('#datePicker').data('DateTimePicker').date();
    if ($("#typeInput").val() === "0") {
        let hbID = $(".btn-success").attr("id");
        let date = $('#datePicker').data('DateTimePicker').date().hour(7);
        $.post("post/v1/removeHybridStudentOnTime", { hybridID: hbID, studentID: ID, date: date.valueOf() }).then(data => {
            log(data)
            log("finish to remove")
            location.reload();
        })
    } else {
        let str = $(".btn-success").html();
        pickDate.hour(str.slice(0, str.indexOf("-")));
        let subj = $("#subjInput").val();
        let date = pickDate;
        date = date.minute(date.minute() + 2)
        $.post('post/v1/listHybridDayInQuarter', { year: year, quarter: presentQuarter }).then(hb => {
            for (let i in hb) {
                if (moment(hb[i].day).day() === pickDate.day() && moment(hb[i].day).hour() === pickDate.hour()) {
                    let hbID = hb[i].hybridID;
                    $.post('post/v1/addHybridStudentOnTime', { hybridID: hbID, studentID: ID, subject: subj, date: date.valueOf() }).then(data => {
                        log(data)
                        log("finish to add")
                    })
                }
            }
        })
    }
}