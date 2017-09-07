$(document).ready(function () {
    // get cookie
    let cookie = getCookieDict();
    let ID = cookie.monkeyWebUser;
    // show name
    $.post('post/name', { userID: ID }).then((data) => {
        $('#name').append(' ' + data.nickname + ' ' + data.firstname + ' ' + data.lastname);
    })
    // get now
    let now = moment();
    genCalendar(now);
    // function for change month
    $("#prevMonth").click(function () {
        let thisMonth = now.month();
        let prevMonth = now.month(thisMonth - 1);
        log(thisMonth);
        genCalendar(prevMonth);
    })
    $("#nextMonth").click(function () {
        let thisMonth = now.month();
        let nextMonth = now.month(thisMonth + 1);
        log(thisMonth);
        genCalendar(nextMonth);
    })
})
// generate calendar
function genCalendar(time, studentID) {
    $("#tableBody").empty();
    $("#monthTable").html(time.format("MMMM"));
    let amoutDay = getAmoutDay(time);
    time.date(1);
    let DOW = time.day();
    $("#tableBody").append("<tr></tr>");
    if (DOW !== 0) {
        $("#tableBody>tr:last-child").append("<td colspan='" + DOW + "'></td>")
    }
    for (let i = 0; i < amoutDay; i++) {
        time.date(i + 1);
        if ((DOW + i) % 7 === 0) {
            $("#tableBody").append("<tr></tr>");
        }
        $("#tableBody>tr:last-child").append("<td class='text-center' id='" + time.valueOf() + "'>" + (i + 1) + "</td>");
        if ((i + 1) === amoutDay && (DOW + i) % 7 < 6) {
            $("#tableBody>tr:last-child").append("<td colspan='" + (6 - ((DOW + i) % 7)) + "'></td>")
        }
    }
    log(time.format("DD-MM-YY"));
}
// get amout of day in month
function getAmoutDay(time) {
    switch (time.month()) {
        case 1:
            if (time.year() % 4 === 0) return 29;
            return 28;
            break;
        case 3:
            return 30;
            break;
        case 5:
            return 30;
            break;
        case 8:
            return 30;
            break;
        case 10:
            return 30;
            break;
        default:
            return 31
            break;
    }
}
    // add time picker
//     $('#datetimepicker1').datetimepicker({
//         format: 'DD/MM/YYYY',
//         daysOfWeekDisabled: [1, 3, 5]
//     });
//     // add event when pick day
//     $('#datetimepicker1').on("dp.change", function (e) {
//         let inTable = [];
//         let timeLabel = [];
//         let timeData = [];
//         let today = $('.datePicker').data('DateTimePicker').date();
//         $.post('post/studentProfile', { studentID: cookie.monkeyWebUser }).then((cr) => {
//             let time = moment(0);
//             for (let i = 0; i < cr.hybridDay.length; i++) {
//                 let hbday = moment(cr.hybridDay[i].day);
//                 time.date(today.date()).month(today.month()).year(today.year());
//                 if (hbday.day() === today.day()) {
//                     inTable.push("FHB: " + cr.hybridDay[i].subject);
//                     timeLabel.push(hbday.format('H:mm'));
//                     time.hour(hbday.hour()).minute(hbday.minute());
//                     timeData.push(time.valueOf());
//                 }
//             }
//             for (let i = 0; i < cr.courseID.length; i++) {
//                 $.post('post/courseInfo', { courseID: cr.courseID[i] }).then((info) => {
//                     let crday = moment(info.day);
//                     if (crday.day() === today.day()) {
//                         inTable.push(info.courseName);
//                         timeLabel.push(crday.format('H:mm'));
//                         time.hour(crday.hour()).minute(crday.minute());
//                         timeData.push(time.valueOf());
//                         updateBtn(inTable, timeLabel, timeData);
//                     }
//                 })
//             }
//             updateBtn(inTable, timeLabel, timeData);
//         })

//     })
//     // btn click function
//     $(".btn").click(function () {
//         let cls = this.className;
//         if (cls.indexOf('disabled') < 0) {
//             if (cls.indexOf('btn-info') >= 0) {
//                 this.className = cls.replace('btn-info', 'btn-primary');
//             } else this.className = cls.replace('btn-primary', 'btn-info');
//         }
//     });
//     // btn submit click
//     $("#submit").click(function () {
//         let boo = true;
//         for (let i = 0; i < 4; i++) {
//             let btn = $(".btn" + (i + 1));
//             if (btn.attr('class').indexOf('btn-primary') >= 0) {
//                 boo = false;
//             }
//         }
//         if (boo) {
//             alert("กรุณาเลือกวันที่และวิชา");
//         } else if ($('#contact').val().length <= 0) {
//             alert("กรุณาใส่ชื่อผู้แจ้ง")
//         } else if ($('#reason').val().length <= 0) {
//             alert("กรุณากรอกเหตุผล")
//         } else {
//             $(".modal-body").append("<p>ต้องการลาตามนี้ใช่หรือไม่?</p>");
//             for (let i = 0; i < 4; i++) {
//                 let btn = $(".btn" + (i + 1));
//                 if (btn.attr('class').indexOf('btn-primary') >= 0) {
//                     $(".modal-body").append("<p>" + btn.text() + "</p>");
//                 }
//             }
//             $("#confirmModal").modal();
//         }
//     });
// })
// function updateBtn(table, timeLabel, timeData) {
//     for (let i = 0; i < 4; i++) {
//         $(".btn" + (i + 1)).html("-");
//         $(".btn" + (i + 1)).attr('class', 'btn btn-default col-xs-12 disabled btn' + (i + 1));
//         $(".btn" + (i + 1)).attr('id', '');
//         $(".modal-body").empty();
//     }
//     for (let i = 0; i < table.length; i++) {
//         $(".btn" + (i + 1)).html(table[i] + " (" + timeLabel[i] + ")");
//         $(".btn" + (i + 1)).attr('class', 'btn btn-info col-xs-12 btn' + (i + 1));
//         $(".btn" + (i + 1)).attr('id', timeData[i]);
//         $(".modal-body").empty();
//     }
// }
// function sendData() {
//     let data = [];
//     let cookie = getCookieDict();
//     for (let i = 0; i < 4; i++) {
//         let btn = $(".btn" + (i + 1));
//         if (btn.attr('class').indexOf('btn-primary') >= 0) {
//             let daytime = btn.attr('id');
//             data.push(daytime);
//         }
//     }
//     $.post('post/addStudentAbsenceModifier', { studentID: cookie.monkeyWebUser, day: data, reason: $('#reason').val(), sender: $('#contact').val() }).then((data) => {
//         $("#confirmModal").modal("hide");
//         location.reload();
//     })
// }