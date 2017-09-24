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
    })
    // func when change Q
    $("#qList").change(function () {
        fillData(ID);
    })
});
// func for fill student profile
function fillData(ID) {
    $.post("post/studentProfile", { studentID: ID }, function (profile) {
        log(profile)
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
        fillTable(profile.courseID, 0);
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
function fillTable(cr, index) {
    log("im herreeeeeee");
    if (index < cr.length) {
        $.post("post/courseInfo", { courseID: cr[index] }, function (data) {
            if (data.quarter == $("#qList").val().slice($("#qList").val().indexOf("-") + 2)) {
                log(data);
                let time = moment(data.day).hour();
                log(time);
                let dow = moment(data.day).day();
                log(dayOfWeek[dow]);
                $.post("post/name", { userID: data.tutor[0] }, function (name) {
                    $("." + dayOfWeek[dow] + "-" + time).html("CR: " + data.courseName + " (" + name.nicknameEn + ")").addClass("cr")
                    fillTable(cr, index + 1);
                })
            }
        })
    }
}
// // const studentProf = (studentID) => $.post("post/studentProfile", {
// //     studentID: studentID
// // });
// const courseInf = (courseID) => $.post("post/courseInfo", {
//     courseID: courseID
// });
// $(document).ready(function () {
//     // funntion for upload profilePic
//     $('.profilePic').click(function () {
//         $('#profileModal').modal();
//     });
//     let cookie = getCookieDict();
//     $('#id').html(cookie.monkeyWebUser);
//     showProfilePic(cookie.monkeyWebUser);
//     genTable();
//     studentProfile(parseInt(cookie.monkeyWebUser)).then((data) => {
//         let temp;
//         let time;
//         let status = $('#statusCr');
//         status.html(data.quarter[0].registrationState);
//         (data.quarter[1] !== undefined) ? $("#statusSm").html(data.quarter[1].registrationState) : $("#statusSm").html("unregistered");
//         $('#name').html(data.firstname + ' (' + data.nickname + ') ' + data.lastname);
//         $('#nameE').html(data.firstnameEn + ' (' + data.nicknameEn + ') ' + data.lastnameEn);
//         $('#studentTel').html(data.phone);
//         $('#parentTel').html(data.phoneParent);
//         $('#email').html(data.email);
//         $('#grade').html(() => {
//             if (parseInt(data.grade) > 6) {
//                 return 'มัธยม ' + (parseInt(data.grade) - 6)
//             }
//             else {
//                 return 'ประถม ' + data.grade
//             }
//         });
//         for (let i in data.hybridDay) {
//             let hybrid = document.getElementsByClassName('btn-' + (numtoDay((new Date(parseInt(data.hybridDay[i].day))).getDay())) + ' ' + (new Date(parseInt(data.hybridDay[i].day))).getHours() + '.1');
//             for (let j = 0; j < hybrid.length; j++) {
//                 hybrid[j].className = hybrid[j].className + ' hb';
//                 hybrid[j].innerHTML = '<strong>FHB :</strong>' + '<br>' + fullHBname(data.hybridDay[i].subject)
//             }
//         }
//         for (let i in data.skillDay) {
//             switch ((new Date(parseInt(data.skillDay[i].day))).getHours()) {
//                 case 9:
//                     time = '8';
//                     break;
//                 case 10:
//                 case 11:
//                     time = '10';
//                     break;
//                 case 13:
//                 case 14:
//                     time = '13';
//                     break;
//                 case 15:
//                     time = '15';
//                     break;
//                 default:
//                     break;
//             }
//             let skill = document.getElementsByClassName('btn-' + (numtoDay((new Date(parseInt(data.skillDay[i].day))).getDay())) + ' ' + time + '.1');
//             for (let j = 0; j < skill.length; j++) {
//                 if (!(skill[j].className.indexOf('sk') !== -1)) {
//                     skill[j].className = skill[j].className + ' sk';
//                     if ((new Date(parseInt(data.skillDay[i].day))).getMinutes() === 0) {
//                         temp = (new Date(parseInt(data.skillDay[i].day))).getHours() + '.00 น.';
//                     }
//                     else {
//                         temp = (new Date(parseInt(data.skillDay[i].day))).getHours() + '.30 น.';
//                     }
//                     skill[j].innerHTML = '<strong>SKILL :</strong>' + '<br>' + temp
//                 }
//                 else {
//                     if (skill[j].innerHTML.split('<br>')[1].split(' ')[0] <= (new Date(parseInt(data.skillDay[i].day))).getHours() + '.' + (new Date(parseInt(data.skillDay[i].day))).getMinutes() / 100) {
//                         temp = skill[j].innerHTML.split('<br>')[1].split(' ')[0] + '0 น.';
//                     }
//                     else {
//                         temp = (new Date(parseInt(data.skillDay[i].day))).getHours() + '.' + parseInt((new Date(parseInt(data.skillDay[i].day))).getMinutes() / 100) + '0 น.';
//                     }
//                     skill[j].innerHTML = '<strong>SKILL :</strong>' + '<br>' + temp
//                 }
//             }
//         }
//         for (let i in data.courseID) {
//             //noinspection JSUnfilteredForInLoop
//             courseInf(data.courseID[i]).then((cr) => {
//                 log(cr)
//                 let course = document.getElementsByClassName('btn-' + (numtoDay((new Date(parseInt(cr.day))).getDay())) + ' ' + (new Date(parseInt(cr.day))).getHours() + '.1');
//                 for (let j = 0; j < course.length; j++) {
//                     course[j].className = course[j].className + ' cr';
//                     course[j].innerHTML = '<strong>CR :</strong>' + '<br>' + cr.courseName
//                 }
//             })
//         }
//     });
//     // const sDate = new Date("July 1, 2017 0:00:00");
//     const sDate = moment("07-01-2017", "MM-DD-YYYY")
//     document.getElementById("startCr").innerHTML = sDate.format("DD MMM YYYY");
//     let nDate = new Date().getTime();
//     let diff = Math.round((nDate - sDate) / 604800000);
//     if (diff <= 0) {
//         document.getElementById("nowCr").innerHTML = "ยังไม่เริ่ม CR60Q3";
//     } else document.getElementById("nowCr").innerHTML = "ครั้งที่ " + diff + "/14";
//     // const eDate = new Date("October 1, 2017 23:59:59");
//     const eDate = moment("10-01-2017", "MM-DD-YYYY");
//     document.getElementById("endCr").innerHTML = eDate.format("DD MMM YYYY");
// });

// function genTable() {
//     let temp = document.getElementsByClassName('disabled');
//     for (let i = 0; i < temp.length; i++) {
//         let name = '';
//         for (let j = 0; j < 6; j++) {
//             name += temp[i].className.split(' ')[j] + ' ';
//         }
//         temp[i].className = name;
//         temp[i].innerHTML = '&nbsp;' + '<br>' + '&nbsp;';
//     }
// }
// function showProfilePic(id) {
//     //noinspection ES6ModulesDependencies
//     $.post("post/getConfig").then((config) => {
//         //noinspection ES6ModulesDependencies
//         $.get(config.profilePicturePath.slice(config.receiptPath.search("MonkeyWebData") + 14) + id + '.jpg', function (data) {
//             $('.profilePic').attr("src", config.profilePicturePath.slice(config.receiptPath.search("MonkeyWebData") + 14) + id + '.jpg');
//         }).fail(function (data) {
//             $.get(config.profilePicturePath.slice(config.receiptPath.search("MonkeyWebData") + 14) + id + '.jpeg', function (data) {
//                 $('.profilePic').attr("src", config.profilePicturePath.slice(config.receiptPath.search("MonkeyWebData") + 14) + id + '.jpeg');
//             }).fail(function (data) {
//                 $.get(config.profilePicturePath.slice(config.receiptPath.search("MonkeyWebData") + 14) + id + '.png', function (data) {
//                     $('.profilePic').attr("src", config.profilePicturePath.slice(config.receiptPath.search("MonkeyWebData") + 14) + id + '.png');
//                 });
//             })
//         })
//     });
// }
// function upPic() {
//     let cookie = getCookieDict();
//     //noinspection JSUnresolvedVariable
//     let ID = cookie.monkeyWebUser;
//     let ufile = $('#file-1');
//     let ext = ufile.val().split('.').pop().toLowerCase();
//     if ($.inArray(ext, ['png', 'jpg', 'jpeg']) === -1) {
//         alert('กรุณาอัพไฟล์ .jpg, .jpeg หรือ .png เท่านั้น');
//     } else {
//         let files = ufile.get(0).files;
//         let formData = new FormData();
//         formData.append('file', files[0], files[0].name);
//         formData.append('userID', ID);
//         //noinspection JSUnusedLocalSymbols
//         $.ajax({
//             url: 'post/updateProfilePicture',
//             type: 'POST',
//             data: formData,
//             processData: false,
//             contentType: false,
//             success: function (data) {
//                 showProfilePic(ID);
//                 $('#profileModal').modal('hide');
//             }
//         });
//     }

// }