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
let crIndicator = true;
genTimePicker(1);
genTimePicker(2);
$(".nav-tabs > .nav-item:nth-child(2)").click(function () {
    if (fhbIndicator) {
        genTable(1);
    }
    fhbIndicator = false;
});
$(".nav-tabs > .nav-item:nth-child(3)").click(function () {
    if (crIndicator) {
        genTutor();
        genTable(2);
    }
    crIndicator = false;
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
    genTimePicker(2);
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
            link = "<span class='fa fa-lg fa-plus-circle' onclick='showUploadModal(\"" + allAdtend[i]._id + "\")'></span>";
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
            let type;
            if (allAdtend[i].courseID === undefined) {
                subj = "FHB:" + allAdtend[i].hybridSubject;
                type = "FHB";
            } else {
                if (allAdtend[i].tutorName === "Hybrid") {
                    subj = "CR:" + allAdtend[i].courseName;
                    type = "HB";
                } else {
                    subj = "CR:" + allAdtend[i].courseName;
                    type = "CR";
                }
            }
            if (type !== "CR" && mainType === 1) {
                $("#fhbAbsentTable").append(
                    "<tr id='" + allAdtend[i]._id + "' class='fhbTableRow fhbRow" + t + " " + type + " " + style + "'>" +
                    "<td class='text-center'>" + timestamp + "</td>" +
                    "<td class='text-center' onclick='gotoStdProfile(\"" +
                    allAdtend[i].studentID + "\")'>" + allAdtend[i].nickname + " " + allAdtend[i].firstname + "</td>" +
                    "<td class='text-center'>" + subj + "</td>" +
                    "<td class='text-center'>HB</td>" +
                    "<td class='text-center'>" + allAdtend[i].reason + "</td>" +
                    "<td class='text-center'>" + link + "</td>" +
                    "<td class='text-center " + nextRemark + " rm" + allAdtend[i]._id +
                    "' onclick='setRemark(\"" + allAdtend[i]._id + "\")'>" + remark + "</td>" +
                    "<td class='text-center'><button class='btn btn-light col' onclick='removeAdtend(\"" +
                    allAdtend[i]._id + "\")'><span class='fa fa-lg fa-trash' style='color:red'></span></button></td>" +
                    "</tr>"
                );
            } else if (type !== "FHB" && mainType === 2) {
                $("#crAbsentTable").append(
                    "<tr id='" + allAdtend[i]._id + "' class='crTableRow crRow" + t + " " + allAdtend[i].tutorID + " " + style + "'>" +
                    "<td class='text-center'>" + timestamp + "</td>" +
                    "<td class='text-center' onclick='gotoStdProfile(\"" +
                    allAdtend[i].studentID + "\")'>" + allAdtend[i].nickname + " " + allAdtend[i].firstname + "</td>" +
                    "<td class='text-center'>" + subj + "</td>" +
                    "<td class='text-center'>" + (allAdtend[i].tutorName !== "Hybrid" ? allAdtend[i].tutorName : "HB") + "</td>" +
                    "<td class='text-center'>" + allAdtend[i].reason + "</td>" +
                    "<td class='text-center'>" + link + "</td>" +
                    "<td class='text-center " + nextRemark + " rm" + allAdtend[i]._id +
                    "' onclick='setRemark(\"" + allAdtend[i]._id + "\")'>" + remark + "</td>" +
                    "<td class='text-center'><button class='btn btn-light col' onclick='removeAdtend(\"" +
                    allAdtend[i]._id + "\")'><span class='fa fa-lg fa-trash' style='color:red'></span></button></td>" +
                    "</tr>"
                );
            }
        } else if (mainType === 1) {
            $("#fhbPresentTable").append(
                "<tr id='" + allAdtend[i]._id + "' class='fhbTableRow fhbRow" + t + "'>" +
                "<td class='text-center'>" + timestamp + "</td>" +
                "<td class='text-center' onclick='gotoStdProfile(\"" +
                allAdtend[i].studentID + "\")'>" + allAdtend[i].nickname + " " + allAdtend[i].firstname + "</td>" +
                "<td class='text-center'>" + "FHB:" + allAdtend[i].subject + "</td>" +
                "<td class='text-center " + nextRemark + " rm" + allAdtend[i]._id +
                "' onclick='setRemark(\"" + allAdtend[i]._id + "\")'>" + remark + "</td>" +
                "<td class='text-center'><button class='btn btn-light col' onclick='removeAdtend(\"" +
                allAdtend[i]._id + "\")'><span class='fa fa-lg fa-trash' style='color:red'></span></button></td>" +
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
        if (t.valueOf() - moment(timestamp).valueOf() < 2 * aDay) result = true;
    } else {
        if (t.valueOf() - moment(timestamp).valueOf() < aDay) result = true;
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
            if (allAdtend[i].courseID === undefined) {
                subj = "FHB:" + allAdtend[i].hybridSubject
            } else {
                subj = "CR:" + allAdtend[i].courseName;
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
            "<tr class='" + style + "' id='" + allAdtend[i]._id + "'>" +
            "<td class='text-center'>" + timestamp + "</td>" +
            "<td class='text-center' onclick='gotoStdProfile(\"" +
            allAdtend[i].studentID + "\")'>" + allAdtend[i].nickname + " " + allAdtend[i].firstname + "</td>" +
            "<td class='text-center'>" + subj + "</td>" +
            "<td class='text-center'>" + t + "</td>" +
            "<td class='text-center'>" + reason + "</td>" +
            "<td class='text-center'>" + link + "</td>" +
            "<td class='text-center'>" + allAdtend[i].sender + "</td>" +
            "<td class='text-center'><button class='btn btn-light col' onclick='removeAdtend(\"" +
            allAdtend[i]._id + "\")'><span class='fa fa-lg fa-trash' style='color:red'></span></button></td>" +
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
var uploadID;
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

// generate fhb room chart
let firstTimeGen = true;
var myChart;
generateChart();
async function generateChart(type) {
    let allRoom = await $.post("post/v1/allRoom");
    let allHbRoom = {};
    for (let i in allRoom) {
        allHbRoom[i] = allRoom[i].room0;
    }
    // static data
    let maxSeat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let mhbStatic = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let phbStatic = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let mcrStatic = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let pcrStatic = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let ccrStatic = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let ecrStatic = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let emptySeat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // realtime data
    let mhbReal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let phbReal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let mcrReal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let pcrReal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let ccrReal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let ecrReal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    /**
     * change day str to num index
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
    for (let i in allHbRoom) {
        maxSeat[dayIndex(i)] = allHbRoom[i].maxStudent;
        mhbStatic[dayIndex(i)] = allHbRoom[i].hybrid[0].numMath;
        phbStatic[dayIndex(i)] = allHbRoom[i].hybrid[0].numPhysics;
        mhbReal[dayIndex(i)] = allHbRoom[i].hybrid[0].numMath;
        phbReal[dayIndex(i)] = allHbRoom[i].hybrid[0].numPhysics;
        if (allHbRoom[i].course !== undefined) {
            let cr = allHbRoom[i].course;
            for (let j in cr) {
                switch (cr[j].courseName.slice(0, 1)) {
                    case "M":
                        mcrStatic[dayIndex(i)] += cr[j].num;
                        mcrReal[dayIndex(i)] += cr[j].num;
                        break;
                    case "P":
                        pcrStatic[dayIndex(i)] += cr[j].num;
                        pcrReal[dayIndex(i)] += cr[j].num;
                        break;
                    case "C":
                        ccrStatic[dayIndex(i)] += cr[j].num;
                        ccrReal[dayIndex(i)] += cr[j].num;
                        break;
                    case "E":
                        ecrStatic[dayIndex(i)] += cr[j].num;
                        ecrReal[dayIndex(i)] += cr[j].num;
                        break;
                    default:
                        break;
                }
            }
        }
    }
    for (let i in emptySeat) {
        emptySeat[i] = maxSeat[i] - mhbStatic[i] - phbStatic[i] - mcrStatic[i] - pcrStatic[i] - ccrStatic[i] - ecrStatic[i];
    }
    /**
     * change zero to ''
     * @param {number[]} dataIn 
     */
    const cvZero = (dataIn) => {
        for (let i in dataIn) {
            if (dataIn[i] <= 0) {
                dataIn[i] = '';
            }
        }
    };
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
    let allAttend = await Promise.all(promise);
    for (let i in allAttend) {
        let attend = allAttend[i];
        for (let j in attend) {
            if (attend[j].type === 1) {
                let t = moment(attend[j].date).format("dddH").toLowerCase();
                if (attend[j].courseID === undefined) {
                    if (attend[j].hybridSubject === "M") {
                        mhbReal[dayIndex(t)] -= 1;
                    } else if (attend[j].hybridSubject === "P") {
                        phbReal[dayIndex(t)] -= 1;
                    }
                } else {
                    if (attend[j].tutorID === 99000) {
                        for (let i in allHbRoom[t].course) {
                            if (allHbRoom[t].course[i].courseID === attend[j].courseID) {
                                switch (attend[j].courseName.slice(0, 1)) {
                                    case "M":
                                        mcrReal[dayIndex(t)] -= 1;
                                        break;
                                    case "P":
                                        pcrReal[dayIndex(t)] -= 1;
                                        break;
                                    case "C":
                                        ccrReal[dayIndex(t)] -= 1;
                                        break;
                                    case "E":
                                        ecrReal[dayIndex(t)] -= 1;
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }
                    }
                }
            } else if (attend[j].type === 2) {
                let t = moment(attend[j].date).format("dddH").toLowerCase();
                if (attend[j].subject === "M") {
                    mhbReal[dayIndex(t)] += 1;
                } else if (attend[j].subject === "P") {
                    phbReal[dayIndex(t)] += 1;
                }
            }
        }
    }
    cvZero(mhbStatic);
    cvZero(phbStatic);
    cvZero(mcrStatic);
    cvZero(pcrStatic);
    cvZero(ccrStatic);
    cvZero(ecrStatic);
    cvZero(emptySeat);
    cvZero(mhbReal);
    cvZero(phbReal);
    cvZero(mcrReal);
    cvZero(pcrReal);
    cvZero(ccrReal);
    cvZero(ecrReal);
    let dataset = [];
    /**
     * add Dataset for chart
     * @param {string} label 
     * @param {number[]} data 
     * @param {number} stack 
     * @param {string} colorStr
     * @param {string} txtColor
     * @param {string} borderColor optional
     */
    const addDataSet = (label, data, stack, colorStr, txtColor, borderColor) => {
        if (borderColor !== undefined) {
            dataset.push({
                type: 'bar',
                label: label,
                stack: 'Stack ' + stack,
                data: data,
                backgroundColor: colorStr,
                borderColor: borderColor,
                borderWidth: 3,
                datalabels: {
                    color: txtColor,
                    font: {
                        style: 'bold',
                        size: 14
                    }
                }
            });
        } else {
            dataset.push({
                type: 'bar',
                label: label,
                stack: 'Stack ' + stack,
                data: data,
                backgroundColor: colorStr,
                borderColor: colorStr,
                borderWidth: 1,
                datalabels: {
                    color: txtColor,
                    font: {
                        style: 'bold',
                        size: 14
                    }
                }
            });
        }
    };
    /**
     * update all element in exist array
     * @param  oldArray 
     * @param  newArray 
     */
    const updateArray = (oldArray, newArray) => {
        oldArray.splice(0, oldArray.length);
        for (let i in newArray) {
            oldArray.push(newArray[i]);
        }
    };
    dataset.push({
        type: 'line',
        label: 'max',
        data: maxSeat,
        backgroundColor: 'rgba(0,0,0,0)',
        borderColor: 'black',
        borderDash: [15, 10],
        borderWidth: 3,
        pointBorderColor: 'rgba(0,0,0,0)',
        datalabels: {
            display: false
        }
    });
    if (firstTimeGen) {
        addDataSet("MHB(Static)", mhbStatic, 0, "rgb(255,153,0)", "white");
        addDataSet("PHB(Static)", phbStatic, 0, "rgb(212,0,255)", "white");
        addDataSet("Math(Static)", mcrStatic, 0, "rgba(0,0,0,0)", "rgb(255,153,0)", "rgb(255,153,0)");
        addDataSet("Phy(Static)", pcrStatic, 0, "rgba(0,0,0,0)", "rgb(212,0,255)", "rgb(212,0,255)");
        addDataSet("Che(Static)", ccrStatic, 0, "rgba(0,0,0,0)", "#ff8af3", "#ff8af3");
        addDataSet("Eng(Static)", ecrStatic, 0, "rgba(0,0,0,0)", "#bdbdbd", "#bdbdbd");
        dataset.push({
            type: 'bar',
            label: "Remaining",
            stack: 'Stack 0',
            data: emptySeat,
            backgroundColor: "rgba(0,0,0,0)",
            borderColor: "rgba(0,0,0,0)",
            borderWidth: 2,
            datalabels: {
                font: {
                    style: 'bold',
                    size: 16
                },
                color: "blue",
                anchor: "start",
                align: "end",
                offset: 1,
                formatter: function (value, context) {
                    if (value === '') {
                        return '';
                    } else {
                        return '( ' + value + ' )';
                    }
                }
            }
        });
        addDataSet("MHB(Real)", mhbReal, 1, "#e64500", "white");
        addDataSet("PHB(Real)", phbReal, 1, "#8a00e0", "white");
        addDataSet("Math(Real)", mcrReal, 1, "rgba(0,0,0,0)", "#e64500", "#e64500");
        addDataSet("Phy(Real)", pcrReal, 1, "rgba(0,0,0,0)", "#8a00e0", "#8a00e0");
        addDataSet("Che(Real)", ccrReal, 1, "rgba(0,0,0,0)", "#ff3dec", "#ff3dec");
        addDataSet("Eng(Real)", ecrReal, 1, "rgba(0,0,0,0)", "#9e9e9e", "#9e9e9e");
        var ctx = document.getElementById("fhbChart").getContext('2d');
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['tue', 'thu', 'sat8', 'sat10', 'sat13', 'sat15', 'sun8', 'sun10', 'sun13', 'sun15'],
                datasets: dataset
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
                    position: 'bottom',
                    display: false
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
        firstTimeGen = false;
    } else {
        switch (type) {
            case 1:
                addDataSet("MHB(Static)", mhbStatic, 0, "rgb(255,153,0)", "white");
                addDataSet("PHB(Static)", phbStatic, 0, "rgb(212,0,255)", "white");
                addDataSet("Math(Static)", mcrStatic, 0, "rgba(0,0,0,0)", "rgb(255,153,0)", "rgb(255,153,0)");
                addDataSet("Phy(Static)", pcrStatic, 0, "rgba(0,0,0,0)", "rgb(212,0,255)", "rgb(212,0,255)");
                addDataSet("Che(Static)", ccrStatic, 0, "rgba(0,0,0,0)", "#ff8af3", "#ff8af3");
                addDataSet("Eng(Static)", ecrStatic, 0, "rgba(0,0,0,0)", "#bdbdbd", "#bdbdbd");
                dataset.push({
                    type: 'bar',
                    label: "Remaining",
                    stack: 'Stack 0',
                    data: emptySeat,
                    backgroundColor: "rgba(0,0,0,0)",
                    borderColor: "rgba(0,0,0,0)",
                    borderWidth: 2,
                    datalabels: {
                        font: {
                            style: 'bold',
                            size: 16
                        },
                        color: "blue",
                        anchor: "start",
                        align: "end",
                        offset: 1,
                        formatter: function (value, context) {
                            if (value === '') {
                                return '';
                            } else {
                                return '( ' + value + ' )';
                            }
                        }
                    }
                });
                updateArray(myChart.data.datasets, dataset);
                myChart.update();
                break;
            case 3:
                addDataSet("MHB(Static)", mhbStatic, 0, "rgb(255,153,0)", "white");
                addDataSet("PHB(Static)", phbStatic, 0, "rgb(212,0,255)", "white");
                addDataSet("Math(Static)", mcrStatic, 0, "rgba(0,0,0,0)", "rgb(255,153,0)", "rgb(255,153,0)");
                addDataSet("Phy(Static)", pcrStatic, 0, "rgba(0,0,0,0)", "rgb(212,0,255)", "rgb(212,0,255)");
                addDataSet("Che(Static)", ccrStatic, 0, "rgba(0,0,0,0)", "#ff8af3", "#ff8af3");
                addDataSet("Eng(Static)", ecrStatic, 0, "rgba(0,0,0,0)", "#bdbdbd", "#bdbdbd");
                dataset.push({
                    type: 'bar',
                    label: "Remaining",
                    stack: 'Stack 0',
                    data: emptySeat,
                    backgroundColor: "rgba(0,0,0,0)",
                    borderColor: "rgba(0,0,0,0)",
                    borderWidth: 2,
                    datalabels: {
                        font: {
                            style: 'bold',
                            size: 16
                        },
                        color: "blue",
                        anchor: "start",
                        align: "end",
                        offset: 1,
                        formatter: function (value, context) {
                            if (value === '') {
                                return '';
                            } else {
                                return '( ' + value + ' )';
                            }
                        }
                    }
                });
            case 2:
                addDataSet("MHB(Real)", mhbReal, 1, "#e64500", "white");
                addDataSet("PHB(Real)", phbReal, 1, "#8a00e0", "white");
                addDataSet("Math(Real)", mcrReal, 1, "rgba(0,0,0,0)", "#e64500", "#e64500");
                addDataSet("Phy(Real)", pcrReal, 1, "rgba(0,0,0,0)", "#8a00e0", "#8a00e0");
                addDataSet("Che(Real)", ccrReal, 1, "rgba(0,0,0,0)", "#ff3dec", "#ff3dec");
                addDataSet("Eng(Real)", ecrReal, 1, "rgba(0,0,0,0)", "#9e9e9e", "#9e9e9e");
                updateArray(myChart.data.datasets, dataset);
                myChart.update();
                break;
            default:
                break;
        }
    }
    fixWindowHeight();
}
$(window).resize(function () {
    fixWindowHeight();
});
function fixWindowHeight() {
    $("#chartContent > .chart-container").height($("#fhbChart").height());
}
$("#staticChartButt").click(function () {
    generateChart(1);
});
$("#realChartButt").click(function () {
    generateChart(2);
});
$("#compareChartButt").click(function () {
    generateChart(3);
});