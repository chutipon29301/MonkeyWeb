let cookie = getCookieDict();
let ID = cookie.monkeyWebUser;

loadProfileImg();
genQuarterSelect();

// add event when change quarter
$("#quarterSelect").change(function () {
    genStudentData();
    genStudentTimeTable();
});

// add event when click Img for upload pic
$("#profileImg").click(function () {
    $("#uploadPicModal").modal('show');
});
$("#uploadPicButt").click(function () {
    if (confirm("ยืนยันการ upload?")) {
        uploadImg();
    }
});

// load profileImg function
async function loadProfileImg() {
    let config = await getConfig();
    let path = config.profilePicturePath.slice(config.profilePicturePath.search("MonkeyWebData") + 14) + ID;
    $.get(path + ".jpg").done(() => {
        $("#profileImg").attr("src", path + ".jpg");
    }).fail(() => {
        $.get(path + ".png").done(() => {
            $("#profileImg").attr("src", path + ".png");
        }).fail(() => {
            $.get(path + ".jpeg").done(() => {
                $("#profileImg").attr("src", path + ".jpeg");
            }).fail(() => {
                log("can't find picture");
            });
        });
    });
}

// gen quarter select func
async function genQuarterSelect() {
    let allQ = await listQuarter("public");
    let $quarterSelect = $("#quarterSelect");
    for (let i in allQ.quarter) {
        $quarterSelect.append(
            "<option value='" + allQ.quarter[i].quarterID + "'>" + allQ.quarter[i].name + "</option>"
        );
    }
    $quarterSelect.val(year + ((quarter >= 10) ? "" : "0") + quarter);
    genStudentData();
    genStudentTimeTable();
}

// gen student data func
async function genStudentData() {
    $("#studentProfileContent").empty();
    let studentInfo = await studentProfile(ID);
    let qValue = $("#quarterSelect").val();
    let str = "ยังไม่ได้ลงทะเบียน";
    for (let i in studentInfo.quarter) {
        if (studentInfo.quarter[i].year == qValue.slice(0, 4) && studentInfo.quarter[i].quarter == qValue.slice(4)) {
            /* switch (studentInfo.quarter[i].registrationState) {
                case "finished":
                    str = "ลงทะเบียนเรียบร้อย";
                    break;
                case "pending":
                    str = "รอการยืนยัน";
                    break;
                case "approved":
                    str = "ตารางถูกต้อง";
                    break;
                case "transferred":
                    str = "โอนเงินเรียบร้อย";
                    break;
                case "rejected":
                    str = "แก้ไขตาราง";
                    break;
                case "untransferred":
                    str = "ยังไม่โอนเงิน";
                    break;
                default:
                    break;
            } */
            str = studentInfo.quarter[i].registrationState;
        }
    }
    if ($(document).width() >= 768) {
        $("#studentProfileContent").append(
            "<h4>" + studentInfo.firstname + " (" + studentInfo.nickname + ") " + studentInfo.lastname + "</h4>" +
            "<h4>" + studentInfo.firstnameEn + " (" + studentInfo.nicknameEn + ") " + studentInfo.lastnameEn + "</h4>" +
            "<h4>" + "ID: " + ID + "</h4>" +
            "<h4>" + "ชั้น: " + (studentInfo.grade > 6 ? 'ม.' + (studentInfo.grade - 6) : 'ป.' + studentInfo.grade) + "</h4>" +
            "<h4><span class='fa fa-phone'></span> " + studentInfo.phone + "</h4>" +
            "<h4><span class='fa fa-envelope'></span> " + studentInfo.email + "</h4>" +
            "<h4>" + "สถานะ: " + str + "</h4>"
        );
    } else {
        $("#studentProfileContent").append(
            "<h6>" + studentInfo.firstname + " (" + studentInfo.nickname + ") " + studentInfo.lastname + "</h6>" +
            "<h6>" + studentInfo.firstnameEn + " (" + studentInfo.nicknameEn + ") " + studentInfo.lastnameEn + "</h6>" +
            "<h6>" + "ID: " + ID + "</h6>" +
            "<h6>" + "ชั้น: " + (studentInfo.grade > 6 ? 'ม.' + (studentInfo.grade - 6) : 'ป.' + studentInfo.grade) + "</h6>" +
            "<h6><span class='fa fa-phone'></span> " + studentInfo.phone + "</h6>" +
            "<h6><span class='fa fa-envelope'></span> " + studentInfo.email + "</h6>" +
            "<h6>" + "สถานะ: " + str + "</h6>"
        );
    }
}

// gen student time table func
async function genStudentTimeTable() {
    let qValue = $("#quarterSelect").val();
    if (parseInt(qValue.slice(4)) >= 10) {
        $("#mainTable").collapse('hide');
        $("#summerTable").collapse('show');
    } else {
        $("#summerTable").collapse('hide');
        $("#mainTable").collapse('show');
    }
    $(".selector").html("&nbsp;").removeClass("cr hb sk");
    let timeTable = await $.post("post/v1/studentTimeTable", { studentID: ID, year: qValue.slice(0, 4), quarter: qValue.slice(4) });
    log(timeTable)
    for (let i in timeTable.course) {
        let time = moment(timeTable.course[i].day);
        $(".btn" + time.day() + "-" + time.hour()).addClass("cr").html(timeTable.course[i].courseName + " - " + timeTable.course[i].tutorName);
    }
    for (let i in timeTable.hybrid) {
        let time = moment(timeTable.hybrid[i].day);
        $(".btn" + time.day() + "-" + time.hour()).addClass("hb").html("FHB:" + timeTable.hybrid[i].subject);
    }
    for (let i in timeTable.skill) {
        let time = moment(timeTable.skill[i].day);
        switch (time.hour()) {
            case 8:
            case 9:
                $(".btn" + time.day() + "-8").addClass("sk").html("SK:" + timeTable.skill[i].subject + " - " + time.format("HH:mm"));
                break;
            case 10:
            case 11:
                $(".btn" + time.day() + "-10").addClass("sk").html("SK:" + timeTable.skill[i].subject + " - " + time.format("HH:mm"));
                break;
            case 13:
            case 14:
                $(".btn" + time.day() + "-13").addClass("sk").html("SK:" + timeTable.skill[i].subject + " - " + time.format("HH:mm"));
                break;
            case 15:
            case 16:
                $(".btn" + time.day() + "-15").addClass("sk").html("SK:" + timeTable.skill[i].subject + " - " + time.format("HH:mm"));
                break;
            default:
                $(".btn" + time.day() + "-" + time.hour()).addClass("sk").html("SK:" + timeTable.skill[i].subject + " - " + time.format("HH:mm"));
                break;
        }
    }
}

// upload image function
function uploadImg() {
    let imgUrl = '';
    let ufile = $('#file-img');
    let ext = ufile.val().split('.').pop().toLowerCase();
    if ($.inArray(ext, ['png', 'jpg', 'jpeg']) === -1) {
        alert('กรุณาอัพไฟล์ .jpg, .jpeg หรือ .png เท่านั้น');
    } else {
        let files = ufile.get(0).files;
        let formData = new FormData();
        let file = files[0];
        formData.append('file[]', file, file.name);
        imgUrl = 'post/updateProfilePicture';
        formData.append('userID', ID);
        $.ajax({
            url: imgUrl,
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