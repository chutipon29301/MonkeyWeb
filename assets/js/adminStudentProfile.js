if ($(document).width() > 767) {
    $("#statusSidebar").addClass("position-fixed");
}

let cookie = getCookieDict();
let ID = cookie.monkeyWebAdminAllstudentSelectedUser;
loadProfileImg();
genQuarterSelect();

// add event when change quarter
$("#quarterSelect").change(function () {
    loadRecieptImg();
    genStudentData();
});

// add event when click butt in table
$(".selector").click(function () {
    if ($(this).html() !== "ADD SUBJ") {
        if ($(this).hasClass("cr")) removeCourse(this.id);
        else if ($(this).hasClass("hb")) removeHybrid(this.id);
        else if ($(this).hasClass("sk")) removeSkill(this.id);
    } else {
        addTimeTable(this.className);
    }
});

// add event when click addSubjButt
$("#addSubjButt").click(function () {
    addStudentTimeTable();
});

// add event when click Img for upload pic
let uploadImgType = 0;
$("#profileImg").click(function () {
    uploadImgType = 0;
    $("#uploadPicModal").modal('show');
});
$("#recieptImg").click(function () {
    uploadImgType = 1;
    $("#uploadPicModal").modal('show');
});
$("#uploadPicButt").click(function () {
    if (confirm("ยืนยันการ upload?")) {
        uploadImg(uploadImgType);
    }
});

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

async function loadRecieptImg() {
    let config = await getConfig();
    let quarterName = $("#quarterSelect option:selected").text();
    let path = config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + quarterName + "/" + ID;
    $.get(path + ".jpg").done(() => {
        $("#recieptImg").attr("src", path + ".jpg");
    }).fail(() => {
        $.get(path + ".png").done(() => {
            $("#recieptImg").attr("src", path + ".png");
        }).fail(() => {
            $.get(path + ".jpeg").done(() => {
                $("#recieptImg").attr("src", path + ".jpeg");
            }).fail(() => {
                log("can't find picture");
            });
        });
    });
}

async function genQuarterSelect() {
    let quarter = await listQuarter("private");
    for (let i in quarter.quarter) {
        $("#quarterSelect").append(
            "<option value=" + quarter.quarter[i].year + "-" + quarter.quarter[i].quarter + ">" + quarter.quarter[i].name + "</option>"
        );
    }
    let cookie = getCookieDict();
    if (cookie.courseQuarter === undefined) {
        let config = await getConfig();
        let str = config.defaultQuarter.quarter.year + "-" + config.defaultQuarter.quarter.quarter;
        $("#quarterSelect").val(str);
        writeCookie("courseQuarter", str);
    } else {
        $("#quarterSelect").val(cookie.courseQuarter);
    }
    genStudentData();
    loadRecieptImg();
}

async function genStudentData() {
    let str = $("#quarterSelect").val();
    writeCookie("courseQuarter", str);
    let studentData = await studentProfile(ID);
    $("#studentProfileContent").empty();
    $("#studentProfileContent").append(
        "<h4>" + studentData.firstname + " (" + studentData.nickname + ") " + studentData.lastname + "</h4>" +
        "<h4>" + studentData.firstnameEn + " (" + studentData.nicknameEn + ") " + studentData.lastnameEn + "</h4>" +
        "<h4><span class='fa fa-graduation-cap'></span> " + (studentData.grade > 6 ? 'S' + (studentData.grade - 6) : 'P' + studentData.grade) +
        " <span class='fa fa-id-card-o'></span> " + ID + "</h4>" +
        "<h5>Level: " + studentData.level + "</h5>" +
        "<h5><span class='fa fa-envelope-o'></span> " + studentData.email + "</h5>" +
        "<h5><span class='fa fa-phone'></span> Student: " + studentData.phone + "</h5>" +
        "<h5><span class='fa fa-phone'></span> Parent: " + studentData.phoneParent + "</h5>"
    );
    genStatusPanel(studentData.status, studentData.quarter);
    genStudentTable();
}

async function genStatusPanel(status, quarter) {
    let cookie = getCookieDict();
    let $statusButt = $("#statusButton");
    let $statusDropdown = $("#statusDropdown");
    let $statusSubButton = $("#statusSubButton");
    $statusButt.removeClass("btn-danger btn-success btn-secondary btn-dark");
    $statusDropdown.empty();
    $statusSubButton.empty();
    switch (status) {
        case "active":
            $statusButt.html("ACTIVE").addClass("btn-success");
            $statusSubButton.append(
                "<button class='col-12 btn btn-light subButt-unregistered' onclick=\"changeStudentState(\'unregistered\')\">UNREGISTER</button>" +
                "<button class='col-12 btn btn-light subButt-untransferred' onclick=\"changeStudentState(\'untransferred\')\">UNTRANSFER</button>" +
                "<button class='col-12 btn btn-light subButt-rejected' onclick=\"changeStudentState(\'rejected\')\">REJECT</button>" +
                "<button class='col-12 btn btn-light subButt-transferred' onclick=\"changeStudentState(\'transferred\')\">TRANSFER</button>" +
                "<button class='col-12 btn btn-light subButt-approved' onclick=\"changeStudentState(\'approved\')\">APPROVE</button>" +
                "<button class='col-12 btn btn-light subButt-pending' onclick=\"changeStudentState(\'pending\')\">PENDING</button>" +
                "<button class='col-12 btn btn-light subButt-finished' onclick=\"changeStudentState(\'finished\')\">FINISH</button>"
            );
            break;
        case "inactive":
            $statusButt.html("INACTIVE").addClass("btn-secondary");
            $statusSubButton.append(
                "<button class='col-12 btn btn-light'>Please login and fill profile data</button>"
            );
            break;
        case "dropped":
            $statusButt.html("DROP").addClass("btn-danger");
            $statusSubButton.append(
                "<button class='col-12 btn btn-danger'>PENDING</button>" +
                "<button class='col-12 btn btn-light' onclick=\"changeStudentStatus(\'active\')\">EDITED</button>" +
                "<button class='col-12 btn btn-light' onclick=\"changeStudentStatus(\'terminated\')\">TERMINATE</button>"
            );
            break;
        case "terminated":
            $statusButt.html("TERMINATE").addClass("btn-dark");
            $statusSubButton.append(
                "<button class='col-12 btn btn-light'>Please active again for regis</button>"
            );
            break;
        default:
            break;
    }
    $statusDropdown.append(
        "<a class='dropdown-item' onclick=\"changeStudentStatus(\'active\')\">ACTIVE</a>" +
        "<a class='dropdown-item' onclick=\"changeStudentStatus(\'dropped\')\">DROP</a>"
        // "<a class='dropdown-item' onclick=\"changeStudentStatus(\'terminated\')\">TERMINATE</a>"
    );
    let str = cookie.courseQuarter;
    if (quarter != undefined) {
        let iden = true;
        for (let i in quarter) {
            if (quarter[i].year == str.slice(0, 4) && quarter[i].quarter == str.slice(5)) {
                iden = false;
                $(".subButt-" + quarter[i].registrationState).removeClass("btn-light").addClass("btn-success");
            }
        }
        if (iden) {
            $(".subButt-unregistered").removeClass("btn-light").addClass("btn-success");
        }
    } else {
        let data = await studentProfile(ID);
        quarter = data.quarter;
        genStatusPanel(status, quarter);
    }
}

async function genStudentTable() {
    let str = $("#quarterSelect").val();
    $(".selector").html("ADD SUBJ").removeClass("cr hb sk");
    if (parseInt(str.slice(5)) > 4) {
        $("#mainTable").collapse("hide");
        $("#summerTable").collapse("show");
    } else {
        $("#mainTable").collapse("show");
        $("#summerTable").collapse("hide");
    }
    let timeTable = await $.post("post/v1/studentTimeTable", { studentID: ID, year: str.slice(0, 4), quarter: str.slice(5) });
    for (let i in timeTable.course) {
        let time = moment(timeTable.course[i].day);
        $(".btn" + time.day() + time.hour()).html("CR:" + timeTable.course[i].courseName).addClass("cr").attr("id", timeTable.course[i].courseID);
    }
    for (let i in timeTable.hybrid) {
        let time = moment(timeTable.hybrid[i].day);
        $(".btn" + time.day() + time.hour()).html("FHB:" + timeTable.hybrid[i].subject).addClass("hb").attr("id", timeTable.hybrid[i].hybridID);
    }
    for (let i in timeTable.skill) {
        let time = moment(timeTable.skill[i].day);
        if (time.hour() == 9) time.hour(8);
        if (time.hour() == 11) time.hour(10);
        if (time.hour() == 14) time.hour(13);
        $(".btn" + time.day() + time.hour()).html("SKILL:" + timeTable.skill[i].subject).addClass("sk").attr("id", timeTable.skill[i].skillID);
    }
}

// change status function
function changeStudentStatus(status) {
    $.post("post/changeStatus", { userID: ID, status: status }).then(() => {
        log("OK:Change student status complete");
        genStatusPanel(status);
    });
}

// change state function
function changeStudentState(state) {
    let cookie = getCookieDict();
    let str = cookie.courseQuarter;
    changeRegistrationState(ID, state, { year: str.slice(0, 4), quarter: str.slice(5) }).then(() => {
        log("OK:Change student state complete");
        genStatusPanel('active');
    });
}

// remove timeTable function
function removeCourse(crID) {
    if (confirm("ต้องการลบคอร์สนี้?")) {
        removeStudentCourse(ID, [crID]).then(() => {
            log("finish to remove cr " + crID);
            location.reload();
        })
    }
}
function removeHybrid(hbID) {
    if (confirm("ต้องการลบ FHB นี้?")) {
        removeHybridStudent(ID, hbID).then(() => {
            log("finish to remove fhb " + hbID);
            location.reload();
        })
    }
}
function removeSkill(skID) {
    if (confirm("ต้องการลบ skill นี้?")) {
        log("rm sk" + skID)
        removeSkillStudent(ID, skID).then(() => {
            log("finish to remove skill " + skID);
            location.reload();
        })
    }
}

// add timeTable function
async function addTimeTable(idenTime) {
    let str = $("#quarterSelect").val();
    let allSubj = await $.post("post/v1/listSubjectInQuarter", { year: str.slice(0, 4), quarter: str.slice(5) })
    $subjSelect = $("#subjSelect");
    $subjSelect.empty();
    for (let i in allSubj.hybrid) {
        let time = moment(allSubj.hybrid[i].day);
        if (idenTime.indexOf("btn" + time.day() + '' + time.hour()) >= 0) {
            $subjSelect.append("<option value=" + allSubj.hybrid[i].hybridID + ">FHB:M</option>");
            $subjSelect.append("<option value=" + allSubj.hybrid[i].hybridID + ">FHB:P</option>");
        }
    }
    for (let i in allSubj.course) {
        let time = moment(allSubj.course[i].day);
        if (idenTime.indexOf("btn" + time.day() + '' + time.hour()) >= 0) {
            $subjSelect.append("<option value=" + allSubj.course[i].courseID + ">" + allSubj.course[i].courseName + " - " + allSubj.course[i].tutorName + "</option>");
        }
    }
    for (let i in allSubj.skill) {
        let time = moment(allSubj.skill[i].day);
        let time2 = moment(allSubj.skill[i].day);
        if (time2.hour() == 9) time2.hour(8);
        if (time2.hour() == 11) time2.hour(10);
        if (time2.hour() == 14) time2.hour(13);
        if (idenTime.indexOf("btn" + time2.day() + '' + time2.hour()) >= 0) {
            $subjSelect.append("<option value=" + allSubj.skill[i].skillID + ">SKILL:M - " + time.format("HH:mm") + "</option>");
            $subjSelect.append("<option value=" + allSubj.skill[i].skillID + ">SKILL:E - " + time.format("HH:mm") + "</option>");
            $subjSelect.append("<option value=" + allSubj.skill[i].skillID + ">SKILL:ME - " + time.format("HH:mm") + "</option>");
        }
    }
    $("#addSubjModal").modal('show');
}
function addStudentTimeTable() {
    let subjID = $("#subjSelect").val();
    let subjSelectText = $("#subjSelect option:selected").text();
    if (subjSelectText.slice(0, 3) === "FHB") {
        if (confirm("ต้องการเพิ่ม " + subjSelectText)) {
            addHybridStudent(subjID, ID, subjSelectText.slice(4)).then(() => {
                log("finish to add " + subjSelectText);
                location.reload();
            });
        }
    } else if (subjSelectText.slice(0, 3) === "SKI") {
        if (confirm("ต้องการเพิ่ม " + subjSelectText)) {
            addSkillStudent(subjID, ID, subjSelectText.slice(6, subjSelectText.indexOf("-") - 1)).then(() => {
                log("finish to add " + subjSelectText);
                location.reload();
            })
        }
    } else {
        if (confirm("ต้องการเพิ่ม " + subjSelectText)) {
            addStudentCourse(ID, [subjID]).then(() => {
                log("finish to add CR:" + subjSelectText);
                location.reload();
            });
        }
    }
}

// upload image function
function uploadImg(type) {
    let str = $("#quarterSelect").val();
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
        if (type == 0) {
            imgUrl = 'post/updateProfilePicture';
            formData.append('userID', ID);
        } else if (type == 1) {
            imgUrl = 'post/submitReceipt'
            formData.append('studentID', ID);
            formData.append('year', str.slice(0, 4));
            formData.append('quarter', str.slice(5));
        }
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