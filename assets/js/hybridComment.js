// back to normal web page
$("#goback-btn").click(() => {
    if (confirm('ต้องการย้อนกลับ?')) {
        self.location = '/adminAllStudent';
    }
});
// add date select
const addDateSelectOption = () => {
    $(".dateSelect").empty();
    let today = moment();
    let tue = (today.clone().day(2).day() >= today.day()) ? today.clone().day(2) : today.clone().day(9);
    let thu = (today.clone().day(4).day() >= today.day()) ? today.clone().day(4) : today.clone().day(11);
    let sat = (today.clone().day(6).day() >= today.day()) ? today.clone().day(6) : today.clone().day(13);
    let sun = (today.clone().day(0).day() >= today.day()) ? today.clone().day(0) : today.clone().day(7);
    tue.hour(17).minute(0).second(0).millisecond(0);
    $(".dateSelect").append('<option value=' + tue.valueOf() + '>' + tue.format('ddd DD/MM/YYYY (HH:mm)') + '</option>');
    thu.hour(17).minute(0).second(0).millisecond(0);
    $(".dateSelect").append('<option value=' + thu.valueOf() + '>' + thu.format('ddd DD/MM/YYYY (HH:mm)') + '</option>');
    for (let i = 0; i < 4; i++) {
        sat.hour((8 + 2 * i) + (i > 1)).minute(0).second(0).millisecond(0);
        $(".dateSelect").append('<option value=' + sat.valueOf() + '>' + sat.format('ddd DD/MM/YYYY (HH:mm)') + '</option>');
    }
    for (let i = 0; i < 4; i++) {
        sun.hour((8 + 2 * i) + (i > 1)).minute(0).second(0).millisecond(0);
        $(".dateSelect").append('<option value=' + sun.valueOf() + '>' + sun.format('ddd DD/MM/YYYY (HH:mm)') + '</option>');
    }
};
addDateSelectOption();
// add zone select
const addZoneSelectOption = () => {
    $("#zoneSelector").empty();
    $("#zoneSelector").append('<option value=0>- Please Select Zone -</option>');
    let date = $('#dateSelector').val();
    $.get('/hybridCommentZoneSelect', { date: new Date(parseInt(date)) }).then((cb) => {
        $("#zoneSelector").append(cb);
    });
};
addZoneSelectOption();
$("#dateSelector").change(function () {
    addZoneSelectOption();
});
// add zone method
$("#addZoneBtn").click(() => {
    $("#addZoneModal").modal('show');
});
// add new zone
$("#addZoneSubmitBtn").click(function () {
    let zoneTime = $("#addZoneDate").val();
    let zoneName = $("#addZoneName").val();
    if (zoneName.length > 0) {
        try {
            $.post('v2/hybridZone/addZone', { date: new Date(parseInt(zoneTime)), zone: zoneName }).then((cb) => {
                console.log(cb);
                addZoneSelectOption();
                $("#addZoneModal").modal('hide');
            });
        } catch (error) {
            alert('Server error please try again;');
        }
    } else {
        alert('Please input zone name!');
    }
});
// add student data
$("#studentList").on('click', '#addStdBtn', function () {
    $("#addStdModalBody").empty();
    let zone = $("#zoneSelector").val();
    if (zone != '0') {
        let selectDate = $('#dateSelector').val();
        selectDate = moment(parseInt(selectDate));
        let date = moment(0);
        date.hour(selectDate.hour()).day(selectDate.day());
        $.get('/hybridCommentAddStd', { date: date.valueOf() }).then((cb) => {
            $("#addStdModalBody").append(cb);
            $("#addStdModal").modal('show');
        });
    } else {
        alert('Please select zone!')
    }
});
// toggle add student button
$("#addStdModalBody").on('click', '.addStdModalBodyBtn', function () {
    $(this).toggleClass('btn-primary btn-light');
});
// add student submit
$("#addStdSubmitBtn").click(function () {
    let all = $(".addStdModalBodyBtn");
    let std = [];
    for (let i = 0; i < all.length; i++) {
        if ($(all[i]).hasClass('btn-primary')) {
            std.push(all[i].name);
        }
    }
    if (std.length == 0) {
        alert('Please select some student.');
    } else {
        let promise = [];
        let date = new Date(parseInt($('#dateSelector').val()));
        let zone = $("#zoneSelector").val();
        for (let i in std) {
            promise.push($.post('v2/hybridZone/addStudent', { date: date, zone: zone, studentID: std[i] }));
        }
        Promise.all(promise).then((cb) => {
            console.log(cb);
            genStudentList();
            $("#addStdModal").modal('hide');
        });
    }
});
// gen student list
const genStudentList = () => {
    let date = $('#dateSelector').val();
    let zone = $("#zoneSelector").val();
    $.get('/hybridCommentStudentList', { date: new Date(parseInt(date)), zone: zone }).then((cb) => {
        $('#studentList').empty();
        $('#studentList').append(cb);
    });
}
$("#zoneSelector").change(function () {
    if (this.value != '0') {
        genStudentList();
    } else {
        $(".student-list").remove();
    }
});
// toggle comment button
$(".comment-btn").click(function () {
    $(this).toggleClass('select-btn nonselect-btn')
});
// toggle student select
$("#studentList").on('click', '.student-list', function () {
    $('#studentList > .student-list').removeClass('active');
    $(this).addClass('active');
});