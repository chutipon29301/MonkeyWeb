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
 * Generate element for adminAllcourse page
 */
function getAllCourseContent() {
    allCourse().then((data) => {
        if (data.err) {
            log("[getAllCourseContent()] : post/allCourse => " + data.err);
        } else {
            log("[getAllCourseContent()] : post/allCourse => ");
            log(data);
            generateCourseHtmlTable(filterCourseData(data.course));
        }
    });
}

function filterCourseData(data) {
    let subject = document.getElementById("subject");
    let grade = document.getElementById("grade");
    let name = document.getElementById("name");
    let time = document.getElementById("time");
    if (subject.options[subject.selectedIndex].value !== "all") {
        data = data.filter(data => data.subject === subject.options[subject.selectedIndex].value);
    }
    if (grade.options[grade.selectedIndex].value !== "all") {
        data = data.filter(data => data.grade.indexOf(parseInt(grade.options[grade.selectedIndex].value)) !== -1);
    }
    if (name.options[name.selectedIndex].value !== "all") {
        data = data.filter(data => data.tutor.indexOf(parseInt(name.options[name.selectedIndex].value)) !== -1);
    }
    if (time.options[time.selectedIndex].value !== "all") {
        data = data.filter(data => data.day === parseInt(time.options[time.selectedIndex].value));
    }
    return data
}

/**
 * Generate Html element from data
 * @param course information to fill in table
 */
function generateCourseHtmlTable(course) {
    let table = document.getElementById("allCourseTable");
    table.innerHTML = "";
    for (let i = 0; i < course.length; i++) {
        let time = new Date(course[i].day);
        let row = table.insertRow(i);
        let cell0 = row.insertCell(0);
        let cell1 = row.insertCell(1);
        let cell2 = row.insertCell(2);
        let cell3 = row.insertCell(3);
        let cell4 = row.insertCell(4);
        row.id = course[i].courseID;
        cell0.innerHTML = "<td>" + (i + 1) + "</td>";
        cell1.innerHTML = "<td>" + course[i].courseName + "</td>";
        cell2.innerHTML = "<td>" + getDateName(time.getDay()) + "</td>";
        cell3.innerHTML = "<td>" + time.getHours() + ":00 - " + (time.getHours() + 2) + ":00</td>";
        name(course[i].tutor[0]).then(data => {
            cell4.innerHTML = "<td>" + data.nicknameEn + "</td>";
        });
        let clickHandler = (row) => () => {
            writeCookie("monkeyWebAdminAllcourseSelectedCourseID", row.id);
            self.location = "/adminCoursedescription";
        };
        row.onclick = clickHandler(row);
    }
}