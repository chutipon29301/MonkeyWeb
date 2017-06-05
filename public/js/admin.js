/**
 * Get data for generating table by calling function generateHtmlTable
 */
function getAllStudentContent() {
    "use strict";
    $.post("/post/allStudent", "", function (data) {
        if (data.err) {
            log("[getAllStudent()] : post/return => Error");
        } else {
            log("[getAllStudent()] : post/return => ");
            log(data);
            generateHtmlTable(data);
        }
    });
}

/**
 * Generate Html element from data
 * @param data information to fill in table
 */
function generateHtmlTable(data) {
    "use strict";
    var student = data.student;
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
        case "year":
            selectData = ["2015", "2016", "2017", "2018"];
            break;
        default:
            break;
    }
    var textInnerHtml = "";
    for(var i = 0; i < selectData.length; i++){
        textInnerHtml += "<option>" + selectData[i] + "</option>";
    }
    document.getElementById("studentSubFilter").innerHTML = textInnerHtml;
}

function filterTable() {

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
 * Generate element for adminAllcourse page
 */
function getAllCourse() {
    //prepare for generate course for allCoursePage
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
