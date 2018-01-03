// global param
let studentID;
let year;
let quarter;
let timetable;
let room = {
    "sat8": {},
    "sat10": {},
    "sat13": {},
    "sat15": {},
    "sun8": {},
    "sun10": {},
    "sun13": {},
    "sun15": {},
    "tue17": {},
    "thu17": {},
};

// datePicker
let startDate = moment();
startDate.date(startDate.date() - 1);
$("#addDate").datetimepicker({
    format: "DD/MM/YYYY",
    daysOfWeekDisabled: [1, 3, 5],
    minDate: startDate
});

// main
let cookies = getCookieDict();
studentID = cookies.monkeyWebUser;

getYearAndQuarter();
function getYearAndQuarter() {
    getConfig().then((config) => {
        year = config.defaultQuarter.quarter.year;
        quarter = config.defaultQuarter.quarter.quarter;
        genBanner();
        getTimetable();
        getHistory();
    });
}

function genBanner() {
    $("#pageBanner").html("CR" + (year + 543 + "").slice(2) + "Q" + quarter);
}

async function getTimetable() {
    timetable = await $.post("post/v1/studentTimeTable", { year: year, quarter: quarter, studentID: studentID });
    getRoom();
}

async function getRoom() {
    allRoom = await $.post("post/v1/allRoom");
    for (let i in allRoom) {
        room[i] = allRoom[i].room0;
    }
    fillButton();
}

async function fillButton() {
    $(".selector").removeClass("disabled btn-info").addClass("btn-light");
    let pickDate = $('#addDate').data('DateTimePicker').date();
    if (pickDate.day() === 0 || pickDate.day() === 6) {
        $(".btn-8").html("8-10");
        $(".btn-10").html("10-12");
        $(".btn-13").html("13-15");
        $(".btn-15").html("15-17");
        let cr = timetable.course;
        for (let i in cr) {
            let t = moment(cr[i].day);
            if (t.day() === pickDate.day()) {
                $(".btn-" + t.hour()).html("CR:" + cr[i].courseName).addClass("disabled");
            }
        }
        let hb = timetable.hybrid;
        for (let i in hb) {
            let t = moment(hb[i].day);
            if (t.day() === pickDate.day()) {
                $(".btn-" + t.hour()).html("FHB:" + hb[i].subject).addClass("disabled");
            }
        }
    } else {
        $(".selector").html("-");
        $(".btn-10").addClass("disabled");
        $(".btn-13").addClass("disabled");
        $(".btn-15").addClass("disabled");
        let hb = timetable.hybrid;
        for (let i in hb) {
            let t = moment(hb[i].day);
            if (t.day() === pickDate.day()) {
                $(".btn-8").html("FHB:" + hb[i].subject).addClass("disabled");
            }
        }
    }
    let adtend = await $.post("post/v1/listAttendance", {
        date: pickDate.hour(6).valueOf()
    });
    let adtendSum = {
        "sat8": 0,
        "sat10": 0,
        "sat13": 0,
        "sat15": 0,
        "sun8": 0,
        "sun10": 0,
        "sun13": 0,
        "sun15": 0,
        "tue17": 0,
        "thu17": 0,
    };
    for (let i in adtend) {
        let t = moment(adtend[i].date);
        let str = t.format("ddd") + t.hour() + "";
        str = str.toLowerCase();
        let max = room[str].maxStudent;
        let useStd = room[str].studentCount;
        if (adtend[i].courseID === 0) {
            if (adtend[i].type === 1) {
                adtendSum[str] -= 1;
            } else {
                adtendSum[str] += 1;
            }
        } else {
            let cr = room[str].course;
            for (let j in cr) {
                if (cr.courseID === adtend[i].courseID) {
                    adtendSum[str] -= 1;
                }
            }
        }
    }
    for (let i in room) {
        let pointer = $(".btn-" + i.slice(3));
        if (!pointer.hasClass("disabled")) {
            if (room[i].studentCount + adtendSum[i] >= room[i].maxStudent) {
                pointer.addClass("disabled").html("FULL");
            }
        }
    }
}

async function getHistory() {
    $("#absentTableBody").empty();
    $("#presentTableBody").empty();
    let pickDate = $('#addDate').data('DateTimePicker').date();
    let startDate = moment(0);
    let endDate = moment(0);
    startDate.year(pickDate.year()).month(pickDate.month() - 3).date(pickDate.date());
    endDate.year(pickDate.year()).month(pickDate.month() + 3).date(pickDate.date());
    let history = await $.post("post/v1/listAttendance", {
        studentID: studentID,
        studentStartDate: startDate.valueOf(),
        studentEndDate: endDate.valueOf()
    });
    let promise = [];
    for (let i in history) {
        if (history[i].courseID === 0) {
            promise.push($.post("post/v1/studentHybridSubject", {
                studentID: studentID,
                hybridID: history[i].hybridID
            }));
        } else {
            promise.push(courseInfo(history[i].courseID));
        }
    }
    let historyDetail = await Promise.all(promise);
    for (let i = 0; i < history.length; i++) {
        let t = moment(history[i].date).format("DD/MM/YY - HH:mm");
        let tableTarget;
        if (history[i].type === 2) {
            tableTarget = $("#presentTableBody");
            if (history[i].courseID === 0) {
                tableTarget.append(
                    "<tr>" +
                    "<td class='text-center'>" + t + "</td>" +
                    "<td class='text-center'>FHB:" + history[i].subject + "</td>" +
                    "<td class='text-center'>" + history[i].sender + "</td>" +
                    "</tr>"
                );
            }
        } else {
            tableTarget = $("#absentTableBody");
            if (history[i].courseID === 0) {
                tableTarget.append(
                    "<tr>" +
                    "<td class='text-center'>" + t + "</td>" +
                    "<td class='text-center'>FHB:" + historyDetail[i].subject + "</td>" +
                    "<td class='text-center'>" + history[i].sender + "</td>" +
                    "</tr>"
                );
            } else {
                tableTarget.append(
                    "<tr>" +
                    "<td class='text-center'>" + t + "</td>" +
                    "<td class='text-center'>CR:" + historyDetail[i].courseName + "</td>" +
                    "<td class='text-center'>" + history[i].sender + "</td>" +
                    "</tr>"
                );
            }
        }
    }
}

// add event when change pick date
$("#addDate").on("dp.change", function () {
    getHistory();
    fillButton();
});

// toggle button
$(".selector").click(function () {
    if (!$(this).hasClass("disabled")) {
        if ($(this).hasClass("btn-light")) {
            $(".selector").removeClass("btn-info");
            $(this).removeClass("btn-light").addClass("btn-info");
        } else {
            $(this).toggleClass("btn-light btn-info");
        }
    }
});

// add event when submit
$("#submitButt").click(function () {
    if ($(".btn-info").length <= 0) {
        alert("กรุณาเลือกเวลา");
    } else if ($("#senderInput").val() === "") {
        alert("กรุณาใส่ผู้แจ้ง");
    } else if (confirm("ยืนยันการเพิ่ม?")) {
        sendData();
    }
});

// round time function
const roundTime = (time, round) => {
    let result = moment(0);
    result.year(time.year()).month(time.month()).date(time.date()).hour(parseInt(round));
    return result.valueOf();
};

// function for send data to server
async function sendData() {
    $("#loadingModal").modal("show");
    let pickDate = $('#addDate').data('DateTimePicker').date();
    let notifyStr = "\n";
    let studentName = await name(studentID);
    notifyStr = notifyStr + studentName.nickname + " " + studentName.firstname + "\n";
    notifyStr = notifyStr + "ต้องการเพิ่ม: " + pickDate.format("ddd DD/MM/YY") + "\n";
    let timeStr = $(".btn-info").html();
    notifyStr = notifyStr + "FHB:" + $("#subjInput").val() + " - " +
        timeStr.slice(0, timeStr.indexOf("-")) + ":00";
    let allHB = await $.post("post/v1/listHybridDayInQuarter", { year: year, quarter: quarter });
    let hybridID;
    for (let i in allHB) {
        let t = moment(allHB[i].day);
        if (t.day() === pickDate.day() && t.hour() === parseInt(timeStr.slice(0, timeStr.indexOf("-")))) {
            hybridID = allHB[i].hybridID;
        }
    }
    await $.post("post/v1/addStudentPresent", {
        userID: studentID,
        date: roundTime(pickDate, timeStr.slice(0, timeStr.indexOf("-"))),
        hybridID: hybridID,
        subject: $("#subjInput").val(),
        sender: $("#senderInput").val()
    });
    log("OK");
    await lineNotify("MonkeyAdmin", notifyStr);
    location.reload();
}