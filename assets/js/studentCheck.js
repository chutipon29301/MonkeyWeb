const encrypt = (text) => {
    "use strict";
    return CryptoJS.SHA3(text)
}
const checkPermission = (id, pwd) => {
    let encryptPwd = encrypt(pwd).toString();
    return $.post('post/password', { userID: id, password: encryptPwd });
}
$("#check-in").click(async function () {
    let id = $("#std-id").val();
    let pwd = $("#std-pwd").val();
    if (id & pwd) {
        let permiss = await checkPermission(id, pwd);
        permiss = permiss.verified;
        if (permiss) {
            try {
                let [cb, stdName] = await Promise.all([
                    $.post('v2/studentCheck/checkin', { studentID: id }),
                    name(id)
                ]);
                if (cb == 'Accepted') {
                    alert("Already checkIn.");
                } else {
                    await lineNotify('MonkeyTrainee', '\n' + stdName.firstname + ' ' + stdName.nickname + '\nCheckin:' + moment().format('DD/MM/YY HH:mm:ss'));
                    alert("CheckIn complete.");
                    location.reload();
                }
            } catch (err) {
                alert(err.responseJSON.msg);
            }
        } else {
            alert("Incorrect password.")
        }
    } else {
        alert("Please input student id and password.")
    }
});
$("#check-out").click(async function () {
    let id = $("#std-id").val();
    let pwd = $("#std-pwd").val();
    if (id & pwd) {
        let permiss = await checkPermission(id, pwd);
        permiss = permiss.verified;
        if (permiss) {
            try {
                let [cb, stdName] = await Promise.all([
                    $.post('v2/studentCheck/checkout', { studentID: id }),
                    name(id)
                ]);
                await lineNotify('MonkeyTrainee', '\n' + stdName.firstname + ' ' + stdName.nickname + '\nCheckout:' + moment().format('DD/MM/YY HH:mm:ss'));
                alert("CheckOut complete.");
                location.reload();
            } catch (err) {
                alert(err.responseJSON.msg);
            }
        } else {
            alert("Incorrect password.")
        }
    } else {
        alert("Please input student id and password.")
    }
});