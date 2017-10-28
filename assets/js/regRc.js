var crNum = 0;
$(document).ready(function () {
    let cookies = getCookieDict();
    let ID = cookies.monkeyWebUser;
    showPreview(ID);
    $.post('post/studentProfile', { studentID: ID }).then((profile) => {
        // log(profile.courseID.length)
        crInSumm(0, profile.courseID)
    });
    $("#submit").click(function () {
    	if($('#preview').attr('src') != 'images/nopic.png'){
    		$.post("post/changeRegistrationState", { studentID: ID, registrationState: "transferred", year: year, quarter: quarter }, function (data2) {
	            if (data2.err) {
	                alert('เกิดข้อผิดพลาดบางอย่างขึ้น โปรดลองใหม่อีกครั้งหรือติดต่อAdmin');
	                throw data2.err
	            }
	            self.location = 'studentProfile'
	        })	
    	}
        else{
        	alert('กรุณาอัพโหลดใบโอน')
        }
        // log($('#file-1').val() !== "");
        // if ($('#file-1').val() !== "") {
        //     upPic(ID);
        // } else {
        //     alert("กรุณาอัปโหลดรูปภาพ")
        // }
    })
    $("#file-1").change(function () {
        upPic(ID);
    })
});
function crInSumm(index, cr) {
    if (index < cr.length) {
        $.post("post/courseInfo", { courseID: cr[index] }).then((data) => {
            if (data.quarter === quarter) {
                crNum += 1;
            }
            crInSumm(index + 1, cr)
        })
    } else {
        $(".money").html("ชำระเงินจำนวน " + (crNum * fee) + " บาท");
    }
}
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
        formData.append('year', year);
        formData.append('quarter', quarter);
        $.ajax({
            url: 'post/submitReceipt',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                location.reload();
            }
        });
    }
}
function showPreview(ID) {
    let picId = ID;
    $.post("post/getConfig").then((config) => {
        $.get(config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60Q' + quarter + '/' + picId + '.jpg', function (data, status) {
            if (status === 'success') {
                $('#preview').attr("src", config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60Q' + quarter + '/' + picId + '.jpg');
            }
        });
        $.get(config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60Q' + quarter + '/' + picId + '.jpeg', function (data, status) {
            if (status === 'success') {
                $('#preview').attr("src", config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60Q' + quarter + '/' + picId + '.jpeg');
            }
        });
        $.get(config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60Q' + quarter + '/' + picId + '.png', function (data, status) {
            if (status === 'success') {
                $('#preview').attr("src", config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60Q' + quarter + '/' + picId + '.png');
            }
        });
    });
}