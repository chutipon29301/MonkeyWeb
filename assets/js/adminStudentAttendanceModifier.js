let year;
let quarter;
getYearAndQuarter();
function getYearAndQuarter() {
    getConfig().then((config) => {
        year = config.defaultQuarter.quarter.year;
        quarter = config.defaultQuarter.quarter.quarter;
    });
}
/**
 * fhb datePicker
 */
$("#fhbDatePicker").datetimepicker({
    format: "DD/MM/YYYY",
    daysOfWeekDisabled: [1, 3, 5]
});
genTimePicker();
genFhbTable();
/**
 * fhb datePicker change handler
 */
$("#fhbDatePicker").on("dp.change", function () {
    genTimePicker();
    genFhbTable();
});
/**
 * gen fhb timePicker
 */
function genTimePicker() {
    $("#fhbTimePick").empty();
    let pickDate = $('#fhbDatePicker').data('DateTimePicker').date();
    if (pickDate.day() === 2 || pickDate.day() === 4) {
        $("#fhbTimePick").append(
            "<option value=" + 17 + ">17-19</option>"
        );
    } else {
        $("#fhbTimePick").append(
            "<option value=" + 8 + ">8-10</option>" +
            "<option value=" + 10 + ">10-12</option>" +
            "<option value=" + 13 + ">13-15</option>" +
            "<option value=" + 15 + ">15-17</option>"
        );
    }
}
/**
 * gen fhb table
 */
async function genFhbTable() {
    $("#fhbAbsentTable").empty();
    $("#fhbPresentTable").empty();
    let pickDate = $('#fhbDatePicker').data('DateTimePicker').date();
    pickDate.hour(0);
    let allAdtend = await $.post("post/v1/listAttendance", {
        date: pickDate.valueOf()
    });
    let promise = [];
    let promise2 = [];
    for (let i in allAdtend) {
        promise2.push(name(allAdtend[i].userID));
        if (allAdtend[i].courseID === 0) {
            promise.push($.post("post/v1/studentHybridSubject", {
                studentID: allAdtend[i].userID,
                hybridID: allAdtend[i].hybridID
            }));
        } else {
            promise.push(courseInfo(allAdtend[i].courseID));
        }
    }
    let adtendInfo = await Promise.all(promise);
    let studentName = await Promise.all(promise2);
    for (let i = 0; i < allAdtend.length; i++) {
        let timestamp = moment(allAdtend[i].timestamp).format("ddd DD/MM/YY");
        let t = moment(allAdtend[i].date).hour();
        let style = "";
        if (emergencyAbsent()) {
            style = "table-warning";
        }
        if (allAdtend[i].type === 1) {
            let subj;
            let tutor;
            let type;
            if (allAdtend[i].courseID === 0) {
                subj = "FHB:" + adtendInfo[i].subject
                tutor = "HB";
                type = "FHB";
            } else {
                subj = "CR:" + adtendInfo[i].courseName;
                if (adtendInfo[i].tutor[0] === 99000) {
                    tutor = "HB";
                    type = "HB";
                } else {
                    let tutorName = await name(adtendInfo[i].tutor[0]);
                    tutor = tutorName.nicknameEn;
                    type = "CR";
                }
            }
            $("#fhbAbsentTable").append(
                "<tr id='" + allAdtend[i].attendanceID + "' class='fhbTableRow row" + t + " " + type + " " + style + "'>" +
                "<td class='text-center'>" + timestamp + "</td>" +
                "<td class='text-center' onclick='gotoStdProfile(\"" +
                allAdtend[i].userID + "\")'>" + studentName[i].nickname + " " + studentName[i].firstname + "</td>" +
                "<td class='text-center'>" + subj + "</td>" +
                "<td class='text-center'>" + tutor + "</td>" +
                "<td class='text-center'>" + allAdtend[i].reason + "</td>" +
                "<td class='text-center'><button class='btn btn-light col' onclick='removeAdtend(\"" +
                allAdtend[i].attendanceID + "\")'><span class='fa fa-lg fa-trash' style='color:red'></span></button></td>" +
                "</tr>"
            );
        } else {
            $("#fhbPresentTable").append(
                "<tr id='" + allAdtend[i].attendanceID + "' class='fhbTableRow row" + t + "'>" +
                "<td class='text-center'>" + timestamp + "</td>" +
                "<td class='text-center' onclick='gotoStdProfile(\"" +
                allAdtend[i].userID + "\")'>" + studentName[i].nickname + " " + studentName[i].firstname + "</td>" +
                "<td class='text-center'>" + "FHB:" + allAdtend[i].subject + "</td>" +
                "<td class='text-center'><button class='btn btn-light col' onclick='removeAdtend(\"" +
                allAdtend[i].attendanceID + "\")'><span class='fa fa-lg fa-trash' style='color:red'></span></button></td>" +
                "</tr>"
            );
        }
    }
    filterFhbTable();
}
/**
 * check emergency absent
 * @param {number} timestamp 
 * @param {number} date 
 */
function emergencyAbsent(timestamp, date) {
    let result = false;
    let aDay = 24 * 60 * 60 * 1000;
    let t = moment(date);
    if (t.day() === 0) {
        if (date - timestamp < 2 * aDay) result = true;
    } else {
        if (date - timestamp < aDay) result = true;
    }
    return result;
}
/**
 * filter unwanted fhb table row
 */
function filterFhbTable() {
    let timePick = $("#fhbTimePick").val();
    let type = $("#fhbFilterPick").val();
    $(".fhbTableRow").hide();
    $(".row" + timePick).show();
    switch (type) {
        case "FHB":
            $(".HB").hide();
            $(".CR").hide();
            break;
        case "HB":
            $(".CR").hide();
            break;
        case "CR":
            $(".FHB").hide();
            $(".HB").hide();
            break;
        default:
            break;
    }
}
$("#fhbTimePick").change(function () {
    filterFhbTable();
});
$("#fhbFilterPick").change(function () {
    filterFhbTable();
});

/**
 * remove student adtendance
 * @param {string} adtendID
 */
function removeAdtend(adtendID) {
    if (confirm("ต้องการลบประวัตินี้?")) {
        $.post("post/v1/deleteAttendance", { attendanceID: adtendID }).then((cb) => {
            log(cb);
            $("#" + adtendID).remove();
        });
    }
}

/**
 * go to adminStudentProfile
 * @param {string} studentID 
 */
function gotoStdProfile(studentID) {
    writeCookie("monkeyWebAdminAllstudentSelectedUser", studentID);
    self.location = "/adminStudentprofile";
}

genActivityTable();
/**
 * gen activity table
 */
async function genActivityTable() {
    let now = moment().valueOf();
    let allAdtend = await $.post("post/v1/listAttendance", {
        startDate: 0,
        endDate: now
    });
    let promise = [];
    let promise2 = [];
    for (let i in allAdtend) {
        promise2.push(name(allAdtend[i].userID));
        if (allAdtend[i].courseID === 0) {
            promise.push($.post("post/v1/studentHybridSubject", {
                studentID: allAdtend[i].userID,
                hybridID: allAdtend[i].hybridID
            }));
        } else {
            promise.push(courseInfo(allAdtend[i].courseID));
        }
    }
    let adtendInfo = await Promise.all(promise);
    let studentName = await Promise.all(promise2);
    for (let i = 0; i < allAdtend.length; i++) {
        let style;
        let timestamp = moment(allAdtend[i].timestamp).format("ddd DD/MM/YY - HH:mm");
        let subj;
        let t = moment(allAdtend[i].date).format("ddd DD/MM/YY - HH:mm");
        let reason;
        if (allAdtend[i].type === 1) {
            style = "table-danger";
            if (allAdtend[i].courseID === 0) {
                subj = "FHB:" + adtendInfo[i].subject
            } else {
                subj = "CR:" + adtendInfo[i].courseName;
            }
            reason = allAdtend[i].reason;
        } else {
            style = "table-success";
            subj = "FHB:" + allAdtend[i].subject;
            reason = "-";
        }
        $("#acTableBody").append(
            "<tr class='" + style + "' id='" + allAdtend[i].attendanceID + "'>" +
            "<td class='text-center'>" + timestamp + "</td>" +
            "<td class='text-center' onclick='gotoStdProfile(\"" +
            allAdtend[i].userID + "\")'>" + studentName[i].nickname + " " + studentName[i].firstname + "</td>" +
            "<td class='text-center'>" + subj + "</td>" +
            "<td class='text-center'>" + t + "</td>" +
            "<td class='text-center'>" + reason + "</td>" +
            "<td class='text-center'>" + allAdtend[i].sender + "</td>" +
            "<td class='text-center'><button class='btn btn-light col' onclick='removeAdtend(\"" +
            allAdtend[i].attendanceID + "\")'><span class='fa fa-lg fa-trash' style='color:red'></span></button></td>" +
            "</tr>"
        );
    }
}

// admin add attend function
$("#addType").change(function () {
    loadAdtendPage();
});
loadAdtendPage();
function loadAdtendPage() {
    let type = $("#addType").val();
    if (type === "1") {
        $(".absentContent").show();
        $(".addContent").hide();
    } else {
        $(".absentContent").hide();
        $(".addContent").show();
    }
}
$("#addDatePicker").datetimepicker({
    format: "DD/MM/YYYY",
    daysOfWeekDisabled: [1, 3, 5]
});
genAddAdtendTimePicker();
$("#addDatePicker").on("dp.change", function () {
    genAddAdtendTimePicker();
});
function genAddAdtendTimePicker() {
    $("#addTime").empty();
    let pickDate = $('#addDatePicker').data('DateTimePicker').date();
    if (pickDate.day() === 2 || pickDate.day() === 4) {
        $("#addTime").append(
            "<option value=" + 17 + ">17-19</option>"
        );
    } else {
        $("#addTime").append(
            "<option value=" + 8 + ">8-10</option>" +
            "<option value=" + 10 + ">10-12</option>" +
            "<option value=" + 13 + ">13-15</option>" +
            "<option value=" + 15 + ">15-17</option>"
        );
    }
}
$("#addNewAttend").click(function () {
    let type = $("#addType").val();
    if ($("#addStdID").val() === "") {
        alert("Input studentID");
    } else if ($("#addStdID").val().length !== 5) {
        alert("Incorrect studentID");
    } else {
        if (type === "1") {
            if ($("#addReason").val() === "") {
                alert("Input reason");
            } else {
                if (confirm("ยืนยันการลา?")) {
                    sendAddAdtendData();
                }
            }
        } else {
            if (confirm("ยืนยันการเพิ่ม?")) {
                sendAddAdtendData();
            }
        }
    }
});
const roundTime = (time, round) => {
    let result = moment(0);
    result.year(time.year()).month(time.month()).date(time.date()).hour(parseInt(round));
    return result.valueOf();
};
async function sendAddAdtendData() {
    let pickDate = $('#addDatePicker').data('DateTimePicker').date();
    let type = $("#addType").val();
    let hour = parseInt($("#addTime").val());
    let studentID = $("#addStdID").val();
    let subj = $("#addSubj").val();
    if (type === "1") {
        let promise = [];
        let timetable = await $.post("post/v1/studentTimeTable", { year: year, quarter: quarter, studentID: studentID });
        let cr = timetable.course;
        for (let i in cr) {
            let t = moment(cr[i].day);
            if (t.day() === pickDate.day() && t.hour() === hour) {
                promise.push($.post("post/v1/addStudentAbsent", {
                    userID: studentID,
                    date: roundTime(pickDate, hour),
                    courseID: cr[i].courseID,
                    reason: $("#addReason").val(),
                    sender: "Admin"
                }));
            }
        }
        let hb = timetable.hybrid;
        for (let i in hb) {
            let t = moment(hb[i].day);
            if (t.day() === pickDate.day() && t.hour() === hour) {
                promise.push($.post("post/v1/addStudentAbsent", {
                    userID: studentID,
                    date: roundTime(pickDate, hour),
                    hybridID: hb[i].hybridID,
                    reason: $("#addReason").val(),
                    sender: "Admin"
                }));
            }
        }
        location.reload();
    } else {
        let allHB = await $.post("post/v1/listHybridDayInQuarter", { year: year, quarter: quarter });
        let hybridID;
        for (let i in allHB) {
            let t = moment(allHB[i].day);
            if (t.day() === pickDate.day() && t.hour() === hour) {
                hybridID = allHB[i].hybridID;
            }
        }
        await $.post("post/v1/addStudentPresent", {
            userID: studentID,
            date: roundTime(pickDate, hour),
            hybridID: hybridID,
            subject: subj,
            sender: "Admin"
        });
        location.reload();
    }
} 