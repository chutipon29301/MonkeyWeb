const getDateFullName = (date) => {
    let dateName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return dateName[date];
};

let crCookie = getCookieDict().monkeyWebAdminAllcourseSelectedCourseID;
if (crCookie === undefined) {
    self.location = "/adminAllCourse";
} else {
    courseInfo(crCookie).then(crInfo => {
        $("#courseName").html(crInfo.courseName);
        name(crInfo.tutor[0]).then(name => {
            let str = "Tutor : " + name.nicknameEn + " (" + name.firstnameEn + ")";
            $("#tutorName").html(str);
        });
        let time = moment(crInfo.day);
        $("#day").html("Day: " + getDateFullName(time.day()));
        $("#time").html(time.hour() + ":00 - " + (time.hour() + 2) + ":00");
        $("#crDescription").html(crInfo.description);
        $("#courseID").html("CrID: " + crCookie);
        let promise = [];
        for (let i in crInfo.student) {
            promise.push($.post("post/studentProfile", { studentID: crInfo.student[i] }));
        }
        Promise.all(promise).then(stdName => {
            for (let i in stdName) {
                if (stdName[i].status == "active") {
                    $("#allStudentInCourseTable").append(
                        "<tr class='std-row' id='" + crInfo.student[i] + "'>" +
                        "<td>" + (parseInt(i) + 1) + "</td>" +
                        "<td class='text-center'>" + crInfo.student[i] + "</td>" +
                        "<td class='text-center'>" + stdName[i].nickname + "</td>" +
                        "<td>" + stdName[i].firstname + "</td>" +
                        "<td>" + stdName[i].lastname + "</td>" +
                        "</tr>"
                    )
                }
            }
        });
        $("#levelInput").attr("placeholder", crInfo.level);
        $("#desInput").attr("placeholder", crInfo.description);
        $("#dayInput").val(crInfo.day);
        $("#roomInput").val(crInfo.room);
        genTutorOption()
    });
}
$("#allStudentInCourseTable").on("click", ".std-row", function () {
    writeCookie("monkeyWebAdminAllstudentSelectedUser", this.id);
    self.location = "/adminStudentprofile";
})

// add event when click on cr name
$("#courseName").click(function () {
    $("#changeCrInfoModal").modal('show');
});
$("#changeCrInfoButt").click(function () {
    sendEditProfile()
});

// gen tutor option func
async function genTutorOption() {
    let allUser = await $.post("post/listRandomStudent");
    let allTutor = [];
    let promise = [];
    for (let i in allUser.student) {
        let str = allUser.student[i].studentID + "";
        if (str.indexOf("990") >= 0) {
            allTutor.push(allUser.student[i].studentID);
            promise.push(name(allUser.student[i].studentID));
        }
    }
    let tutorName = await Promise.all(promise);
    for (let i in allTutor) {
        $("#tutorInput").append(
            "<option value=" + allTutor[i] + ">" + allTutor[i] + " - " + tutorName[i].nicknameEn + "</option>"
        );
    }
}

// send edit profile function
async function sendEditProfile() {
    let editData = { courseID: crCookie };
    if ($("#levelInput").val() != "") {
        editData.level = $("#levelInput").val();
    }
    if ($("#desInput").val() != "") {
        editData.description = $("#desInput").val();
    }
    editData.day = $("#dayInput").val();
    editData.tutor = [$("#tutorInput").val()];
    editData.room = $("#roomInput").val();
    log(editData);
    await $.post("post/editCourse", editData);
    location.reload();
}