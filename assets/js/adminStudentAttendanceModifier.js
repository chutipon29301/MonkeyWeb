const summerQ = 12;
const summerMonth = 9;
const summerYear = 2017;
const crYear = 2017;
const crQuarter = 4;
let hybridDay = [];
$(document).ready(function () {
    // for cr&fhb
    $("#datePicker").datetimepicker({
        format: "DD/MM/YYYY",
        daysOfWeekDisabled: [1, 3, 5],
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
    $("#filterPick").change(function () {
        filterTable();
    });
    // for permamnent
    genPnTable();
    // for activity
    $("#acLink").click(function () {
        if (!($("#acLink").hasClass("clicked"))) {
            $("#acLink").addClass("clicked");
            genActivityTable();
        }
    });
    // for summer
    genSmCrPick();
    genTableByName();
    $("#smByName").collapse("show");
    $("#aByName").click(function () {
        $("#smByWeek").collapse("hide");
        $("#smByCourse").collapse("hide");
        setTimeout(function () {
            $("#smByName").collapse("show");
        }, 500);
    });
    $("#aByWeek").click(function () {
        $("#smByName").collapse("hide");
        $("#smByCourse").collapse("hide");
        setTimeout(function () {
            $("#smByWeek").collapse("show");
        }, 500);
    });
    $("#aByCourse").click(function () {
        $("#smByName").collapse("hide");
        $("#smByWeek").collapse("hide");
        setTimeout(function () {
            $("#smByCourse").collapse("show");
        }, 500);
    });
    $("#weekSelect").change(function () {
        genTableByWeek();
    })
    $("#typeSelect").change(function () {
        filterSmTable();
    })
    $("#smCrSelect").change(function () {
        genSmTableByCr();
    })
    // for add new attendance
    $("#addDatePicker").datetimepicker({
        format: "DD/MM/YYYY HH",
        daysOfWeekDisabled: [1, 3, 5],
    });
    $("#addNewAttend").click(function () {
        if (!($("#addDatePicker").val())) {
            alert("Pick Day");
        } else if (!($("#addID").val())) {
            alert("Input Student ID");
        } else if (!($("#addSender").val())) {
            alert("Input Sender");
        } else {
            let addDate = $('#addDatePicker').data('DateTimePicker').date().minute(0).second(0).millisecond(0).valueOf();
            if ($("#addType").val() == "ลา") {
                if (!($("#addReason").val())) {
                    alert("Input Reason");
                } else {
                    $.post("post/addStudentAbsenceModifier", { studentID: $("#addID").val(), day: [addDate], reason: $("#addReason").val(), sender: $("#addSender").val() }).then(() => {
                        location.reload();
                    })
                }
            } else {
                $.post("post/addStudentAbsenceModifier", { studentID: $("#addID").val(), day: [addDate], reason: "add" + $("#addSubj").val(), sender: $("#addSender").val() }).then(() => {
                    location.reload();
                })
            }
        }
    });
});
// relocation func
function relocate(ID) {
    writeCookie("monkeyWebAdminAllstudentSelectedUser", ID);
    self.location = "/adminStudentprofile";
}
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
                        "<td class='text-center'>" + moment(data.absence[i].timestamp).format("DD/MM/YYYY HH:mm") + "</td>" +
                        "<td class='text-center' onclick='relocate(" + data.absence[i].studentID + ")'>" + dt[0][i].nickname + " " + dt[0][i].firstname + "</td>" +
                        "<td class='text-center'>" + data.absence[i].reason.slice(3) + "</td>" +
                        "<td class='text-center'><button id='" + data.absence[i].modifierID + "' onClick='removeAttend(this.id);' class='btn btn-light col-12'><span class='fa fa-trash'></span></button></td>" +
                        "</tr>"
                    )
                } else {
                    // log("pending");
                    $("#crAbsentTable").append(
                        "<tr class='" + (emergencyCheck(dataDate, moment(data.absence[i].timestamp)) ? "table-warning" : "") + " row" + i + "'>" +
                        "<td class='text-center'>" + moment(data.absence[i].timestamp).format("DD/MM/YYYY HH:mm") + "</td>" +
                        "<td class='text-center' onclick='relocate(" + data.absence[i].studentID + ")'>" + dt[0][i].nickname + " " + dt[0][i].firstname + "</td>" +
                        "<td class='text-center absentSubject" + i + "'></td>" +
                        "<td class='text-center absentTutor" + i + "'></td>" +
                        "<td class='text-center'>" + data.absence[i].reason + "</td>" +
                        "<td class='text-center'><button id='" + data.absence[i].modifierID + "' onClick='removeAttend(this.id);' class='btn btn-light col-12'><span class='fa fa-trash'></span></button></td>" +
                        "</tr>"
                    );
                    myFHB(dt[0][i].courseID, dt[1][i], dataDate, i);
                }
            }
        })
    })
}
function myFHB(cr, fhb, time, index) {
    let promise = [];
    for (let i in fhb) {
        if (moment(fhb[i].day).day() == time.day() && moment(fhb[i].day).hour() == time.hour()) {
            $(".row" + index).addClass("fhb");
            $(".absentTutor" + index).html("HB");
            $(".absentSubject" + index).html("FHB:" + fhb[i].subject);
            filterTable();
            return;
        }
    }
    for (let i in cr) {
        promise.push($.post("post/courseInfo", { courseID: cr[i] }));
    }
    Promise.all(promise).then((data) => {
        for (let i in data) {
            if (data[i].quarter == crQuarter) {
                if (moment(data[i].day).day() == time.day() && moment(data[i].day).hour() == time.hour()) {
                    if (data[i].tutor[0] == 99000) {
                        $(".row" + index).addClass("hb");
                        $(".absentTutor" + index).html("HB");
                        $(".absentSubject" + index).html("CR:" + data[i].courseName);
                        filterTable();
                        return;
                    } else {
                        $(".row" + index).addClass("cr");
                        $.post("post/name", { userID: data[i].tutor[0] }).then((tutorName) => {
                            $(".absentTutor" + index).html(tutorName.nicknameEn);
                            $(".absentSubject" + index).html("CR:" + data[i].courseName);
                            filterTable();
                            return;
                        })
                    }
                }
            }
        }
    })
}
function filterTable() {
    let filter = $("#filterPick").val();
    switch (filter) {
        case "HB":
            $(".cr").hide();
            $(".hb").show();
            $(".fhb").show();
            break;
        case "CR":
            $(".hb").show();
            $(".fhb").hide();
            $(".cr").show();
            break;
        case "FHB":
            $(".hb").hide();
            $(".fhb").show();
            $(".cr").hide();
            break;
        default:
            $(".fhb").show();
            $(".hb").show();
            $(".cr").show();
            break;
    }
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
// For remove attendance
function removeAttend(id) {
    if (confirm("ต้องการลบประวัติการลานี้?")) {
        $.post("post/removeStudentAttendanceModifier", { modifierID: id }).then(() => {
            genCrTable();
            genTableByWeek();
            let picked = $('.typeahead').typeahead("getActive");
            if (picked != undefined) {
                genPickedTable(picked.id);
            }
        })
    }
}
// For permanent
function genPnTable() {
    $.post("post/v1/listPendingHybridStudent").then(pendingData => {
        let promise = [];
        for (let i in pendingData) {
            promise.push(name(pendingData[i].studentID));
        }
        $.post("post/v1/listHybridDayInQuarter", { year: crYear, quarter: crQuarter }).then(hb => {
            for (let i in hb) {
                hybridDay.push(hb[i]);
            }
            Promise.all(promise).then(name => {
                for (let i in pendingData) {
                    for (let j in hb) {
                        if (pendingData[i].hybridID === hb[j].hybridID) {
                            let hbTime = moment(parseInt(hb[j].day));
                            let time = moment(parseInt(pendingData[i].date)).hour(hbTime.hour());
                            if (pendingData[i].mode === "MODE_ADD_HYBRID") {
                                $("#pnPresentTable").append(
                                    "<tr>" +
                                    "<td class='text-center'>" + time.format("DD/MM/YYYY HH:00") + "</td>" +
                                    "<td class='text-center'>" + name[i].nickname + " " + name[i].firstname + "</td>" +
                                    "<td class='text-center'>" + "FHB:" + pendingData[i].subject + "</td>" +
                                    "</tr>"
                                )
                            } else {
                                $("#pnAbsentTable").append(
                                    "<tr>" +
                                    "<td class='text-center'>" + time.format("DD/MM/YYYY HH:00") + "</td>" +
                                    "<td class='text-center'>" + name[i].nickname + " " + name[i].firstname + "</td>" +
                                    "<td class='text-center'>" + "FHB:" + pendingData[i].subject + "</td>" +
                                    "</tr>"
                                )
                            }
                        }
                    }
                }
            })
        })
    })
}
// For activity
function genActivityTable() {
    let date = new Date();
    date.setHours(6);
    $.post("post/listAllStudentAttendanceModifier", { start: date.getTime() }).then(data => {
        let promise = [];
        for (let i in data.modifier) {
            promise.push(name(data.modifier[i].studentID));
            promise.push($.post('post/courseInfo', { courseID: data.modifier[i].subject }));
        }
        Promise.all(promise).then(dt => {
            for (let i in data.modifier) {
                let modTime = moment(parseInt(data.modifier[i].day));
                if (data.modifier[i].subject === "No timetable") {
                    for (let j in hybridDay) {
                        let hbTime = moment(hybridDay[j].day);
                        if (modTime.day() == hbTime.day() && modTime.hour() == hbTime.hour()) {
                            $("#acTableBody").append(
                                "<tr class=" + (data.modifier[i].reason.slice(0, 3) === "add" ? 'table-info' : 'table-danger') + ">" +
                                "<td>" + moment(parseInt(data.modifier[i].timestamp)).format("DD/MM/YYYY HH:mm") + "</td>" +
                                "<td onclick='relocate(" + data.modifier[i].studentID + ")'>" + dt[2 * i].nickname + " " + dt[2 * i].firstname + "</td>" +
                                "<td>FHB</td>" +
                                "<td>" + modTime.format("DD/MM/YYYY HH:mm") + "</td>" +
                                "<td>" + (data.modifier[i].reason.slice(0, 3) === "add" ? '-' : data.modifier[i].reason) + "</td>" +
                                "<td>" + data.modifier[i].sender + "</td>" +
                                "<td class='text-center'><button id='" + data.modifier[i].modifierID + "' onClick='removeAttend(this.id);' class='btn btn-light col-12'><span class='fa fa-trash'></span></button></td>" +
                                "</tr>"
                            )
                        }
                    }
                } else {
                    $("#acTableBody").append(
                        "<tr class=" + (data.modifier[i].reason.slice(0, 3) === "add" ? 'table-primary' : 'table-danger') + ">" +
                        "<td>" + moment(parseInt(data.modifier[i].timestamp)).format("DD/MM/YYYY HH:mm") + "</td>" +
                        "<td onclick='relocate(" + data.modifier[i].studentID + ")'>" + dt[2 * i].nickname + " " + dt[2 * i].firstname + "</td>" +
                        "<td>CR:" + dt[2 * i + 1].courseName + "</td>" +
                        "<td>" + modTime.format("DD/MM/YYYY HH:mm") + "</td>" +
                        "<td>" + (data.modifier[i].reason.slice(0, 3) === "add" ? '-' : data.modifier[i].reason) + "</td>" +
                        "<td>" + data.modifier[i].sender + "</td>" +
                        "<td class='text-center'><button id='" + data.modifier[i].modifierID + "' onClick='removeAttend(this.id);' class='btn btn-light col-12'><span class='fa fa-trash'></span></button></td>" +
                        "</tr>"
                    )
                }
            }
        })
    })
}
// For summer
function genTableByName() {
    let allStudent = [];
    $.post("post/allStudent").done((data) => {
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
        $('.typeahead').typeahead({
            source: allStudent,
            autoSelect: true
        });
        // add func when pick student
        $(".typeahead").change(function () {
            let picked = $('.typeahead').typeahead("getActive");
            $("#smAbsentBody").empty();
            $("#smPresentBody").empty();
            genPickedTable(picked.id);
        });
    })
}
function genPickedTable(ID) {
    $("#smAbsentBody").empty();
    $("#smPresentBody").empty();
    let time = moment().date(8).month(9);
    $.post("post/listStudentAttendanceModifierByStudent", { studentID: ID, start: time.valueOf() }).done(function (data) {
        let oldAbsentDay = moment(0);
        for (let i = 0; i < data.modifier.length; i++) {
            if (data.modifier[i].reason === "เพิ่ม") {
                $("#smPresentBody").append(
                    "<tr>" +
                    "<td class='text-center'>" + moment(data.modifier[i].day).format("DD/MM/YYYY") + "</td>" +
                    "<td class='text-center'><button id='" + data.modifier[i].modifierID + "' onClick='removeAttend(this.id);'><span class='fa fa-trash'></span></button></td>" +
                    "</tr>"
                );
            } else if (data.modifier[i].reason === "ลา") {
                let bool = (moment(data.modifier[i].day).date() === oldAbsentDay.date() && moment(data.modifier[i].day).month() === oldAbsentDay.month() && moment(data.modifier[i].day).year() === oldAbsentDay.year());
                if (bool) {
                    if (moment(data.modifier[i].day).hour() === 8) {
                        $(".a:last").html("✓").attr("id", data.modifier[i].modifierID).attr("onClick", "removeAttend(this.id);");
                    }
                    if (moment(data.modifier[i].day).hour() === 10) {
                        $(".b:last").html("✓").attr("id", data.modifier[i].modifierID).attr("onClick", "removeAttend(this.id);");;
                    }
                    if (moment(data.modifier[i].day).hour() === 13) {
                        $(".c:last").html("✓").attr("id", data.modifier[i].modifierID).attr("onClick", "removeAttend(this.id);");;
                    }
                } else {
                    // log("present")
                    oldAbsentDay = moment(data.modifier[i].day);
                    $("#smAbsentBody").append("<tr></tr>");
                    $("#smAbsentBody tr:last-child").append(
                        "<td class='text-center'>" + moment(data.modifier[i].day).format("DD/MM/YYYY") + "</td>" +
                        "<td class='text-center a' id='" + data.modifier[i].modifierID + "' onClick='removeAttend(this.id);'>" + ((moment(data.modifier[i].day).hour() === 8) ? "✓" : "-") + "</td>" +
                        "<td class='text-center b' id='" + data.modifier[i].modifierID + "' onClick='removeAttend(this.id);'>" + ((moment(data.modifier[i].day).hour() === 10) ? "✓" : "-") + "</td>" +
                        "<td class='text-center c' id='" + data.modifier[i].modifierID + "' onClick='removeAttend(this.id);'>" + ((moment(data.modifier[i].day).hour() === 13) ? "✓" : "-") + "</td>"
                    );
                }
            }
        }
    })
}
function genTableByWeek() {
    $("#smWeekBody").empty();
    const startDay = parseInt($("#weekSelect").val());
    const time = [8, 10, 13, 15];
    let weekPromise = [];
    for (let i = startDay; i < startDay + 5; i++) {
        for (let j in time) {
            let day = moment(0).date(i).month(summerMonth).year(summerYear).hour(time[j]);
            weekPromise.push(
                $.post("post/listStudentAttendanceModifierByDay", { day: day.valueOf() }),
                day
            );
        }
    }
    Promise.all(weekPromise).then((data) => {
        for (let i = 0; i < data.length; i += 2) {
            for (let j in data[i].absence) {
                if (data[i].absence[j].reason == "ลา") {
                    $("#smWeekBody").append(
                        "<tr class='table-danger smAbsentRow'>" +
                        "<td class='text-center'>" + data[i].absence[j].studentID + "</td>" +
                        "<td id='name" + i + j + "'></td>" +
                        "<td class='text-center'>" + data[i + 1].format("DD/MM/YYYY") + "</td>" +
                        "<td class='text-center'>" + data[i + 1].format("HH:mm") + "</td>" +
                        "<td class='text-center'><button id='" + data[i].absence[j].modifierID + "' onClick='removeAttend(this.id);'><span class='fa fa-trash'></span></button></td>" +
                        "</tr>"
                    );
                } else if (data[i].absence[j].reason == "เพิ่ม") {
                    $("#smWeekBody").append(
                        "<tr class='table-success smPresentRow'>" +
                        "<td class='text-center'>" + data[i].absence[j].studentID + "</td>" +
                        "<td id='name" + i + j + "'></td>" +
                        "<td class='text-center'>" + data[i + 1].format("DD/MM/YYYY") + "</td>" +
                        "<td class='text-center'>" + data[i + 1].format("HH:mm") + "</td>" +
                        "<td class='text-center'><button id='" + data[i].absence[j].modifierID + "' onClick='removeAttend(this.id);'><span class='fa fa-trash'></span></button></td>" +
                        "</tr>"
                    );
                }
                filterSmTable();
                weekDayGetName(i, j, data[i].absence[j].studentID);
            }
        }
    })
}
function weekDayGetName(i, j, ID) {
    let str = "name" + i + j;
    $.post("post/name", { userID: ID }).then((smName) => {
        let nameStr = smName.firstname + " (" + smName.nickname + ") " + smName.lastname;
        $("#" + str).html(nameStr);
    })
}
function filterSmTable() {
    let filter = $("#typeSelect").val();
    switch (filter) {
        case "1":
            $(".smPresentRow").hide();
            $(".smAbsentRow").show();
            break;
        case "2":
            $(".smPresentRow").show();
            $(".smAbsentRow").hide();
            break;
        default:
            $(".smPresentRow").show();
            $(".smAbsentRow").show();
            break;
    }
}
function genSmCrPick() {
    $.post("post/allCourse", { year: summerYear, quarter: summerQ }).then((allSmCr) => {
        for (let i in allSmCr.course) {
            $("#smCrSelect").append("<option value='" + allSmCr.course[i].courseID + "'>" + allSmCr.course[i].courseName + "</option>");
        }
    })
}
function genSmTableByCr() {
    $("#smCrBody").empty();
    $.post("post/courseInfo", { courseID: $("#smCrSelect").val() }).then((crInfo) => {
        let promise = [];
        let startDay = moment(0).year(2017).month(9).date(8).valueOf();
        for (let i in crInfo.student) {
            promise.push($.post("post/name", { userID: crInfo.student[i] }), $.post("post/listStudentAttendanceModifierByStudent", { studentID: crInfo.student[i], start: startDay }));
        }
        Promise.all(promise).then((smCrData) => {
            for (let i = 0; i < smCrData.length; i += 2) {
                let str1 = "";
                let str2 = "";
                for (let j = 0; j < 15; j++) {
                    if (j < 5) {
                        str1 += "<td id='smCrAbsentCell" + i + (j + 9) + "'></td>";
                        str2 += "<td id='smCrPresentCell" + i + (j + 9) + "'></td>";
                    } else if (j < 10) {
                        str1 += "<td id='smCrAbsentCell" + i + (j + 11) + "'></td>";
                        str2 += "<td id='smCrPresentCell" + i + (j + 11) + "'></td>";
                    } else {
                        str1 += "<td id='smCrAbsentCell" + i + (j + 13) + "'></td>";
                        str2 += "<td id='smCrPresentCell" + i + (j + 13) + "'></td>";
                    }
                }
                $("#smCrBody").append(
                    "<tr>" +
                    "<td rowspan='2'>" + smCrData[i].nickname + " " + smCrData[i].firstname + " " + smCrData[i].lastname + "</td>" +
                    str1 +
                    "</tr>" +
                    "<tr>" +
                    str2 +
                    "</tr>"
                )
                for (let j in smCrData[i + 1].modifier) {
                    let day = moment(smCrData[i + 1].modifier[j].day).date();
                    if (smCrData[i + 1].modifier[j].reason == "ลา") {
                        $("#smCrAbsentCell" + i + day).addClass("table-danger");
                    } else if (smCrData[i + 1].modifier[j].reason == "เพิ่ม") {
                        $("#smCrPresentCell" + i + day).addClass("table-success");
                    }
                }
            }
        })
    })
}