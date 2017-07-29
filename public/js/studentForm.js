$(document).ready(function () {
    let cookie = getCookieDict();
    log(cookie.monkeyWebUser);
    $.post("post/name", { userID: cookie.monkeyWebUser }).then((data) => {
        log(data);
        $("#name").append(data.nickname + " " + data.firstname + " " + data.lastname);
    });
})