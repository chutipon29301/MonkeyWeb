/**
 * Get data for generating table by calling function generateStudentHtmlTable
 */
var $ = require("request");
function getAllStudentContent() {
    "use strict";
    $.post("/post/allStudent", "", function (data) {
        if (data.err) {
            log("[getAllStudentContent()] : post/return => Error");
        } else {
            log("[getAllStudentContent()] : post/return => ");
            log(data);
            generateStudentHtmlTable(filterData(data.student));
        }
    });
}

/**
 * Generate Html element from data
 * @param student information to fill in table
 */
function generateStudentHtmlTable(student) {
    "use strict";
    var table = document.getElementById("allStudentTable");
    for (var i = 0; i < student.length; i++) {
        var row = table.insertRow(i);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        var cell6 = row.insertCell(5);
        cell1.innerHTML = "<td>" + student[i].studentID + "</td>";
        cell2.innerHTML = "<td>" + student[i].nickname + "</td>";
        cell3.innerHTML = "<td>" + student[i].firstname + "</td>";
        cell4.innerHTML = "<td>" + student[i].lastname + "</td>";
        cell5.innerHTML = "<td>" + ((student[i].inCourse) ? "✔" : "✖") + "</td>";
        cell6.innerHTML = "<td>" + ((student[i].inHybrid) ? "✔" : "✖") + "</td>";

        var clickHandler = function (row) {
            return function () {
                log(row.getElementsByTagName("td")[0].innerHTML);
                writeCookie("monkeyWebAdminAllstudentSelectedUser", row.getElementsByTagName("td")[0].innerHTML);
                self.location = "/adminStudentprofile";
            };
        };
        row.onclick = clickHandler(row);
    }
}

/**
 * Generate element for adminAllcourse page
 */
function getAllCourseContent() {
    "use strict";
    $.post("/post/allCourse", "", function (data) {
        if (data.err) {
            log("[getAllCourseContent()] : post/return => Error");
        } else {
            log("[getAllCourseContent()] : post/return => ");
            log(data);
            generateCourseHtmlTable(data.course);
        }
    });
}

/**
 * Generate Html element from data
 * @param course information to fill in table
 */
function generateCourseHtmlTable(course) {
    "use strict";
    var table = document.getElementById("allCourseTable");
    for (var i = 0; i < course.length; i++) {
        var time = new Date(course[i].day);
        var row = table.insertRow(i);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        cell1.innerHTML = "<td>" + course[i].courseName + "</td>";
        cell2.innerHTML = "<td>" + getDateName(time.getDate()) + "</td>";
        cell3.innerHTML = "<td>" + time.getHours() + "-" + (time.getHours() + 2) + "</td>";
        cell4.innerHTML = "<td>" + course[i].tutor[0] + "</td>";

        var clickHandler = function (row) {
            return function () {
                log(row.getElementsByTagName("td")[0].innerHTML);
                writeCookie("monkeyWebAdminAllstudentSelectedUser", row.getElementsByTagName("td")[0].innerHTML);
                self.location = "/adminStudentprofile";
            };
        };
        row.onclick = clickHandler(row);
    }
}

function getDateName(date) {
    var dateName = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return dateName[date];
}

/**
 * Update allStudent table
 */
function optionSelected() {
    var selectBox = document.getElementById("studentMainFilter");
    var selectData = [];
    switch (selectBox.options[selectBox.selectedIndex].value) {
        case "status":
            selectData = ["active", "inactive", "drop"];
            break;
        case "grade":
            selectData = ["P1", "P2", "P3", "P4", "P5", "P6", "M1", "M2", "M3", "M4", "M5", "M6"];
            break;
        default:
            break;
    }
    var textInnerHtml = "";
    for (var i = 0; i < selectData.length; i++) {
        textInnerHtml += "<option>" + selectData[i] + "</option>";
    }
    document.getElementById("studentSubFilter").innerHTML = textInnerHtml;
}

/**
 *
 * @param data array of student info
 * @returns {*} array of student to display in table
 */
function filterData(data) {
    var selectBox = document.getElementById("studentMainFilter");
    var filterOption = document.getElementById("studentSubFilter");
    var option = filterOption.options[filterOption.selectedIndex].value;
    switch (selectBox.options[selectBox.selectedIndex].value) {
        case "status":
            return data.filter(function (option) {
                return true;
            });
            break;
        case "grade":
            return data.filter(function (option) {
                return true;
            });
            break;
        default:
            return data;
            break;
    }
}


/**
 * Generate element for studentProfile page
 */
function getStudentProfile() {
    var cookie = getCookieDict();
    /** @namespace cookie.monkeyWebAdminAllstudentSelectedUser */
    var studentID = cookie.monkeyWebAdminAllstudentSelectedUser;
    document.getElementById("studentID").innerHTML = "ID: " + studentID;
    $.post("post/studentProfile", {
        studentID: studentID
    }, function (data) {
        if (data.err) {
            log("Invalid");
        } else {
            log(data);
            document.getElementById("studentName").innerHTML = data.firstname + " (" + data.nickname + ") " + data.lastname;
            document.getElementById("studentLevel").innerHTML = "LEVEL: " + getLetterGrade(data.grade);
            document.getElementById("email").innerHTML = "e-mail: " + data.email;
            document.getElementById("phone").innerHTML = "phone: " + data.phone;
            document.getElementById("studentState").innerHTML = "STAGE: " + data.registrationState;
            document.getElementById("studentStatus").innerHTML = "STATUS: " + data.status;
        }
    });
}


/**
 * Convert number grade to string grade
 * @param grade in form for number
 * @returns {string} grade letter
 */
function getLetterGrade(grade) {
    if (grade <= 6) {
        return "P" + grade;
    } else {
        return "M" + (grade - 6);
    }
}
