function upPic() {
    const cookie = getCookieDict();
    const ID = cookie.monkeyWebUser;
    const ufile = $('#file-1');
    const ext = ufile.val().split('.').pop().toLowerCase();
    if ($.inArray(ext, ['png', 'jpg', 'jpeg']) === -1) {
        alert('กรุณาอัพไฟล์ .jpg, .jpeg หรือ .png เท่านั้น');
    } else {
        const files = ufile.get(0).files;
        const formData = new FormData();
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
    self.location = '/studentProfile';
}