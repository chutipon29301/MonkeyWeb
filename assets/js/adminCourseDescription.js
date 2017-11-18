const getDateFullName = (date) => {
    let dateName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return dateName[date];
};

$(document).ready(function () {
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
        });
    }
    $("#allStudentInCourseTable").on("click", ".std-row", function () {
        writeCookie("monkeyWebAdminAllstudentSelectedUser", this.id);
        self.location = "/adminStudentprofile";
    })
});