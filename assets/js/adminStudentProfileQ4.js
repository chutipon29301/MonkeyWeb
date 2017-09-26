/**
* Get short name of day
* @param date int day 0 - 6
* @returns {string} name of day
*/
var studentForSearch = [];
const getDateName = (date) => {
    let dateName = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return dateName[date];
};

/**
 * Convert number grade to string grade
 * @param grade in form for number
 * @returns {string} grade letter
 */
const getLetterGrade = (grade) => {
    if (grade <= 6) {
        return "P" + grade;
    } else {
        return "S" + (grade - 6);
    }
};

function getStudentProfile() {
    let cookie = getCookieDict();
    let studentID = cookie.monkeyWebAdminAllstudentSelectedUser;
    document.getElementById("studentID").innerHTML = "ID: " + studentID;

    studentProfile(studentID).then(data => {
        log("[getStudentProfile()] : post/studentProfile => ");
        log(data);
        document.getElementById("studentName").innerHTML = data.firstname + " (" + data.nickname + ") " + data.lastname;
        document.getElementById("studentNameEng").innerHTML = data.firstnameEn + " (" + data.nicknameEn + ") " + data.lastnameEn;
        document.getElementById("studentLevel").innerHTML = "Grade: " + getLetterGrade(data.grade);
        document.getElementById("email").innerHTML = "e-mail: " + data.email;
        document.getElementById("phone").innerHTML = "phone: " + data.phone;
        document.getElementById("studentLevel").innerHTML = "Level: " + data.level;
        showProfilePic();
        showReceipt();
        for (let i = 0; i < data.quarter.length; i++) {
            log(data.quarter[i]);
            if (data.quarter[i].year === 2017 && data.quarter[i].quarter === 4) {
                courseStage = data.quarter[i].registrationState;
            }
        }

        if (courseStage !== undefined) {
            document.getElementById("studentStateCr").innerHTML = "STAGE CR: " + courseStage;
            switch (courseStage) {
                case "approved":
                    document.getElementById("approveBtn").className += " disabled";
                    break;
                case "rejected":
                    document.getElementById("rejectBtn").className += " disabled";
                    break;
                case "pending":
                    document.getElementById("approveBtn").className += " disabled";
                    document.getElementById("rejectBtn").className += " disabled";
                    document.getElementById("pendingBtn").className += " disabled";
                    break;
                case "finished":
                    document.getElementById("approveBtn").className += " disabled";
                    document.getElementById("rejectBtn").className += " disabled";
                    document.getElementById("finishedBtn").className += " disabled";
                    break;
                default:
                    break;
            }
        }

        document.getElementById("studentStatus").innerHTML = "STATUS: " + data.status;

        $.post("post/v1/studentTimeTable", {
            quarter: 4,
            year: 2017,
            studentID: studentID
        }).then(table => {
            console.log(table);
            for (let i = 0; i < table.course.length; i++) {
                document.getElementById(table.course[i].day).innerHTML = table.course[i].courseName + " -  " + table.course[i].tutorName
                document.getElementById(table.course[i].day).value = table.course[i].courseID
                document.getElementById(table.course[i].day).className = "btn btn-warning col-sm-12";
            }
            for (let i = 0; i < table.hybrid.length; i++) {
                let localTime = new Date(parseInt(table.hybrid[i].day));
                let serverTime = moment(0).day((localTime.getDay() === 0) ? 7 : localTime.getDay()).hour(localTime.getHours()).valueOf();
                document.getElementById(serverTime).innerHTML = "FHB : " + table.hybrid[i].subject;
                document.getElementById(serverTime).value = table.hybrid[i].hybridID
                document.getElementById(serverTime).className = "btn btn-primary col-sm-12";
            }
            for (let i = 0; i < table.skill.length; i++) {
                let localTime = new Date(parseInt(table.skill[i].day));
                let time = moment(0).day((localTime.getDay() === 0) ? 7 : localTime.getDay()).hour(localTime.getHours());
                let serverTime = time.valueOf();
                document.getElementById(serverTime).innerHTML = "SKILL : " + table.skill[i].subject;
                document.getElementById(serverTime).value = table.skill[i].skillID
                document.getElementById(serverTime).className = "btn btn-info col-sm-12";
            }
        });
    });
}

/**
 * Call when button in table is clicked
 * @param timeID get from id of button
 */
function addRemoveCourse(timeID) {
    let button = document.getElementById(timeID);
    if (button.innerHTML === "Add Course") {
        $.post("post/v1/listSubjectInQuarter", {
            quarter: 4,
            year: 2017,
            day: timeID
        }).then(data => {
            let select = document.getElementById("courseSelector");
            for (let i = 0; i < data.course.length; i++) {
                select.innerHTML += "<option id='" + data.course[i].courseID + "'>" + data.course[i].courseName + " - " + data.course[i].tutorName + "</option>";
            }
            for (let i = 0; i < data.hybrid.length; i++) {
                select.innerHTML += "<option id='" + data.hybrid[i].hybridID + "' value='M'>FHB : M</option>";
                select.innerHTML += "<option id='" + data.hybrid[i].hybridID + "' value='P'>FHB : P</option>";
            }
            for (let i = 0; i < data.skill.length; i++) {
                var skillTime = new Date(data.skill[i].day);
                select.innerHTML += "<option id='" + data.skill[i].skillID + "' value='M'>SKILL Math " + skillTime.getHours() + ":" + ((skillTime.getMinutes() === 0) ? "00" : skillTime.getMinutes()) + "</option>";
                select.innerHTML += "<option id='" + data.skill[i].skillID + "' value='E'>SKILL English " + skillTime.getHours() + ":" + ((skillTime.getMinutes() === 0) ? "00" : skillTime.getMinutes()) + "</option>";
                select.innerHTML += "<option id='" + data.skill[i].skillID + "' value='ME'>SKILL English and Math " + skillTime.getHours() + ":" + ((skillTime.getMinutes() === 0) ? "00" : skillTime.getMinutes()) + "</option>";
            }
            $("#addModal").modal();
        });
    } else {
        document.getElementById("confirmDelete").value = button.value;
        document.getElementById("courseName").innerHTML = button.innerHTML;
        document.getElementById("removeModal").value = timeID;
        $("#removeModal").modal();
    }
}

function removeCourse() {
    let cookie = getCookieDict();
    let studentID = cookie.monkeyWebAdminAllstudentSelectedUser;
    let button = document.getElementById("confirmDelete");
    let courseID = button.value;
    let courseName = document.getElementById("courseName").innerHTML;
    let time = parseInt(document.getElementById("removeModal").value);

    if (courseName.slice(0, 5) === "SKILL") {
        $.post("post/v1/removeSkillStudent", {
            studentID: studentID,
            skillID: courseID
        }).then(_ => {
            location.reload();
        });
    } else if (courseName.slice(0, 3) === "FHB") {
        $.post("post/v1/removeHybridStudent", {
            studentID: studentID,
            hybridID: courseID
        }).then(_ => {
            location.reload();
        });
    } else {
        removeStudentCourse(studentID, [courseID]).then((data) => {
            if (data.err) {
                log("[RemoveCourse()] : post/removeStudentCourse => " + data.err);
            } else {
                log("[RemoveCourse()] : post/removeStudentCourse => Success");
                location.reload();
            }
        });
    }
}

function addCourse() {
    let cookie = getCookieDict();
    let studentID = cookie.monkeyWebAdminAllstudentSelectedUser;
    let select = document.getElementById("courseSelector");
    let selectedOption = select.options[select.selectedIndex];
    let selectedInnerHtml = selectedOption.innerHTML;
    let selectedValue = selectedOption.value;
    let selectedID = selectedOption.id;
    console.log(selectedID);
    console.log(selectedValue);
    console.log(selectedInnerHtml);
    if (selectedInnerHtml.slice(0, 5) === "SKILL") {
        $.post("post/v1/addSkillStudent", {
            skillID: selectedID,
            subject: selectedValue,
            studentID: studentID
        }).then(data => {
            if (data.err) {
                log("[addCourse()] : post/v1/addSkillStudent => " + data.err);
            } else {
                log("[addCourse()] : post/v1/addSkillStudent => Success");
                location.reload();
            }
        });
    } else if (selectedInnerHtml.slice(0, 3) === "FHB") {
        $.post("post/v1/addHybridStudent", {
            hybridID: selectedID,
            subject: selectedValue,
            studentID: studentID
        }).then(data => {
            if (data.err) {
                log("[addCourse()] : post/v1/addHybridStudent => " + data.err);
            } else {
                log("[addCourse()] : post/v1/addHybridStudent => Success");
                location.reload();
            }
        });
    } else {
        let courseID = selectedOption.id;
        addStudentCourse(studentID, [courseID]).then((data) => {
            if (data.err) {
                log("[addCourse()] : post/addStudentCourse => " + data.err);
            } else {
                log("[addCourse()] : post/addStudentCourse => Success");
                location.reload();
            }
        });
    }
}

function setRegistrationState(registrationState, quarter) {
    let studentID = parseInt(document.getElementById("studentID").innerHTML.slice(4, document.getElementById("studentID").innerHTML.length));
    var quarterObject;
    switch (quarter) {
        case "quarter":
            quarterObject = {
                year: 2017,
                quarter: 4
            }
            break;
        default:
            break;
    }
    log(quarterObject);
    changeRegistrationState(studentID, registrationState, quarterObject).then((data) => {
        if (data.err) {
            log("[setRegistrationState()] : post/changeRegistrationState => " + data.err);
        } else {
            // if (quarter !== "summer") {
            //     if (registrationState === "finished" || registrationState === "pending") acceptReject(registrationState);
            //     log("[setRegistrationState()] : post/changeRegistrationState => Success");
            // } else if (quarter === "summer") {
            //     if (registrationState === "finished" || registrationState === "pending") acRjSummer(registrationState);
            //     log("[setRegistrationState()] : post/changeRegistrationState => Success");
            // }
        }
        location.reload();
    });
}
// func for show picture
function showProfilePic() {
    let picId = $("#studentID").html().slice(4);
    $.post("post/getConfig").then((config) => {
        // log(config)
        let path = config.profilePicturePath.slice(config.profilePicturePath.search("MonkeyWebData") + 14) + picId;
        $.get(path + ".jpg").done(function () {
            $('#profilePic').attr("src", path + ".jpg");
        }).fail(function () {
            $.get(path + ".jpeg").done(function () {
                $('#profilePic').attr("src", path + ".jpeg");
            }).fail(function () {
                $.get(path + ".png").done(function () {
                    $('#profilePic').attr("src", path + ".png");
                }).fail(function () {
                    log("can't find profile picture")
                })
            })
        })
    });
}
// func for show receipt
function showReceipt() {
    let picId = $("#studentID").html().slice(4);
    $.post("post/getConfig").then((config) => {
        // log(config)
        let path = config.receiptPath.slice(config.profilePicturePath.search("MonkeyWebData") + 14) + "CR60Q4/" + picId;
        log(path)
        $.get(path + ".jpg").done(function () {
            $('#imgTrans').attr("src", path + ".jpg");
        }).fail(function () {
            $.get(path + ".jpeg").done(function () {
                $('#imgTrans').attr("src", path + ".jpeg");
            }).fail(function () {
                $.get(path + ".png").done(function () {
                    $('#imgTrans').attr("src", path + ".png");
                }).fail(function () {
                    log("can't find profile picture")
                })
            })
        })
    });
}
// upload profile picture
function upPic() {
    //noinspection JSUnresolvedVariable
    let ID = document.getElementById("studentID").innerHTML.slice(4, document.getElementById("studentID").innerHTML.length);
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
                showProfilePic();
                $('#profileModal').modal('hide');
            }
        });
    }
}
// upload receipt
function upReciept() {
    //noinspection JSUnresolvedVariable
    let ID = document.getElementById("studentID").innerHTML.slice(4, document.getElementById("studentID").innerHTML.length);
    let ufile = $('#file-2');
    let ext = ufile.val().split('.').pop().toLowerCase();
    if ($.inArray(ext, ['png', 'jpg', 'jpeg']) === -1) {
        alert('กรุณาอัพไฟล์ .jpg, .jpeg หรือ .png เท่านั้น');
    } else {
        let files = ufile.get(0).files;
        let formData = new FormData();
        formData.append('file', files[0], files[0].name);
        formData.append('studentID', ID);
        formData.append('year', 2017);
        formData.append('quarter', 4);
        $.ajax({
            url: 'post/submitReceipt',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                $('#rcModal').modal('hide');
                location.reload();
            }
        });
    }
}