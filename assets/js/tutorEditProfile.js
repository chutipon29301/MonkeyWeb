$(document).ready(function () {
    $('#emailForm').submit(function (event) {
        event.preventDefault();
        let cookie = getCookieDict();
        let tutorID = cookie.monkeyWebUser;
        if (confirm("Change Email to " + $('#tutorEmail').val())) {
            $.post('post/editTutor', { tutorID: tutorID, email: $('#tutorEmail').val() }).then((data) => {
                location.reload();
            });
        }
    });
    $('#pwdForm').submit(function (event) {
        event.preventDefault();
        let cookie = getCookieDict();
        let tutorID = cookie.monkeyWebUser;
        let psd = CryptoJS.SHA3($('#tutorPwd').val()).toString()
        if (confirm("Change password to " + $('#tutorPwd').val())) {
            $.post('post/editTutor', { tutorID: tutorID, password: psd }).then((data) => {
                location.reload();
            });
        }
    });
});