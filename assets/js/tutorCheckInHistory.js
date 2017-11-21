log("This is tempotary func");
console.log("You can add period by call %caddTutorCheckPeriod( 'startDateString' , 'endDateString' )","color:red;");
log("Date string on form:DD/MM/YYYY");
genIntervalSelect();
$("#intervalSelect").change(function () {
    genTable();
})
async function genIntervalSelect() {
    let interval = await $.post("post/v1/listInterval");
    $("#intervalSelect").empty();
    for (let i in interval) {
        $("#intervalSelect").append(
            "<option value='" + interval[i].startDate + "-" + interval[i].endDate + "'>" +
            moment(interval[i].startDate).format("DD MMM") + "-" + moment(interval[i].endDate).format("DD MMM") +
            "</option>"
        );
    }
    genTable();
}
async function genTable() {
    let cookie = getCookieDict();
    let intervalVal = $("#intervalSelect").val();
    let startInterval = intervalVal.slice(0, intervalVal.indexOf("-"));
    let endInterval = intervalVal.slice(intervalVal.indexOf("-") + 1);
    let now = moment();
    if (parseInt(endInterval) > now.valueOf()) {
        var history = await $.post("post/v1/listCheckInHistory", { tutorID: cookie.monkeyWebUser, startDate: startInterval, endDate: now.valueOf() });
    } else {
        var history = await $.post("post/v1/listCheckInHistory", { tutorID: cookie.monkeyWebUser, startDate: startInterval, endDate: endInterval });
    }
    fillTableData(history.detail);
}
function fillTableData(history) {
    $("#tableBody").empty();
    for (let i in history) {
        $("#tableBody").append(
            "<tr>" +
            "<td class='text-center'>" + moment(history[i].checkIn).format("DD/MM/YYYY") + "</td>" +
            "<td class='text-center'>" + moment(history[i].checkIn).format("HH:mm") + "</td>" +
            "<td class='text-center'>" + moment(history[i].checkOut).format("HH:mm") + "</td>" +
            "<td>" + genDetailButt(history[i].detail) + "</td>" +
            "</tr>"
        );
    }
}
function genDetailButt(detail) {
    let str = "";
    for (let i in detail) {
        str += "<div class='col-12 col-md-2 px-1'><button class='col-12 btn " + detail[i] + "'>" + detail[i] + "</button></div>"
    }
    return "<div class='row'>" + str + "</div>";
}
function addTutorCheckPeriod(start, end) {
    let startDate = moment(start, "DD/MM/YYYY");
    startDate.hour(0).minute(0).second(0).millisecond(0);
    let endDate = moment(end, "DD/MM/YYYY");
    endDate.hour(0).minute(0).second(0).millisecond(0);
    logMoment(startDate);
    logMoment(endDate);
    $.post("post/v1/addCheckInterval", { startDate: startDate.valueOf(), endDate: endDate.valueOf() }).then(log("Finished to add period"));
    location.reload();
}