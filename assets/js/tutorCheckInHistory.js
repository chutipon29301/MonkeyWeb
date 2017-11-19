const logMoment = (moment) => {
    log(moment.format("DD/MM/YYYY HH:mm:ss"));
}

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
        str += "<button class='col mx-1 btn " + detail[i] + "'>" + detail[i] + "</button>"
    }
    return "<div class='row'>" + str + "</div>";
}