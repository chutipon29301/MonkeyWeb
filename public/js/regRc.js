function upPic() {
    let cookie = getCookieDict();
    let ID = cookie.monkeyWebUser;
    let ufile = $('#file-1');
    let ext = ufile.val().split('.').pop().toLowerCase();
    if ($.inArray(ext, ['png', 'jpg', 'jpeg']) === -1) {
        alert('กรุณาอัพไฟล์ .jpg, .jpeg หรือ .png เท่านั้น');
    } else {
        let files = ufile.get(0).files;
        let formData = new FormData();
        if (!$('i').hasClass('fa')) {
            $('.upload').prepend('<i class="fa fa-circle-o-notch fa-spin"></i>');
            formData.append('file', files[0], files[0].name);
            formData.append('studentID', ID);
            $.ajax({
                url: 'post/submitReceipt',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (data) {
                    $('.fa').remove();
                    log('====================');
                    log(ID);
                    showReceipt(ID);
                }
            });
        }
    }
}
function showReceipt(id) {
    $.get('pic/CR60Q3/' + id + '.jpg', function (data, status) {
        if (status === 'success') {
            $('#preview').attr("src", "pic/CR60Q3/" + id + '.jpg');
        }
    });
    $.get('pic/CR60Q3/' + id + '.jpeg', function (data, status) {
        if (status === 'success') {
            $('#preview').attr("src", "pic/CR60Q3/" + id + '.jpeg');
        }
    });
    $.get('pic/CR60Q3/' + id + '.png', function (data, status) {
        if (status === 'success') {
            $('#preview').attr("src", "pic/CR60Q3/" + id + '.png');
        }
    });
}
function next() {
    self.location = '/studentProfile';
}