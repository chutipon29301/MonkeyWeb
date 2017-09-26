const dayOfWeek = ["btn-sun", "btn-mon", "btn-tue", "btn-wed", "btn-thu", "btn-fri", "btn-sat"];
$(document).ready(function () {
    let cookie = getCookieDict();
    let ID = cookie.monkeyWebUser;
    showProfilePic(ID);
    $.post("post/listQuarter", { status: "public" }, function (q) {
        for (let i = 0; i < q.quarter.length; i++) {
            if (q.quarter[i].quarter === quarter) {
                $("#qList").prepend("<option>" + q.quarter[i].name + " - " + q.quarter[i].quarter + "</option>")
            } else {
                $("#qList").append("<option>" + q.quarter[i].name + " - " + q.quarter[i].quarter + "</option>")
            }
        }
        fillData(ID);
        if ($("#qList").val().slice($("#qList").val().indexOf("-") + 2) == summerQuarter) {
            $("#crTable").collapse("hide");
            $("#smTable").collapse("show");
        } else {
            $("#crTable").collapse("show");
            $("#smTable").collapse("hide");
        }
    })
    // func when change Q
    $("#qList").change(function () {
        fillData(ID);
        if ($("#qList").val().slice($("#qList").val().indexOf("-") + 2) == summerQuarter) {
            $("#crTable").collapse("hide");
            $("#smTable").collapse("show");
        } else {
            $("#crTable").collapse("show");
            $("#smTable").collapse("hide");
        }
    })
    // func when click on profile pic
    $(".profilePic").click(function () {
        $("#profileModal").modal();
    })
});
// func for fill student profile
function fillData(ID) {
    $.post("post/studentProfile", { studentID: ID }, function (profile) {
        // log(profile)
        $("#id").html(ID);
        $("#name").html(profile.firstname + " (" + profile.nickname + ") " + profile.lastname);
        $("#nameE").html(profile.firstnameEn + " (" + profile.nicknameEn + ") " + profile.lastnameEn);
        $("#grade").html(profile.grade > 6 ? "ม." + (profile.grade - 6) : "ป." + profile.grade);
        $("#parentTel").html(profile.phoneParent);
        $("#studentTel").html(profile.phone);
        $("#email").html(profile.email);
        let noStatus = true;
        if (profile.quarter.length > 0) {
            for (let i = 0; i < profile.quarter.length; i++) {
                if (profile.quarter[i].quarter == $("#qList").val().slice($("#qList").val().indexOf("-") + 2)) {
                    $("#status").html(profile.quarter[i].registrationState);
                    noStatus = false;
                }
            }
        }
        if (noStatus) {
            $("#status").html("ยังไม่ได้ลงทะเบียน")
        }
        $(".btn-default").removeClass("hb cr sk").html("&nbsp;");
        fillTableCr(profile.courseID, 0);
        if ($("#qList").val().slice($("#qList").val().indexOf("-") + 2) != summerQuarter && $("#qList").val().slice($("#qList").val().indexOf("-") + 2) != 3) {
            fillTableFhb(ID);
            fillTableSk(ID);
        }
    })
}
// func for show picture
function showProfilePic(ID) {
    let picId = ID;
    $.post("post/getConfig").then((config) => {
        // log(config)
        let path = config.profilePicturePath.slice(config.profilePicturePath.search("MonkeyWebData") + 14) + picId;
        $.get(path + ".jpg").done(function () {
            $('.profilePic').attr("src", path + ".jpg");
        }).fail(function () {
            $.get(path + ".jpeg").done(function () {
                $('.profilePic').attr("src", path + ".jpeg");
            }).fail(function () {
                $.get(path + ".png").done(function () {
                    $('.profilePic').attr("src", path + ".png");
                }).fail(function () {
                    log("can't find profile picture")
                })
            })
        })
    });
}
// func for fill table
function fillTableCr(cr, index) {
    // log("im herreeeeeee");
    if (index < cr.length) {
        $.post("post/courseInfo", { courseID: cr[index] }, function (data) {
            if (data.quarter == $("#qList").val().slice($("#qList").val().indexOf("-") + 2)) {
                // log(data);
                let time = moment(data.day).hour();
                // log(time);
                let dow = moment(data.day).day();
                // log(dayOfWeek[dow]);
                $.post("post/name", { userID: data.tutor[0] }, function (name) {
                    if (name.nicknameEn !== "Hybrid") {
                        $("." + dayOfWeek[dow] + "-" + time).html(data.courseName + " (" + name.nicknameEn + ")").addClass("cr")
                    } else {
                        $("." + dayOfWeek[dow] + "-" + time).html(data.courseName + " (HB)").addClass("cr")
                    }
                    fillTableCr(cr, index + 1);
                })
            }
            fillTableCr(cr, index + 1);
        })
    }
}
function fillTableFhb(ID) {
    let currentQ = $("#qList").val().slice($("#qList").val().indexOf("-") + 2);
    // log(currentQ)
    $.post("post/v1/listStudentHybrid", { year: year, quarter: currentQ, studentID: ID }, function (fhb) {
        // log(fhb)
        for (let i = 0; i < fhb.length; i++) {
            let time = moment(fhb[i].day).hour();
            let dow = moment(fhb[i].day).day();
            $("." + dayOfWeek[dow] + "-" + time).html("FHB: " + fhb[i].subject).addClass("hb")
        }
    })
}
function fillTableSk(ID) {
    let currentQ = $("#qList").val().slice($("#qList").val().indexOf("-") + 2);
    $.post("post/v1/listStudentSkill", { year: year, quarter: currentQ, studentID: ID }, function (sk) {
        log(sk)
        // log(moment(sk[0].day).format("DD/MM HH:mm"))
        for (let i = 0; i < sk.length; i++) {
            let time = moment(sk[i].day).hour();
            let dow = moment(sk[i].day).day();
            // log(skillTime(time))
            $("." + dayOfWeek[dow] + "-" + skillTime(time)).html("SKILL: " + sk[i].subject + " (" + moment(sk[i].day).format("HH:mm") + ")").addClass("sk")
        }
    })
}
function skillTime(time) {
    switch (time) {
        case 9:
            return 8;
            break;
        case 11:
            return 10;
            break;
        case 14:
            return 13;
            break;
        case 16:
            return 15;
            break;
        default:
            return time;
    }
}
// func for upload profile picture
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
        formData.append('file', files[0], files[0].name);
        formData.append('userID', ID);
        $.ajax({
            url: 'post/updateProfilePicture',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                $('#profileModal').modal('hide');
                location.reload();
            }
        });
    }
}