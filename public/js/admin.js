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
    table.innerHTML = "";
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
            cell4.innerHTML = "<td>" + data.nicknameEn + "</td>";
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
 *
 * @param data array of student info
 * @returns {*} array of student to display in table
 */
function filterData(data) {
    let status = document.getElementById("status");
    let stage = document.getElementById("stage");
    let grade = document.getElementById("grade");
    if (status.options[status.selectedIndex].value !== "All"){
        data = data.filter(data => data.status === status.options[status.selectedIndex].value.toLowerCase());
    }
    if (stage.options[stage.selectedIndex].value !== "All Stage"){
        data = data.filter(data => data.registrationState === stage.options[stage.selectedIndex].value.toLowerCase());
    }
    if (grade.options[grade.selectedIndex].value !== "All Grade"){
        data = data.filter(data => data.grade === getNumberGrade(grade.options[grade.selectedIndex].value));
    }
    return data;
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

            let allCourse = data.courseID;

            for (let i = 0; i < allCourse.length; i++) {
                //noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
                $.post("post/courseInfo", {
                    courseID: allCourse[i]
                }, function (data) {
                    if (data.err) {
                        log("[getStudentProfile()] : post/courseInfo => " + data.err);
                    } else {
                        log("[getCourseDescription()] : post/courseInfo => ");
                        log(data);
                        document.getElementById(data.day).innerHTML = data.courseName;
                        document.getElementById(data.day).value = allCourse[i];
                    }
                });
            }
            log(allCourse);

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
                document.getElementById("tutorName").innerHTML = "Tutor : " + data.nicknameEn;
            });
            let date = new Date(data.day);
            document.getElementById("day").innerHTML = "Day : " + getDateFullName(date.getDay());
            document.getElementById("time").innerHTML = date.getHours() + ":00 - " + (date.getHours() + 2) + ":00";
            document.getElementById("courseID").innerHTML = courseID;

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
        return "S" + (grade - 6);
    }
}

function getNumberGrade(grade) {
    log(grade);
    if (grade[0] === "P"){
        return parseInt(grade[1]);
    } else if(grade[0] === "S"){
        log(grade[1]);
        return parseInt(grade[1]) + 6;
    }else {
        return "Not a valid grade";
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

function addRemoveCourse(id) {
    let button = document.getElementById(id);
    let studentId = parseInt(document.getElementById("studentID").innerHTML.slice(4, document.getElementById("studentID").innerHTML.length));
    if (button.innerHTML === "Add Course") {
        "use strict";
        //noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
        $.post("/post/allCourse", {}, function (data) {
            if (data.err) {
                log("[addRemoveCourse()] : post/allCourse => " + data.err);
            } else {
                log("[addRemoveCourse()] : post/allCourse => ");
                data.course = data.course.filter(function (data) {
                    return data.day === parseInt(id);
                });
                log("[addRemoveCourse()] : data.filter() => ");
                log(data);

                let select = document.getElementById("courseSelector");
                select.value = id;
                select.innerHTML = "";

                for (let i = 0; i < data.course.length; i++) {
                    let course = data.course[i];
                    let grade = "";
                    if (course.grade[0] > 6) {
                        grade = "S" + course.grade.map(x => (x - 6)).join("");
                    } else {
                        grade = "P" + course.grade.join("");
                    }
                    select.innerHTML += "<option id='" + course.courseID + "'>" + (course.subject + grade + course.level) + "</option>";
                }

                select.innerHTML += "<option id='hybridMath'> FHB:M</option>";
                select.innerHTML += "<option id='hybridPhysics'> FHB:PH</option>";

                $("#addModal").modal();
            }
        });
    } else {
        document.getElementById("confirmDelete").value = button.value;
        $("#removeModal").modal();

    }
}

function addCourse() {
    let select = document.getElementById("courseSelector");
    let studentID = parseInt(document.getElementById("studentID").innerHTML.slice(4, document.getElementById("studentID").innerHTML.length));
    let courseID = select.options[select.selectedIndex].id;
    //noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
    $.post("post/addStudentCourse", {
        studentID: studentID,
        courseID: [courseID]
    }, function (data) {
        if (data.err) {
            log("[addCourse()] : post/return => " + data.err);
        } else {
            log("[addCourse()] : post/return => Success");
            location.reload();
        }
    });
}

function removeCourse() {
    let button = document.getElementById("confirmDelete");
    let studentID = parseInt(document.getElementById("studentID").innerHTML.slice(4, document.getElementById("studentID").innerHTML.length));
    let courseID = button.value;
    //noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
    $.post("post/removeStudentCourse", {
        studentID: studentID,
        courseID: [courseID]
    }, function (data) {
        if (data.err) {
            log("[RemoveCourse()] : post/return => " + data.err);
        } else {
            log("[RemoveCourse()] : post/return => Success");
            location.reload();
        }
    });
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
