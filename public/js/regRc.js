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
                    showReceipt();
                }
            });
        }
    }
}
function showReceipt() {
    let picId = '15999';
    $.get('pic/CR60Q3/15999.jpg', function (data, status) {
        if (status === 'success') {
            $('#preview').attr("src", "pic/CR60Q3/" + picId + '.jpg');
        }
    });
    $.get('pic/CR60Q3/15999.jpeg', function (data, status) {
        if (status === 'success') {
            $('#preview').attr("src", "pic/CR60Q3/" + picId + '.jpeg');
        }
    });
    $.get('pic/CR60Q3/15999.png', function (data, status) {
        if (status === 'success') {
            $('#preview').attr("src", "pic/CR60Q3/" + picId + '.png');
        }
    });
}
function next() {
    self.location = '/studentProfile';
}