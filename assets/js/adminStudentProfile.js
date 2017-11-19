$(document).ready(function () {
    if ($(document).width() > 767) {
        $("#statusSidebar").addClass("position-fixed");
    }
    let cookie = getCookieDict();
    let ID = cookie.monkeyWebAdminAllstudentSelectedUser;
    loadProfileImg(ID);
    genQuarterSelect();
    // add event when change quarter
    $("#quarterSelect").change(function () {
        loadRecieptImg(ID);
        genStudentData();
    });
});
async function loadProfileImg(ID) {
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
    let cookie = getCookieDict();
    let ID = cookie.monkeyWebAdminAllstudentSelectedUser;
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
    let cookie = getCookieDict();
    let studentData = await studentProfile(cookie.monkeyWebAdminAllstudentSelectedUser);
    log(studentData);
    $("#studentProfileContent").empty();
    $("#studentProfileContent").append(
        "<h4>" + studentData.firstname + " (" + studentData.nickname + ") " + studentData.lastname + "</h4>" +
        "<h4>" + studentData.firstnameEn + " (" + studentData.nicknameEn + ") " + studentData.lastnameEn + "</h4>" +
        "<h4><span class='fa fa-graduation-cap'></span> " + (studentData.grade > 6 ? 'S' + (studentData.grade - 6) : 'P' + studentData.grade) +
        " <span class='fa fa-id-card-o'></span> " + cookie.monkeyWebAdminAllstudentSelectedUser + "</h4>" +
        "<h5>Level: " + studentData.level + "</h5>" +
        "<h5><span class='fa fa-envelope-o'></span> " + studentData.email + "</h5>" +
        "<h5><span class='fa fa-phone'></span> Student: " + studentData.phone + "</h5>" +
        "<h5><span class='fa fa-phone'></span> Parent: " + studentData.phoneParent + "</h5>"
    );
    genStatusPanel(studentData.status, studentData.quarter);
    genStudentTable(cookie.monkeyWebAdminAllstudentSelectedUser, studentData.courseID);
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
        let data = await studentProfile(cookie.monkeyWebAdminAllstudentSelectedUser);
        quarter = data.quarter;
        genStatusPanel(status, quarter);
    }
}
async function genStudentTable(ID, cr) {
    let str = $("#quarterSelect").val();
    $(".selector").html("ADD SUBJ").removeClass("cr");
    if (parseInt(str.slice(5)) > 4) {
        $("#mainTable").collapse("hide");
        $("#summerTable").collapse("show");
    } else {
        $("#mainTable").collapse("show");
        $("#summerTable").collapse("hide");
    }
    let promise1 = []; // for crInfo
    for (let i in cr) {
        promise1.push(courseInfo(cr[i]));
    }
    let promise2 = listStudentHybrid(str.slice(0, 4), str.slice(5), ID); // for hbInfo
    let promise3 = listStudentSkill(str.slice(0, 4), str.slice(5), ID); // for skInfo
    let [crInfo, hbInfo, skInfo] = await Promise.all([Promise.all(promise1), promise2, promise3]);
    log(crInfo);
    log(hbInfo);
    log(skInfo);
    for (let i in crInfo) {
        if (crInfo[i].year == str.slice(0, 4) && crInfo[i].quarter == str.slice(5)) {
            let time = moment(crInfo[i].day);
            $(".btn" + time.day() + time.hour()).html("CR:" + crInfo[i].courseName).addClass("cr");
        }
    }
    for (let i in hbInfo) {
        let time = moment(hbInfo[i].day);
        $(".btn" + time.day() + time.hour()).html("FHB:" + hbInfo[i].subject).addClass("hb");
    }
    for (let i in skInfo) {
        let time = moment(skInfo[i].day);
        if (time.hour() == 9) time.hour(8);
        if (time.hour() == 11) time.hour(10);
        if (time.hour() == 14) time.hour(13);
        $(".btn" + time.day() + time.hour()).html("SK:" + skInfo[i].subject).addClass("sk");
    }
}
// change status function
function changeStudentStatus(status) {
    let cookie = getCookieDict();
    $.post("post/changeStatus", { userID: cookie.monkeyWebAdminAllstudentSelectedUser, status: status }).then(() => {
        log("OK:Change student status complete");
        genStatusPanel(status);
    });
}
// change state function
function changeStudentState(state) {
    let cookie = getCookieDict();
    let str = cookie.courseQuarter;
    changeRegistrationState(cookie.monkeyWebAdminAllstudentSelectedUser, state, { year: str.slice(0, 4), quarter: str.slice(5) }).then(() => {
        log("OK:Change student state complete");
        genStatusPanel('active');
    });
}