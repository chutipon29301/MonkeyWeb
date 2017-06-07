/**
 * Get data for generating table by calling function generateStudentHtmlTable
 */
function getAllStudentContent() {
    "use strict";
    //noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
    $.post("/post/allStudent", "", function (data) {
        if (data.err) {
            log("[getAllStudentContent()] : post/return => " + data.err);
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
    let table = document.getElementById("allStudentTable");
    for (let i = 0; i < student.length; i++) {
        let row = table.insertRow(i);
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);
        let cell5 = row.insertCell(4);
        let cell6 = row.insertCell(5);
        cell1.innerHTML = "<td>" + student[i].studentID + "</td>";
        cell2.innerHTML = "<td>" + student[i].nickname + "</td>";
        cell3.innerHTML = "<td>" + student[i].firstname + "</td>";
        cell4.innerHTML = "<td>" + student[i].lastname + "</td>";
        cell5.innerHTML = "<td>" + ((student[i].inCourse) ? "✔" : "✖") + "</td>";
        cell6.innerHTML = "<td>" + ((student[i].inHybrid) ? "✔" : "✖") + "</td>";

        let clickHandler = function (row) {
            return function () {
                log(row.getElementsByTagName("td")[0].innerHTML);
                //noinspection SpellCheckingInspection
                writeCookie("monkeyWebAdminAllstudentSelectedUser", row.getElementsByTagName("td")[0].innerHTML);
                //noinspection SpellCheckingInspection
                self.location = "/adminStudentprofile";
            };
        };
        row.onclick = clickHandler(row);
    }
}

//noinspection SpellCheckingInspection
/**
 * Generate element for adminAllcourse page
 */
function getAllCourseContent() {
    "use strict";
    //noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
    $.post("/post/allCourse", "", function (data) {
        if (data.err) {
            log("[getAllCourseContent()] : post/return => " + data.err);
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
    let table = document.getElementById("allCourseTable");
    for (let i = 0; i < course.length; i++) {
        let time = new Date(course[i].day);
        let row = table.insertRow(i);
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);
        row.id = course[i].courseID;
        cell1.innerHTML = "<td>" + course[i].courseName + "</td>";
        cell2.innerHTML = "<td>" + getDateName(time.getDay()) + "</td>";
        cell3.innerHTML = "<td>" + time.getHours() + ":00 - " + (time.getHours() + 2) + ":00</td>";
        getUsername(course[i].tutor[0], function (data) {
            cell4.innerHTML = "<td>" + data.nickname + "</td>";
        });

        let clickHandler = function (row) {
            return function () {
                log(row.getElementsByTagName("td")[0].innerHTML);
                writeCookie("monkeyWebAdminAllcourseSelectedCourseID", row.id);
                self.location = "/adminCoursedescription";
            };
        };
        row.onclick = clickHandler(row);
    }
}


/**
 * Update allStudent table
 */
function optionSelected() {
    let selectBox = document.getElementById("studentMainFilter");
    let selectData = [];
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
    let textInnerHtml = "";
    for (let i = 0; i < selectData.length; i++) {
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
    let selectBox = document.getElementById("studentMainFilter");
    let filterOption = document.getElementById("studentSubFilter");
    let option = filterOption.options[filterOption.selectedIndex].value;
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
    let cookie = getCookieDict();
    /** @namespace cookie.monkeyWebAdminAllstudentSelectedUser */
    let studentID = cookie.monkeyWebAdminAllstudentSelectedUser;
    document.getElementById("studentID").innerHTML = "ID: " + studentID;
    //noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
    $.post("post/studentProfile", {
        studentID: studentID
    }, function (data) {
        if (data.err) {
            log("[getStudentProfile()] : post/return => " + data.err);
        } else {
            log("[getStudentProfile()] : post/return => ");
            log(data);
            document.getElementById("studentName").innerHTML = data.firstname + " (" + data.nickname + ") " + data.lastname;
            document.getElementById("studentLevel").innerHTML = "LEVEL: " + getLetterGrade(data.grade);
            document.getElementById("email").innerHTML = "e-mail: " + data.email;
            document.getElementById("phone").innerHTML = "phone: " + data.phone;
            document.getElementById("studentState").innerHTML = "STAGE: " + data.registrationState;
            document.getElementById("studentStatus").innerHTML = "STATUS: " + data.status;

            let courseData = [[], [], [], []];
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    courseData[i][j] = 'MS123c';
                }
            }
            generateImage(courseData);
        }
    });
}

/**
 * generate element for courseDescription page
 */
function getCourseDescription() {
    let cookie = getCookieDict();
    /** @namespace cookie.monkeyWebAdminAllcourseSelectedCourseID */
    let courseID = cookie.monkeyWebAdminAllcourseSelectedCourseID;
    //noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
    $.post("post/courseInfo", {
        courseID: courseID
    }, function (data) {
        if (data.err) {
            log("[getCourseDescription()] : post/return => " + data.err);
        } else {
            log("[getCourseDescription()] : post/return => ");
            log(data);
            document.getElementById("courseName").innerHTML = data.courseName;
            getUsername(data.tutor[0], function (data) {
                document.getElementById("tutorName").innerHTML = "Tutor : " + data.firstname;
            });
            let date = new Date(data.day);
            document.getElementById("day").innerHTML = "Day : " + getDateFullName(date.getDay());
            document.getElementById("time").innerHTML = date.getHours() + ":00 - " + (date.getHours() + 2) + ":00";

            let table = document.getElementById("allStudentInCourseTable");
            for (let i = 0; i < data.student.length; i++) {
                let row = table.insertRow(i);
                let cell1 = row.insertCell(0);
                let cell2 = row.insertCell(1);
                let cell3 = row.insertCell(2);
                let cell4 = row.insertCell(3);
                cell1.innerHTML = "<td>" + data.student[i] + "</td>";
                getUsername(data.student[i], function (data) {
                    cell2.innerHTML = "<td>" + data.nickname + "</td>";
                    cell3.innerHTML = "<td>" + data.firstname + "</td>";
                    cell4.innerHTML = "<td>" + data.lastname + "</td>";
                });
                let clickHandler = function (row) {
                    return function () {
                        log(row.getElementsByTagName("td")[0].innerHTML);
                        //noinspection SpellCheckingInspection
                        writeCookie("monkeyWebAdminAllstudentSelectedUser", row.getElementsByTagName("td")[0].innerHTML);
                        //noinspection SpellCheckingInspection
                        self.location = "/adminStudentprofile";
                    };
                };
                row.onclick = clickHandler(row);
            }
        }
    });
}

/**
 * Get short name of day
 * @param date int day
 * @returns {string} name of day
 */
function getDateName(date) {
    let dateName = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return dateName[date];
}

function getDateFullName(date) {
    let dateName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return dateName[date];
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


/**
 * Get name of user
 * @param userID of user
 * @param callback function
 * @returns {string} name of user
 */
function getUsername(userID, callback) {
    //noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
    $.post("post/name", {
        userID: userID
    }, function (data) {
        if (data.err) {
            log("[getUsername()] : post/return => " + data.err);
            return "unknown";
        } else {
            log("[getUsername()] : post/return => ");
            log(data);
            callback(data);
        }
    });
    return "unknown";
}

/**
 * Generate image for download
 * @param courseData 2d array name of course
 */
function generateImage(courseData) {

    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    let tableData = [[], [], [], [], []];
    let dateList = ['', 'TUE', 'THU', 'SAT', 'SUN'];
    let timeList = ['', '8-10', '10-12', '13-15', '15-17'];
    let bgColorList = ['black', 'deeppink', 'orange', 'purple', 'red'];
    let textColorList = ['white', 'black', 'black', 'black', 'black'];
    let textTableData;

    let i;
    let j;

    /**
     * Put courseData into tableData array
     */
    for (i = 0; i < 5; i++) {
        for (j = 0; j < 5; j++) {
            if (i === 0) {
                tableData[i][j] = dateList[j];
            } else if (j === 0) {
                tableData[i][j] = timeList[i];
            } else {
                tableData[i][j] = courseData[i - 1][j - 1];
            }
        }
    }

    /**
     * Generate html from tableData array
     */
    textTableData = '<table style="border: solid black;border-collapse: collapse">';
    for (i = 0; i < tableData.length; i++) {
        textTableData += '<tr style="height: 72px;border: solid black;color: ' + textColorList[i] + ';font-size:36px;">';
        for (j = 0; j < tableData[i].length; j++) {
            if (i === 0) {
                textTableData += '<th style="background-color: ' + bgColorList[j] + ';border: solid black;width: 160px;">'
                    + tableData[i][j] + '</th>';
            } else {
                textTableData += '<td style="border: solid black;">' + tableData[i][j] + '</td>'
            }
        }
        textTableData += '</tr>';
    }
    textTableData += '</table>';

    let data =
        '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="360">' +
        '<foreignObject width="100%" height="100%">' +
        '<div xmlns="http://www.w3.org/1999/xhtml">' +
        textTableData +
        '</div>' +
        '</foreignObject>' +
        '</svg>';
    //noinspection SpellCheckingInspection,JSUnresolvedVariable
    let DOMURL = window.URL || window.webkitURL || window;
    let img = new Image();
    let svg = new Blob([data], {
        type: 'image/svg+xml'
    });
    //noinspection JSUnresolvedFunction
    let url = DOMURL.createObjectURL(svg);

    //noinspection SpellCheckingInspection
    img.onload = function () {
        ctx.drawImage(img, 0, 0);
        //noinspection JSUnresolvedFunction
        DOMURL.revokeObjectURL(url);
    };
    img.src = url;
}
