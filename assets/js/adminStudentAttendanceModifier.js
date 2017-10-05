const summerQ = 12;
const summerMonth = 9;
const summerYear = 2017;
const crYear = 2017;
const crQuarter = 4;
$(document).ready(function () {
    // for cr&fhb
    $("#datePicker").datetimepicker({
        format: "DD/MM/YYYY",
        daysOfWeekDisabled: [1, 3, 5],
        minDate: moment()
    });
    genCrTimePick();
    genCrTable();
    $("#datePicker").on("dp.change", function () {
        genCrTimePick();
        genCrTable();
    });
    $("#crTimePick").change(function () {
        genCrTable();
    });
    // for summer
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
// For cr&fhb
function genCrTimePick() {
    $("#crTimePick").empty();
    let pickDate = $('#datePicker').data('DateTimePicker').date();
    if (pickDate.day() == 2 || pickDate.day() == 4) {
        $("#crTimePick").append("<option>17-19</option>");
    } else {
        $("#crTimePick").append("<option>8-10</option>");
        $("#crTimePick").append("<option>10-12</option>");
        $("#crTimePick").append("<option>13-15</option>");
        $("#crTimePick").append("<option>15-17</option>");
    }
}
function genCrTable() {
    $("#crPresentTable").empty();
    $("#crAbsentTable").empty();
    let pickDate = $('#datePicker').data('DateTimePicker').date();
    let time = $("#crTimePick").val();
    time = time.slice(0, time.indexOf("-"));
    let dataDate = moment(0).year(pickDate.year()).month(pickDate.month()).date(pickDate.date()).hour(time).minute(0).second(0).millisecond(0);
    $.post("post/listStudentAttendanceModifierByDay", { day: dataDate.valueOf() }, (data) => {
        // log(data.absence);
        let promise1 = [];
        let promise2 = [];
        for (let i in data.absence) {
            promise1.push($.post("post/studentProfile", { studentID: data.absence[i].studentID }));
            promise2.push($.post("post/v1/listStudentHybrid", { studentID: data.absence[i].studentID, quarter: crQuarter, year: crYear }));
        }
        Promise.all([
            Promise.all(promise1),
            Promise.all(promise2)
        ]).then((dt) => {
            // log(dt[0]);
            // log(dt[1]);
            for (let i in data.absence) {
                if (data.absence[i].reason.slice(0, 3) == "add") {
                    $("#crPresentTable").append(
                        "<tr>" +
                        "<td class='text-center'>" + data.absence[i].studentID + "</td>" +
                        "<td class='text-center'>" + dt[0][i].nickname + " " + dt[0][i].firstname + "</td>" +
                        "<td class='text-center'>" + data.absence[i].reason.slice(3) + "</td>" +
                        "</tr>"
                    )
                } else {
                    // log("pending");
                    $("#crAbsentTable").append(
                        "<tr class='" + (emergencyCheck(dataDate, moment(data.absence[i].timestamp)) ? "warning" : "") + "'>" +
                        "<td class='text-center'>" + moment(data.absence[i].timestamp).format("DD/MM/YYYY") + "</td>" +
                        "<td class='text-center'>" + data.absence[i].studentID + "</td>" +
                        "<td class='text-center'>" + dt[0][i].nickname + " " + dt[0][i].firstname + "</td>" +
                        "<td class='text-center'>" + myFHB(dt[0][i].courseID, dt[1][i], dataDate) + "</td>" +
                        "<td class='text-center'>" + data.absence[i].reason + "</td>" +
                        "</tr>"
                    )
                }
            }
        })
    })
}
function myFHB(cr, fhb, time) {
    // log(cr);
    // log(fhb);
    let promise = [];
    for (let i in fhb) {
        if (moment(fhb[i].day).day() == time.day() && moment(fhb[i].day).hour() == time.hour()) {
            return ("FHB:" + fhb[i].subject);
        }
    }
    for (let i in cr) {
        promise.push($.post("post/courseInfo", { courseID: cr[i] }));
    }
    Promise.all(promise).then((data) => {
        for (let i in data) {
            if (moment(data[i].day).day() == time.day() && moment(data[i].day).hour() == time.hour()) {
                return ("CR:" + data[i].courseName);
            }
        }
    })
}
function emergencyCheck(pickDate, timestamp) {
    let time = moment(0).year(pickDate.year()).month(pickDate.month()).date(pickDate.date()).hour(18);
    let aDayValue = 24 * 60 * 60 * 1000;
    if (pickDate.day() == 0) {
        if (time.valueOf() - timestamp.valueOf() < (2 * aDayValue)) return true;
        else return false;
    } else if (time.valueOf() - timestamp.valueOf() < aDayValue) {
        return true;
    } else return false;
}
// For summer
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