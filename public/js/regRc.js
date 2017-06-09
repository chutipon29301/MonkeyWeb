function upPic() {
    var cookie = getCookieDict();
    var ID = cookie.monkeyWebUser;
    var ext = $('#file-1').val().split('.').pop().toLowerCase();
    if ($.inArray(ext, ['png', 'jpg', 'jpeg']) == -1) {
        alert('กรุณาอัพไฟล์ .jpg, .jpeg หรือ .png เท่านั้น');
    } else {
        var files = $('#file-1').get(0).files;
        var formData = new FormData();
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
                }
            });
        }
    }
}
function next() {
    self.location = '/home';
}