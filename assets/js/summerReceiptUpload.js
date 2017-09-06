$(document).ready(function () {
    let cookies = getCookieDict();
    let ID = cookies.monkeyWebUser;
    $("#submit").click(function () {
        upPic(ID);
    })
});
function upPic(ID) {
    let ufile = $('#file-1');
    let ext = ufile.val().split('.').pop().toLowerCase();
    if ($.inArray(ext, ['png', 'jpg', 'jpeg']) === -1) {
        alert('กรุณาอัพไฟล์ .jpg, .jpeg หรือ .png เท่านั้น');
    } else {
        let files = ufile.get(0).files;
        let formData = new FormData();
        let file = files[0];
        formData.append('file', file, file.name);
        formData.append('studentID', ID);
        formData.append('quarter', "summer");
        $.ajax({
            url: 'post/submitReceipt',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                $.post("post/changeRegistrationState", { studentID: ID, registrationState: "transferred", quarter: summer }, function (data2) {
                    if (data2.err) {
                        alert('เกิดข้อผิดพลาดบางอย่างขึ้น โปรดลองใหม่อีกครั้งหรือติดต่อAdmin');
                        throw data2.err
                    }
                    self.location = 'studentProfile'
                })
            }
        });
    }
}