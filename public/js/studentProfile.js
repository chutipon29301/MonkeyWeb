//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const studentProfile = (studentID) => $.post("post/studentProfile", {
    studentID: studentID
});

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const courseInfo = (courseID) => $.post("post/courseInfo", {
    courseID: courseID
});

function getStudentTable() {
    let cookie = getCookieDict();
    studentProfile(parseInt(cookie.monkeyWebUser)).then((data) => {
        if (data.err) {
            log("[getStudentProfile()] : post/studentProfile => " + data.err);
        } else {
            log("[getCourseDescription()] : post/studentProfile => ");
            log(data);

            document.getElementById("studentID").innerHTML = "ID : " + cookie.monkeyWebUser;
            document.getElementById("studentName").innerHTML = "Name : " + data.firstname + " (" + data.nickname + ") " +
                data.lastname;

            for (let i = 0; i < data.courseID.length; i++) {
                courseInfo(data.courseID[i]).then((course) => {
                    log(course);
                    log(course.day);
                    let cells = document.getElementsByClassName("" + course.day);
                    log(cells);
                    for (let j = 0; j < cells.length; j++){
                        log(cells[i]);
                        cells[i].innerHTML = course.courseName;
                    }
                });
            }
        }
    });
}