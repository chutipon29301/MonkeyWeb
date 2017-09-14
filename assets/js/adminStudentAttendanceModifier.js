const summerQ = 12;
const summerMonth = 9;
const summerYear = 2017;
$(document).ready(function () {
    genTableByName();
    $("#smByName").collapse("show");
    $("#aByName").click(function () {
        $("#smByWeek").collapse("hide");
        setTimeout(function () {
            $("#smByName").collapse("show");
        }, 500);
    });
    $("#aByWeek").click(function () {
        $("#smByName").collapse("hide");
        setTimeout(function () {
            $("#smByWeek").collapse("show");
        }, 500);
    });
    $("#weekSelect").change(function () {
        genTableByWeek();
    })
    $("#typeSelect").change(function () {
        genTableByWeek();
    })
});
// func for generate student TypeAhead(Table by Name)
function genTableByName() {
    let allStudent = [];
    // gen typeahead input
    $("#smByName").empty();
    $("#smByName").append("<div class='row' id='smHeader'></div>");
    $("#smHeader").append(
        "<form class='col-sm-2'>" +
        "<div class='form-group'>" +
        "<label>Input Name:</label>" +
        "<input class='form-control typeahead' type='text' data-provide='typeahead' autofocus>" +
        "</div>" +
        "</form>"
    );
    // get typeahead data
    $.post("post/allStudent").done(function (data) {
        for (let i = 0; i < data.student.length; i++) {
            if (data.student[i].status === "active") {
                for (let j = 0; j < data.student[i].quarter.length; j++) {
                    if (data.student[i].quarter[j].quarter === summerQ) {
                        allStudent.push({
                            name: data.student[i].nickname + " " + data.student[i].firstname,
                            id: data.student[i].studentID
                        })
                    }
                }
            }
        }
        // log(allStudent);
        $('.typeahead').typeahead({
            source: allStudent,
            autoSelect: true
        });
        // gen table head
        $("#smByName").append(
            "<div class='row'>" +
            "<div class='table-responsive col-sm-9'>" +
            "<table class='table table-hover table-bordered'>" +
            "<thead>" +
            "<tr><th colspan='4' class='danger text-center' style='font-size:2em'>ลา</th></tr>" +
            "<tr>" +
            "<th class='text-center col-sm-6'>DATE</th>" +
            "<th class='text-center col-sm-2'>8.00-10.00</th>" +
            "<th class='text-center col-sm-2'>10.00-12.00</th>" +
            "<th class='text-center col-sm-2'>13.00-15.00</th>" +
            "</tr>" +
            "</thead>" +
            "<tbody id='smAbsentBody'></tbody>" +
            "</table>" +
            "</div>" +
            "<div class='table-responsive col-sm-3'>" +
            "<table class='table table-hover table-bordered'>" +
            "<thead>" +
            "<tr><th class='success text-center' style='font-size:2em'>เพิ่ม</th></tr>" +
            "<tr><th class='text-center col-sm-6'>DATE</th></tr>" +
            "</thead>" +
            "<tbody id='smPresentBody'></tbody>" +
            "</table>" +
            "</div>" +
            "</div>"
        );
        // add func when pick student
        $(".typeahead").change(function () {
            let picked = $('.typeahead').typeahead("getActive");
            $("#smAbsentBody").empty();
            $("#smPresentBody").empty();
            genPickedTable(picked.id);
        });
    }).fail(function () {
        log("=>fail to post/allStudent");
    })
}
// func for generate absent table by picked student name
function genPickedTable(ID) {
    let time = moment();
    $.post("post/listStudentAttendanceModifierByStudent", { studentID: ID, start: time.valueOf() }).done(function (data) {
        // log(data)
        let oldAbsentDay = moment(0);
        for (let i = 0; i < data.modifier.length; i++) {
            if (data.modifier[i].reason === "เพิ่ม") {
                $("#smPresentBody").append(
                    "<tr><td class='text-center'>" + moment(data.modifier[i].day).format("DD/MM/YYYY") + "</td></tr>"
                );
            } else if (data.modifier[i].reason === "ลา") {
                let bool = (moment(data.modifier[i].day).date() === oldAbsentDay.date() && moment(data.modifier[i].day).month() === oldAbsentDay.month() && moment(data.modifier[i].day).year() === oldAbsentDay.year());
                if (bool) {
                    if (moment(data.modifier[i].day).hour() === 8) {
                        $(".a:last").html("✓");
                    }
                    if (moment(data.modifier[i].day).hour() === 10) {
                        $(".b:last").html("✓");
                    }
                    if (moment(data.modifier[i].day).hour() === 13) {
                        $(".c:last").html("✓");
                    }
                } else {
                    // log("present")
                    oldAbsentDay = moment(data.modifier[i].day);
                    $("#smAbsentBody").append("<tr></tr>");
                    $("#smAbsentBody tr:last-child").append(
                        "<td class='text-center'>" + moment(data.modifier[i].day).format("DD/MM/YYYY") + "</td>" +
                        "<td class='text-center a'>" + ((moment(data.modifier[i].day).hour() === 8) ? "✓" : "-") + "</td>" +
                        "<td class='text-center b'>" + ((moment(data.modifier[i].day).hour() === 10) ? "✓" : "-") + "</td>" +
                        "<td class='text-center c'>" + ((moment(data.modifier[i].day).hour() === 13) ? "✓" : "-") + "</td>"
                    );
                }
            }
        }
    }).fail(function () {
        log("=>fail to post/listStudentAttendanceModifierByStudent");
    })
}
// func for generate table by week
function genTableByWeek() {
    $("#smWeekBody").empty();
    const startDay = parseInt($("#weekSelect").val());
    const startHour = 8;
    weekDayRecur(startDay, startDay, startHour);
}
function weekDayRecur(startDay, day, hour) {
    if (day - startDay < 5) {
        let time = moment(0).date(day).month(summerMonth).year(summerYear).hour(hour);
        $.post("post/listStudentAttendanceModifierByDay", { day: time.valueOf() }).done(function (data) {
            log(data.absence);
            weekDayGetName(data.absence, 0, time, startDay);
        })
    }
}
function weekDayGetName(absent, index, moment, startDay) {
    if (index < absent.length) {
        $.post("post/name", { userID: absent[index].studentID }).done(function (data) {
            if (absent[index].reason === "ลา" && ($("#typeSelect").val() === "0" || $("#typeSelect").val() === "1")) {
                $("#smWeekBody").append("<tr class='danger'></tr>");
                $("#smWeekBody tr:last-child").append(
                    "<td class='text-center'>" + absent[index].studentID + "</td>" +
                    "<td>" + data.firstname + " (" + data.nickname + ") " + data.lastname + "</td>" +
                    "<td class='text-center'>" + moment.format("DD/MM/YYYY") + "</td>" +
                    "<td class='text-center'>" + moment.format("HH:mm") + "</td>"
                )
            } else if (absent[index].reason === "เพิ่ม" && ($("#typeSelect").val() === "0" || $("#typeSelect").val() === "2")) {
                $("#smWeekBody").append("<tr class='success'></tr>");
                $("#smWeekBody tr:last-child").append(
                    "<td class='text-center'>" + absent[index].studentID + "</td>" +
                    "<td>" + data.firstname + " (" + data.nickname + ") " + data.lastname + "</td>" +
                    "<td class='text-center'>" + moment.format("DD/MM/YYYY") + "</td>" +
                    "<td class='text-center'>" + moment.format("HH:mm") + "</td>"
                )
            }
            log(startDay)
            weekDayGetName(absent, index + 1, moment, startDay)
        })
    } else {
        let hour = moment.hour();
        let day = moment.date();
        if (hour === 8) {
            weekDayRecur(startDay, day, 10)
        } else if (hour === 10) {
            weekDayRecur(startDay, day, 13)
        } else if (hour === 13) {
            weekDayRecur(startDay, day, 15)
        } else if (hour === 15) {
            weekDayRecur(startDay, day + 1, 8)
        }
    }
}