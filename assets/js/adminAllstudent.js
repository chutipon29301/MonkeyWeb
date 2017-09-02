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
 * Get data for generating table by calling function generateStudentHtmlTable
 */
function getAllStudentContent() {
    "use strict";
    allStudent().then((data) => {
        if (data.err) {
            log("[getAllStudentContent()] : post/allStudent => " + data.err);
        } else {
            log("[getAllStudentContent()] : post/allStudent => ");
            log(data);
            // for typeahead predict
            for (let i = 0; i < data.student.length; i++) {
                studentForSearch.push({
                    name: data.student[i].nickname + " " + data.student[i].firstname,
                    id: data.student[i].studentID,
                })
            }
            log(studentForSearch);
            $('.typeahead').typeahead({
                source: studentForSearch,
                autoSelect: true
            });
            $('.typeahead').change(function () {
                let current = $('.typeahead').typeahead("getActive");
                if (current) {
                    log(current)
                    writeCookie("monkeyWebAdminAllstudentSelectedUser", current.id);
                    self.location = "/adminStudentprofile";
                }
            })
            // for generate table data
            generateStudentHtmlTable(filterData(data.student));
        }
    })
}

/**
 * Filter data from selected option
 * @param data array of student info
 * @returns {*} array of student to display in table
 */
function filterData(data) {
    let status = document.getElementById("status");
    let stage = document.getElementById("stage");
    let grade = document.getElementById("grade");
    let course = document.getElementById("course");
    if (status.options[status.selectedIndex].value !== "all") {
        data = data.filter(data => data.status === status.options[status.selectedIndex].value);
    }
    if (stage.options[stage.selectedIndex].value !== "all") {
        data = data.filter(data => data.registrationState === stage.options[stage.selectedIndex].value);
    }
    if (grade.options[grade.selectedIndex].value !== "all") {
        data = data.filter(data => data.grade === parseInt(grade.options[grade.selectedIndex].value));
    }
    if (course.options[course.selectedIndex].value !== "all") {
        data = data.filter(data => {
            switch (course.options[course.selectedIndex].value) {
                case "hb":
                    return data.inHybrid;
                case "cr":
                    return data.inCourse;
                default:
                    break;
            }
        })
    }
    return data;
}

/**
 * Generate Html element from data
 * @param student information to fill in table
 */
function generateStudentHtmlTable(student) {
    let table = document.getElementById("allStudentTable");
    table.innerHTML = "";
    for (let i = 0; i < student.length; i++) {
        let row = table.insertRow(i);
        let status = student[i].status;
        let stage = student[i].registrationState;
        switch (status) {
            case 'terminated':
                row.setAttribute("class", "danger");
                break;
            case 'dropped':
                row.setAttribute("class", "warning");
                break;
            case 'inactive':
                row.setAttribute("class", "info");
                break;
        }
        if (stage === "finished") {
            row.setAttribute("class", "success");
        }
        let cell0 = row.insertCell(0);
        let cell1 = row.insertCell(1);
        let cell2 = row.insertCell(2);
        let cell3 = row.insertCell(3);
        let cell4 = row.insertCell(4);
        let cell5 = row.insertCell(5);
        let cell6 = row.insertCell(6);
        cell0.innerHTML = "<td>" + (i + 1) + "</td>";
        cell1.innerHTML = "<td>" + student[i].studentID + "</td>";
        cell2.innerHTML = "<td>" + student[i].nickname + "</td>";
        cell3.innerHTML = "<td>" + student[i].firstname + "</td>";
        cell4.innerHTML = "<td>" + student[i].lastname + "</td>";
        cell5.innerHTML = "<td>" + ((student[i].inCourse) ? "✔" : "✖") + "</td>";
        cell6.innerHTML = "<td>" + ((student[i].inHybrid) ? "✔" : "✖") + "</td>";

        let clickHandler = (row) => () => {
            //noinspection SpellCheckingInspection
            writeCookie("monkeyWebAdminAllstudentSelectedUser", row.getElementsByTagName("td")[1].innerHTML);
            //noinspection SpellCheckingInspection
            self.location = "/adminStudentprofile";
        };
        row.onclick = clickHandler(row);
    }
}

function scanStudentBarcode() {
    let inputBox = document.getElementById("studentID")
    writeCookie("monkeyWebAdminAllstudentSelectedUser", inputBox.value.substring(0, inputBox.value.length - 1));
    self.location = "/adminStudentprofile";
}