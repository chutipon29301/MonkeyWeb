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
/**
 * cr datePicker
 */
$("#crDatePicker").datetimepicker({
    format: "DD/MM/YYYY",
    daysOfWeekDisabled: [1, 2, 3, 4, 5]
});
let fhbIndicator = true;
$(".nav-tabs > .nav-item:nth-child(2)").click(function () {
    if (fhbIndicator) {
        genTimePicker(1);
        genTable(1);
        genTimePicker(2);
        genTutor();
    }
    fhbIndicator = false;
});
$(".nav-tabs > .nav-item:nth-child(3)").click(function () {
    if (fhbIndicator) {
        genTimePicker(1);
        genTable(1);
        genTimePicker(2);
        genTutor();
    }
    fhbIndicator = false;
});
async function genTutor() {
    let tutor = await $.post("post/v1/listTutor");
    tutor.sort(function (a, b) {
        return a.tutorID - b.tutorID
    });
    for (let i in tutor) {
        $("#crFilterPick").append(
            "<option value=" + tutor[i].tutorID + ">" + tutor[i].nicknameEn + "</option>"
        );
    }
    genTable(2);
}
/**
 * fhb datePicker change handler
 */
$("#fhbDatePicker").on("dp.change", function () {
    genTimePicker(1);
    genTable(1);
});
/**
 * cr datePicker change handler
 */
$("#crDatePicker").on("dp.change", function () {
    genTable(2);
});
/**
 * genTimePicker
 * @param {number} type HB:1, CR:2
 */
function genTimePicker(type) {
    let pointer;
    let pickDate;
    if (type === 1) {
        pointer = $("#fhbTimePick");
        pickDate = $('#fhbDatePicker').data('DateTimePicker').date();
    } else {
        pointer = $("#crTimePick");
        pickDate = $('#crDatePicker').data('DateTimePicker').date();
    }
    pointer.empty();
    if (pickDate.day() === 2 || pickDate.day() === 4) {
        pointer.append(
            "<option value=" + 17 + ">17-19</option>"
        );
    } else {
        pointer.append(
            "<option value=" + 0 + ">All</option>" +
            "<option value=" + 8 + ">8-10</option>" +
            "<option value=" + 10 + ">10-12</option>" +
            "<option value=" + 13 + ">13-15</option>" +
            "<option value=" + 15 + ">15-17</option>"
        );
    }
}
/**
 * gen adtend table
 * @param {number} mainType HB:1, CR:2
 */
async function genTable(mainType) {
    let pickDate;
    if (mainType === 1) {
        $("#fhbAbsentTable").empty();
        $("#fhbPresentTable").empty();
        pickDate = $('#fhbDatePicker').data('DateTimePicker').date();
    } else {
        $("#crAbsentTable").empty();
        pickDate = $('#crDatePicker').data('DateTimePicker').date();
    }
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
        let timestamp = moment(allAdtend[i].timestamp).format("ddd DD/MM/YY HH:mm");
        let t = moment(allAdtend[i].date).hour();
        let style = "";
        let remark;
        let nextRemark;
        let link;
        if (allAdtend[i].link !== undefined && allAdtend[i].link !== "") {
            link = "<span class='fa fa-lg fa-folder-open' onclick='showAdtendPic(\"" + allAdtend[i].link + "\")'></span>";
        } else {
            link = "<span class='fa fa-lg fa-plus-circle' onclick='showUploadModal(\"" + allAdtend[i].attendanceID + "\")'></span>";
        }
        if (emergencyAbsent(allAdtend[i].timestamp, allAdtend[i].date)) {
            style = "table-warning";
        }
        switch (allAdtend[i].remark) {
            case "1":
                remark = "<span class='fa fa-lg fa-check-circle-o' style='color:orange'></span>"
                nextRemark = "next2";
                break;
            case "2":
                remark = "<span class='fa fa-lg fa-check-circle-o' style='color:green'></span>"
                nextRemark = "next0";
                break;
            default:
                remark = "<span class='fa fa-lg fa-times-circle-o' style='color:red'></span>"
                nextRemark = "next1";
                break;
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
            if (type !== "CR" && mainType === 1) {
                $("#fhbAbsentTable").append(
                    "<tr id='" + allAdtend[i].attendanceID + "' class='fhbTableRow fhbRow" + t + " " + type + " " + style + "'>" +
                    "<td class='text-center'>" + timestamp + "</td>" +
                    "<td class='text-center' onclick='gotoStdProfile(\"" +
                    allAdtend[i].userID + "\")'>" + studentName[i].nickname + " " + studentName[i].firstname + "</td>" +
                    "<td class='text-center'>" + subj + "</td>" +
                    "<td class='text-center'>" + tutor + "</td>" +
                    "<td class='text-center'>" + allAdtend[i].reason + "</td>" +
                    "<td class='text-center'>" + link + "</td>" +
                    "<td class='text-center " + nextRemark + " rm" + allAdtend[i].attendanceID +
                    "' onclick='setRemark(\"" + allAdtend[i].attendanceID + "\")'>" + remark + "</td>" +
                    "<td class='text-center'><button class='btn btn-light col' onclick='removeAdtend(\"" +
                    allAdtend[i].attendanceID + "\")'><span class='fa fa-lg fa-trash' style='color:red'></span></button></td>" +
                    "</tr>"
                );
            } else if (type !== "FHB" && mainType === 2) {
                $("#crAbsentTable").append(
                    "<tr id='" + allAdtend[i].attendanceID + "' class='crTableRow crRow" + t + " " + adtendInfo[i].tutor[0] + " " + style + "'>" +
                    "<td class='text-center'>" + timestamp + "</td>" +
                    "<td class='text-center' onclick='gotoStdProfile(\"" +
                    allAdtend[i].userID + "\")'>" + studentName[i].nickname + " " + studentName[i].firstname + "</td>" +
                    "<td class='text-center'>" + subj + "</td>" +
                    "<td class='text-center'>" + tutor + "</td>" +
                    "<td class='text-center'>" + allAdtend[i].reason + "</td>" +
                    "<td class='text-center'>" + link + "</td>" +
                    "<td class='text-center " + nextRemark + " rm" + allAdtend[i].attendanceID +
                    "' onclick='setRemark(\"" + allAdtend[i].attendanceID + "\")'>" + remark + "</td>" +
                    "<td class='text-center'><button class='btn btn-light col' onclick='removeAdtend(\"" +
                    allAdtend[i].attendanceID + "\")'><span class='fa fa-lg fa-trash' style='color:red'></span></button></td>" +
                    "</tr>"
                );
            }
        } else if (mainType === 1) {
            $("#fhbPresentTable").append(
                "<tr id='" + allAdtend[i].attendanceID + "' class='fhbTableRow fhbRow" + t + "'>" +
                "<td class='text-center'>" + timestamp + "</td>" +
                "<td class='text-center' onclick='gotoStdProfile(\"" +
                allAdtend[i].userID + "\")'>" + studentName[i].nickname + " " + studentName[i].firstname + "</td>" +
                "<td class='text-center'>" + "FHB:" + allAdtend[i].subject + "</td>" +
                "<td class='text-center " + nextRemark + " rm" + allAdtend[i].attendanceID +
                "' onclick='setRemark(\"" + allAdtend[i].attendanceID + "\")'>" + remark + "</td>" +
                "<td class='text-center'><button class='btn btn-light col' onclick='removeAdtend(\"" +
                allAdtend[i].attendanceID + "\")'><span class='fa fa-lg fa-trash' style='color:red'></span></button></td>" +
                "</tr>"
            );
        }
    }
    filterFhbTable(1);
    filterFhbTable(2);
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
    t.hour(18).minute(0).second(0).millisecond(0);
    if (t.day() === 0) {
        if (t.valueOf() - timestamp < 2 * aDay) result = true;
    } else {
        if (t.valueOf() - timestamp < aDay) result = true;
    }
    return result;
}
/**
 * filter unwanted data
 * @param {number} mainType HB:1, CR:2
 */
function filterFhbTable(mainType) {
    let timePick;
    let type;
    if (mainType === 1) {
        timePick = $("#fhbTimePick").val();
        type = $("#fhbFilterPick").val();
    } else {
        timePick = $("#crTimePick").val();
        type = $("#crFilterPick").val();
    }
    if (mainType === 1) {
        if (timePick !== "0") {
            $(".fhbTableRow").hide();
            $(".fhbRow" + timePick).show();
        } else {
            $(".fhbTableRow").show();
        }
        switch (type) {
            case "FHB":
                $(".HB").hide();
                break;
            default:
                break;
        }
    } else {
        if (timePick !== "0") {
            let indexHour = ["8", "10", "13", "15"];
            if (type !== "0") {
                $(".crTableRow").hide();
                $("." + type).show();
            } else {
                $(".crTableRow").show();
            }
            for (let i = 0; i < 4; i++) {
                if (indexHour[i] !== timePick) {
                    $(".crRow" + indexHour[i]).hide();
                }
            }
        } else {
            if (type === "0") {
                $(".crTableRow").show();
            } else {
                $(".crTableRow").hide();
                $("." + type).show();
            }
        }
    }

}
$("#fhbTimePick").change(function () {
    filterFhbTable(1);
});
$("#fhbFilterPick").change(function () {
    filterFhbTable(1);
});
$("#crTimePick").change(function () {
    filterFhbTable(2);
});
$("#crFilterPick").change(function () {
    filterFhbTable(2);
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
/**
 * set remark
 * @param {string} adtendID 
 */
function setRemark(adtendID) {
    let nextRemark;
    let that = $(".rm" + adtendID);
    if (that.hasClass("next0")) {
        $.post("post/v1/setAttendanceRemark", { attendanceID: adtendID, remark: "0" }).then((cb) => {
            log(cb);
            that.removeClass("next0").addClass("next1");
            that.html("<span class='fa fa-lg fa-times-circle-o' style='color:red'></span>");
        });
    } else if (that.hasClass("next1")) {
        $.post("post/v1/setAttendanceRemark", { attendanceID: adtendID, remark: "1" }).then((cb) => {
            log(cb);
            that.removeClass("next1").addClass("next2");
            that.html("<span class='fa fa-lg fa-check-circle-o' style='color:orange'></span>");
        });
    } else if (that.hasClass("next2")) {
        $.post("post/v1/setAttendanceRemark", { attendanceID: adtendID, remark: "2" }).then((cb) => {
            log(cb);
            that.removeClass("next2").addClass("next0");
            that.html("<span class='fa fa-lg fa-check-circle-o' style='color:green'></span>");
        });
    }
}
$(".remarkReset").click(function () {
    if (confirm("ต้องการ reset remark ทั้งหมด?")) {
        $.post("post/v1/resetAttendanceRemark").then((cb) => {
            log(cb);
            location.reload();
        });
    }
});

// check first time click activity
let activityIndicator = true;
// Start time for gen activity table
let acTime1 = moment();
let acTime2 = moment();
$(".nav-tabs > .nav-item:nth-child(4)").click(function () {
    if (activityIndicator) {
        genActivityTable(0);
    }
    activityIndicator = false;
});
/**
 * gen activity table
 * @param {number} number 
 */
async function genActivityTable(number) {
    acTime1.date(acTime1.date() - 4);
    if (number !== 0) {
        acTime2.date(acTime2.date() - 4);
    }
    let allAdtend = await $.post("post/v1/listAttendance", {
        startDate: acTime1.valueOf(),
        endDate: acTime2.valueOf()
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
    if (allAdtend.length === 0) {
        $("#loadMoreButt").hide();
    }
    for (let i = 0; i < allAdtend.length; i++) {
        let style;
        let timestamp = moment(allAdtend[i].timestamp).format("ddd DD/MM/YY - HH:mm");
        let subj;
        let t = moment(allAdtend[i].date).format("ddd DD/MM/YY - HH:mm");
        let reason;
        let link;
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
        if (allAdtend[i].link !== undefined && allAdtend[i].link !== "") {
            link = "<span class='fa fa-lg fa-folder-open' onclick='showAdtendPic(\"" + allAdtend[i].link + "\")'></span>";
        } else {
            link = "<span class='fa fa-lg fa-plus-circle' onclick='showUploadModal(\"" + allAdtend[i].attendanceID + "\")'></span>";
        }
        $("#acTableBody").append(
            "<tr class='" + style + "' id='" + allAdtend[i].attendanceID + "'>" +
            "<td class='text-center'>" + timestamp + "</td>" +
            "<td class='text-center' onclick='gotoStdProfile(\"" +
            allAdtend[i].userID + "\")'>" + studentName[i].nickname + " " + studentName[i].firstname + "</td>" +
            "<td class='text-center'>" + subj + "</td>" +
            "<td class='text-center'>" + t + "</td>" +
            "<td class='text-center'>" + reason + "</td>" +
            "<td class='text-center'>" + link + "</td>" +
            "<td class='text-center'>" + allAdtend[i].sender + "</td>" +
            "<td class='text-center'><button class='btn btn-light col' onclick='removeAdtend(\"" +
            allAdtend[i].attendanceID + "\")'><span class='fa fa-lg fa-trash' style='color:red'></span></button></td>" +
            "</tr>"
        );
    }
}
$("#loadMoreButt").click(function () {
    genActivityTable(1);
});

/**
 * show adtend pic
 * @param {string} picLink 
 */
function showAdtendPic(picLink) {
    $("#picSrc").attr("src", picLink);
    $("#picModal").modal("show");
}
let uploadID;
function showUploadModal(adtendID) {
    uploadID = adtendID;
    $("#picUploadModal").modal('show');
}
$("#uploadPicButt").click(function () {
    if (confirm("ต้องการเพิ่มหลักฐานการลา?")) {
        uploadAdtendPic();
    }
});
function uploadAdtendPic() {
    let ufile = $('#file-img');
    let ext = ufile.val().split('.').pop().toLowerCase();
    if ($.inArray(ext, ['png', 'jpg', 'jpeg']) === -1) {
        alert('กรุณาอัพไฟล์ .jpg, .jpeg หรือ .png เท่านั้น');
    } else {
        let files = ufile.get(0).files;
        let formData = new FormData();
        let file = files[0];
        formData.append('files', file, file.name);
        formData.append("attendanceID[]", uploadID);
        $.ajax({
            url: "post/v1/uploadAttendanceDocument",
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                location.reload();
            }
        });
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

/**
 * get index from date str
 * @param {string} dayStr 
 */
const dayIndex = (dayStr) => {
    switch (dayStr) {
        case "tue17":
            return 0;
        case "thu17":
            return 1;
        case "sat8":
            return 2;
        case "sat10":
            return 3;
        case "sat13":
            return 4;
        case "sat15":
            return 5;
        case "sun8":
            return 6;
        case "sun10":
            return 7;
        case "sun13":
            return 8;
        case "sun15":
            return 9;
        default:
            break;
    }
};
// generate fhb room chart
generateChart();
async function generateChart() {
    let allRoom = await $.post("post/v1/allRoom");
    let allHbRoom = {};
    let maxSeat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let fhbStatic = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let crStatic = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let fhbReal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let crReal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let i in allRoom) {
        allHbRoom[i] = allRoom[i].room0;
    }
    for (let i in allHbRoom) {
        maxSeat[dayIndex(i)] = allHbRoom[i].maxStudent;
        fhbStatic[dayIndex(i)] = allHbRoom[i].hybrid[0].num;
        fhbReal[dayIndex(i)] = allHbRoom[i].hybrid[0].num;
        if (allHbRoom[i].course !== undefined) {
            let cr = allHbRoom[i].course;
            for (let j in cr) {
                crStatic[dayIndex(i)] += cr[j].num;
                crReal[dayIndex(i)] += cr[j].num;
            }
        }
    }
    let now = moment();
    now.hour(0).minute(0).second(0).millisecond(0);
    let sunDay = moment(now);
    sunDay.date(sunDay.date() - sunDay.day());
    let tueDay = moment(sunDay);
    tueDay.date(sunDay.date() + 2);
    let thuDay = moment(sunDay);
    thuDay.date(sunDay.date() + 4);
    let satDay = moment(sunDay);
    satDay.date(sunDay.date() + 6);
    let promise = [
        $.post("post/v1/listAttendance", { date: sunDay.valueOf() }),
        $.post("post/v1/listAttendance", { date: tueDay.valueOf() }),
        $.post("post/v1/listAttendance", { date: thuDay.valueOf() }),
        $.post("post/v1/listAttendance", { date: satDay.valueOf() })
    ];
    let attendC = await Promise.all(promise);
    for (let i in attendC) {
        for (let j in attendC[i]) {
            let time = moment(attendC[i][j].date);
            let dayStr = time.format('dddHH').toLowerCase();
            if (attendC[i][j].courseID === 0) {
                if (attendC[i][j].type === 1) {
                    fhbReal[dayIndex(dayStr)] -= 1;
                } else {
                    fhbReal[dayIndex(dayStr)] += 1;
                }
            } else {
                let crInfo = await courseInfo(attendC[i][j].courseID);
                if (crInfo.tutor[0] === 99000) {
                    if (attendC[i][j].type === 1) {
                        crReal[dayIndex(dayStr)] -= 1;
                    } else {
                        crReal[dayIndex(dayStr)] += 1;
                    }
                }
            }
        }
    }
    var ctx = document.getElementById("fhbChart").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['tue', 'thu', 'sat8', 'sat10', 'sat13', 'sat15', 'sun8', 'sun10', 'sun13', 'sun15'],
            datasets: [{
                type: 'bar',
                label: 'FHB(Static)',
                stack: 'Stack 0',
                data: fhbStatic,
                backgroundColor: '#bbdefb',
                borderColor: '#5d99c6',
                borderWidth: 1
            }, {
                type: 'bar',
                label: 'CR(Static)',
                stack: 'Stack 0',
                data: crStatic,
                backgroundColor: '#f8bbd0',
                borderColor: '#c48b9f',
                borderWidth: 1
            }, {
                type: 'bar',
                label: 'FHB(Current)',
                stack: 'Stack 1',
                data: fhbReal,
                backgroundColor: '#2196f3',
                borderColor: '#0069c0',
                borderWidth: 1
            }, {
                type: 'bar',
                label: 'CR(Current)',
                stack: 'Stack 1',
                data: crReal,
                backgroundColor: '#f06292',
                borderColor: '#ba2d65',
                borderWidth: 1
            }, {
                type: 'line',
                label: 'max',
                data: maxSeat,
                backgroundColor: 'rgba(0,0,0,0)',
                borderColor: 'red',
                pointBorderColor: 'rgba(0,0,0,0)',
            }]
        },
        options: {
            title: {
                display: true,
                fontSize: 24,
                text: "HB Student Chart"
            },
            tooltips: {
                mode: 'point',
                intersect: false
            },
            legend: {
                position: 'bottom'
            },
            responsive: true,
            scales: {
                xAxes: [{
                    stacked: true,
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}