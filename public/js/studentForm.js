$(document).ready(function () {
    let cookie = getCookieDict();
    $('#datetimepicker1').datetimepicker({
        format: 'DD-MMM-YYYY'
    });
    $('#datetimepicker2').datetimepicker({
        format: 'DD-MMM-YYYY',
        inline: true
    });
    $.post('post/name', { userID: cookie.monkeyWebUser }, function (data, status) {
        $('#name').append(' ' + data.nickname + ' ' + data.firstname + ' ' + data.lastname);
    })
})
function submit() {
    log("-----submit this form-----");
    //getTime from date picker
    let date = $('.datePicker').data('DateTimePicker').date().valueOf();
    log('date: '+date);
    log('contact: ' + $('#contact').val());
    log('reason: ' + $('#reason').val());
}