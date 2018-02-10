let year;
let quarter;
let timeTable;
getCourse();
async function getCourse() {
    let cookies = getCookieDict();
    let [config, allQ] = await Promise.all([getConfig(), listQuarter("public")]);
    year = config.defaultQuarter.registration.year;
    quarter = config.defaultQuarter.registration.quarter;
    for (let i in allQ.quarter) {
        if (allQ.quarter[i].year === year && allQ.quarter[i].quarter === quarter) {
            $("#absentHeader").html("แบบฟอร์มลา " + allQ.quarter[i].name);
        }
    }
    let stdTable = await $.post("post/v1/studentTimeTable", { year: year, quarter: quarter, studentID: cookies.monkeyWebUser });
    timeTable = stdTable;
    enableBtn(stdTable);
}
function enableBtn(table) {
    for (let i in table.course) {
        let t = moment(table.course[i].day);
        $(".btn-" + t.hour()).removeClass("disabled");
    }
}
$(".btn-a").click(function () {
    if (!$(this).hasClass("disabled")) {
        $(this).toggleClass("btn-light btn-danger");
    }
});
$(".btn-p").click(function () {
    if (!$(this).hasClass("disabled")) {
        $(this).toggleClass("btn-light btn-info");
    }
});
$("#submit").click(function () {
    if ($(".btn-danger").length > 0) {
        if ($("#sender").val().length > 0) {
            sendData();
        } else {
            alert("กรุณาใส่ชื่อผู้แจ้ง");
        }
    } else {
        self.location = "/studentProfile";
    }
});
async function sendData() {
    let body = {};
    let cookies = getCookieDict();
    let promise = [];
    body.userID = cookies.monkeyWebUser;
    body.reason = "SummerAbsent";
    body.sender = $("#sender").val();
    for (let i = 0; i < $(".btn-danger").length; i++) {
        let str = $(".btn-danger")[i].id;
        let t = moment(0);
        t.date(parseInt(str.slice(1, 3))).month(2).year(2018).hour(parseInt(str.slice(-2)));
        body.date = t.valueOf();
        for (let j in timeTable.course) {
            let time = moment(timeTable.course[j].day);
            if (time.hour() === t.hour()) {
                body.courseID = timeTable.course[j].courseID;
            }
        }
        promise.push($.post("post/v1/addStudentAbsent", body));
    }
    let cb = await Promise.all(promise);
    log(cb);
    self.location = "/registrationReceipt"
}