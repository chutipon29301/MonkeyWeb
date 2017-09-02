/**
 * Get full name of date
 * @param date int day 0 - 6
 * @returns {string} full name of day
 */
const getDateFullName = (date) => {
    let dateName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return dateName[date];
};

/**
 * generate element for courseDescription page
 */
function getCourseDescription() {
    let cookie = getCookieDict();
    /** @namespace cookie.monkeyWebAdminAllcourseSelectedCourseID */
    let courseID = cookie.monkeyWebAdminAllcourseSelectedCourseID;
    courseInfo(courseID).then((data) => {
        if (data.err) {
            log("[getCourseDescription()] : post/courseInfo => " + data.err);
        } else {
            log("[getCourseDescription()] : post/courseInfo => ");
            log(data);
            document.getElementById("courseName").innerHTML = data.courseName;
            name(data.tutor[0]).then((data) => {
                document.getElementById("tutorName").innerHTML = "Tutor : " + data.nicknameEn;
            });
            let date = new Date(data.day);
            document.getElementById("day").innerHTML = "Day : " + getDateFullName(date.getDay());
            document.getElementById("time").innerHTML = date.getHours() + ":00 - " + (date.getHours() + 2) + ":00";
            document.getElementById("courseID").innerHTML = courseID;
            return data.student;
        }
    }).then((student) => {
        let table = document.getElementById("allStudentInCourseTable");
        for (let i = 0; i < student.length; i++) {
            let row = table.insertRow(i);
            let cell0 = row.insertCell(0);
            let cell1 = row.insertCell(1);
            let cell2 = row.insertCell(2);
            let cell3 = row.insertCell(3);
            let cell4 = row.insertCell(4);
            cell0.innerHTML = "<td>" + (i + 1) + "</td>";
            cell1.innerHTML = "<td>" + student[i] + "</td>";
            name(student[i]).then((data) => {
                cell2.innerHTML = "<td>" + data.nickname + "</td>";
                cell3.innerHTML = "<td>" + data.firstname + "</td>";
                cell4.innerHTML = "<td>" + data.lastname + "</td>";
            });
            let clickHandler = (row) => () => {
                //noinspection SpellCheckingInspection
                writeCookie("monkeyWebAdminAllstudentSelectedUser", row.getElementsByTagName("td")[1].innerHTML);
                //noinspection SpellCheckingInspection
                self.location = "/adminStudentprofile";
            };
            row.onclick = clickHandler(row);
        }
    });

}