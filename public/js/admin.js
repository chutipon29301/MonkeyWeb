/**
 * Get short name of day
 * @param date int day 0 - 6
 * @returns {string} name of day
 */
const getDateName = (date) => {
    let dateName = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return dateName[date];
};

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
 * Convert number grade to string grade
 * @param grade in form for number
 * @returns {string} grade letter
 */
const getLetterGrade = (grade) => {
    if (grade <= 6) {
        return "P" + grade;
    } else {
        return "S" + (grade - 6);
    }
};

/**
 * Get data for generating table by calling function generateStudentHtmlTable
 */
function getAllStudentContent() {
    "use strict";
    allStudent.then((data) => {
        if (data.err) {
            log("[getAllStudentContent()] : post/allStudent => " + data.err);
        } else {
            log("[getAllStudentContent()] : post/allStudent => ");
            log(data);
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
    if (status.options[status.selectedIndex].value !== "all") {
        data = data.filter(data => data.status === status.options[status.selectedIndex].value);
    }
    if (stage.options[stage.selectedIndex].value !== "all") {
        data = data.filter(data => data.registrationState === stage.options[stage.selectedIndex].value);
    }
    if (grade.options[grade.selectedIndex].value !== "all") {
        data = data.filter(data => data.grade === parseInt(grade.options[grade.selectedIndex].value));
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

        let clickHandler = (row) => () => {
            log(row.getElementsByTagName("td")[0].innerHTML);
            //noinspection SpellCheckingInspection
            writeCookie("monkeyWebAdminAllstudentSelectedUser", row.getElementsByTagName("td")[0].innerHTML);
            //noinspection SpellCheckingInspection
            self.location = "/adminStudentprofile";
        };
        row.onclick = clickHandler(row);
    }
}

//noinspection SpellCheckingInspection
/**
 * Generate element for adminAllcourse page
 */
function getAllCourseContent() {
    allCourse.then((data) => {
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
        name(course[i].tutor[0]).then((data) => {
            cell4.innerHTML = "<td>" + data.nicknameEn + "</td>";
        });
        let clickHandler = (row) => () => {
            writeCookie("monkeyWebAdminAllcourseSelectedCourseID", row.id);
            self.location = "/adminCoursedescription";
        };
        row.onclick = clickHandler(row);
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
    studentProfile(studentID).then((data) => {
        log("[getStudentProfile()] : post/studentProfile => ");
        log(data);
        document.getElementById("studentName").innerHTML = data.firstname + " (" + data.nickname + ") " + data.lastname;
        document.getElementById("studentLevel").innerHTML = "LEVEL: " + getLetterGrade(data.grade);
        document.getElementById("email").innerHTML = "e-mail: " + data.email;
        document.getElementById("phone").innerHTML = "phone: " + data.phone;
        document.getElementById("studentState").innerHTML = "STAGE: " + data.registrationState;
        document.getElementById("studentStatus").innerHTML = "STATUS: " + data.status;
        return data;
    }).then((data) => {
        for (let i = 0; i < data.courseID.length; i++) {
            courseInfo(data.courseID[i]).then((course) => {
                if (course.err) {
                    log("[getStudentProfile()] : post/courseInfo => " + course.err);
                } else {
                    log("[getCourseDescription()] : post/courseInfo => ");
                    log(course);
                    let time = new Date(course.day);
                    //noinspection ES6ModulesDependencies,JSUnresolvedFunction
                    let courseTimeID = moment(0).day(time.getDay()).hour(time.getHours()).minute(time.getMinutes()).valueOf();
                    document.getElementById(courseTimeID).innerHTML = course.courseName;
                    document.getElementById(courseTimeID).value = data.courseID[i];
                    document.getElementById(courseTimeID).className = "btn btn-warning col-md-12";
                }
            });
        }
        log("[getStudentProfile()] All registered course => ");
        log(data.courseID);

        let hybrid = data.hybridDay;
        for (let i = 0; i < hybrid.length; i++) {
            document.getElementById(hybrid[i].day).innerHTML = (hybrid[i].subject === "M") ? "FHB : M" : "FHB : PH";
            document.getElementById(hybrid[i].day).className = "btn btn-primary col-md-12";
        }

        let skill = data.skillDay;
        for (let i = 0; i < skill.length; i++) {
            let time = new Date(skill[i].day);
            let hour = new Date(skill[i].day);
            if (time.getMinutes() === 30) {
                time.setMinutes(0);
            }
            if (time.getHours() === 9 || time.getHours() === 11 || time.getHours() === 14 || time.getHours() === 16) {
                time.setHours(time.getHours() - 1);
            }
            document.getElementById("" + time.getTime()).innerHTML = "SKILL " + hour.getHours() + ":" +
                ((hour.getMinutes() === 0) ? "00" : "30");
            document.getElementById("" + time.getTime()).className = "btn btn-info col-md-12";
        }
        generateImageData()
    });
}


function generateImageData() {
    let studentID = parseInt(document.getElementById("studentID").innerHTML.slice(4, document.getElementById("studentID").innerHTML.length));
    let tableInfo = {
        "id": "" + studentID
    };

    studentProfile(studentID).then((data) => {
        tableInfo.firstname = data.firstname;
        tableInfo.lastname = data.lastname;
        tableInfo.nickname = data.nickname;
        tableInfo.grade = "" + data.grade;

        let mainTable = {}, mathMiniTable = {}, physicsMiniTable = {};
        for (let i = 0; i < data.courseID.length; i++) {
            courseInfo(data.courseID[i]).then((data) => {
                let time = new Date(data.day);
                mainTable[getDateName(time.getDay()) + time.getHours()] = {};
                mainTable[getDateName(time.getDay()) + time.getHours()].courseName = data.courseName;
                if (data.tutor[0] === 99000) {
                    if (data.courseName[0] === "M") {
                        mathMiniTable[getDateName(time.getDay()) + time.getHours()] = "CR";
                    } else {
                        physicsMiniTable[getDateName(time.getDay()) + time.getHours()] = "CR";
                    }
                }
                return [(name(data.tutor[0])), data];
            }).then((req) => {
                let name = req[0];
                let data = req[1];
                let time = new Date(data.day);
                name.then((name) => {
                    mainTable[getDateName(time.getDay()) + time.getHours()].tutor = name.nicknameEn;
                });
            });
        }

        for (let i = 0; i < data.skillDay.length; i++) {
            let time = new Date(data.skillDay[i].day);
            mainTable[getDateName(time.getDay()) + time.getHours()] = {};
            mainTable[getDateName(time.getDay()) + time.getHours()].courseName = "SKILL " + time.getHours() + ":" +
                ((time.getMinutes() === 0) ? "00" : "30");
            mainTable[getDateName(time.getDay()) + time.getHours()].tutor = "SKILL";
        }

        for (let i = 0; i < data.hybridDay.length; i++) {
            let time = new Date(data.hybridDay[i].day);
            mainTable[getDateName(time.getDay()) + time.getHours()] = {};
            mainTable[getDateName(time.getDay()) + time.getHours()].courseName =
                ((data.hybridDay[i].subject === "M") ? "FHB : M" : "FHB : PH");
            mainTable[getDateName(time.getDay()) + time.getHours()].tutor = "HB";
            if (data.hybridDay[i].subject === "M") {
                mathMiniTable[getDateName(time.getDay()) + time.getHours()] = "HB";
            } else {
                physicsMiniTable[getDateName(time.getDay()) + time.getHours()] = "HB";
            }
        }
        tableInfo.mainTable = mainTable;
        tableInfo.mathMiniTable = mathMiniTable;
        tableInfo.physicsMiniTable = physicsMiniTable;
        return tableInfo;
    }).then((tableInfo) => {
        log("======================================");
        log(tableInfo);
    });
}

/**
 * Change registration state of user
 * @param registrationState change registration stage of user
 */
function setRegistrationState(registrationState) {
    let studentID = parseInt(document.getElementById("studentID").innerHTML.slice(4, document.getElementById("studentID").innerHTML.length));
    changeRegistrationState(studentID, registrationState).then((data) => {
        if (data.err) {
            log("[setRegistrationState()] : post/changeRegistrationState => " + data.err);
        } else {
            log("[setRegistrationState()] : post/changeRegistrationState => Success");
            location.reload()
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
            let cell1 = row.insertCell(0);
            let cell2 = row.insertCell(1);
            let cell3 = row.insertCell(2);
            let cell4 = row.insertCell(3);
            cell1.innerHTML = "<td>" + student[i] + "</td>";
            name(student[i]).then((data) => {
                cell2.innerHTML = "<td>" + data.nickname + "</td>";
                cell3.innerHTML = "<td>" + data.firstname + "</td>";
                cell4.innerHTML = "<td>" + data.lastname + "</td>";
            });
            let clickHandler = (row) => () => {
                log(row.getElementsByTagName("td")[0].innerHTML);
                //noinspection SpellCheckingInspection
                writeCookie("monkeyWebAdminAllstudentSelectedUser", row.getElementsByTagName("td")[0].innerHTML);
                //noinspection SpellCheckingInspection
                self.location = "/adminStudentprofile";
            };
            row.onclick = clickHandler(row);
        }
    });

}

/**
 * Call when button in table is clicked
 * @param timeID get from id of button
 */
function addRemoveCourse(timeID) {
    let button = document.getElementById(timeID);
    if (button.innerHTML === "Add Course") {
        allCourse.then((data) => {
            if (data.err) {
                log("[addRemoveCourse()] : post/allCourse => " + data.err);
            } else {
                //noinspection JSUndefinedPropertyAssignment
                data.course = data.course.filter(data => data.day === parseInt(timeID));
                log("[addRemoveCourse()] : data.filter() => ");
                log(data);

                let select = document.getElementById("courseSelector");
                select.value = timeID;
                select.innerHTML = "";

                for (let i = 0; i < data.course.length; i++) {
                    let course = data.course[i];
                    let grade = "";
                    if (course.grade[0] > 6) {
                        grade = "S" + course.grade.map((x) => (x - 6)
                            ).join("");
                    } else {
                        grade = "P" + course.grade.join("");
                    }
                    name(course.tutor[0]).then((data) => {
                        select.innerHTML += "<option id='" + course.courseID + "'>" + course.subject + grade + course.level +
                            " - " + data.nicknameEn + "</option>";
                    });
                }

                let time = new Date(parseInt(timeID));
                select.innerHTML += "<option id='" + time.getTime() + "'>FHB : M</option>";
                select.innerHTML += "<option id='" + time.getTime() + "'>FHB : PH</option>";

                for (let i = 0; i < 4; i++) {
                    select.innerHTML += "<option id='" + time.getTime() + "'>SKILL " + time.getHours() +
                        ((i % 2 === 0) ? ":00" : ":30") + "</option>";
                    time.setMinutes(time.getMinutes() + 30);
                }

                $("#addModal").modal();
            }
        });
    } else {
        document.getElementById("confirmDelete").value = button.value;
        document.getElementById("courseName").innerHTML = button.innerHTML;
        document.getElementById("removeModal").value = timeID;
        $("#removeModal").modal();
    }
}

/**
 * Add course to selected user
 */
function addCourse() {
    let select = document.getElementById("courseSelector");
    let studentID = parseInt(document.getElementById("studentID").innerHTML.slice(4, document.getElementById("studentID").innerHTML.length));
    let selectedOption = select.options[select.selectedIndex];
    let selectedValue = selectedOption.value;
    if (selectedValue.slice(0, 5) === "SKILL") {
        addSkillDay(studentID, selectedOption.id).then((data) => {
            if (data.err) {
                log("[addCourse()] : post/addSkillDay => " + data.err);
            } else {
                log("[addCourse()] : post/addSkillDay => Success");
                location.reload();
            }
        });
    } else if (selectedValue.slice(0, 3) === "FHB") {
        addHybridDay(studentID, ((selectedValue[selectedValue.length - 1] === "M") ? "M" : "PH"), selectedOption.id).then((data) => {
            if (data.err) {
                log("[addCourse()] : post/addHybridDay => " + data.err);
            } else {
                log("[addCourse()] : post/addHybridDay => Success");
                location.reload();
            }
        });
    } else {
        let courseID = selectedOption.id;
        addStudentCourse(studentID, [courseID]).then((data) => {
            if (data.err) {
                log("[addCourse()] : post/addStudentCourse => " + data.err);
            } else {
                log("[addCourse()] : post/addStudentCourse => Success");
                location.reload();
            }
        });
    }
}

/**
 * Remove course from selected user
 */
function removeCourse() {
    let button = document.getElementById("confirmDelete");
    let studentID = parseInt(document.getElementById("studentID").innerHTML.slice(4, document.getElementById("studentID").innerHTML.length));
    let courseID = button.value;
    let courseName = document.getElementById("courseName").innerHTML;
    let time = parseInt(document.getElementById("removeModal").value);

    if (courseName.slice(0, 5) === "SKILL") {
        let hour = new Date(time);
        hour.setMinutes(parseInt(courseName.slice(courseName.indexOf(":") + 1)));
        hour.setHours(parseInt(courseName.slice(courseName.indexOf(" ") + 1, courseName.indexOf(":"))));
        removeSkillDay(studentID, hour.getTime()).then((data) => {
            if (data.err) {
                log("[addCourse()] : post/removeSkillDay => " + data.err);
            } else {
                log("[addCourse()] : post/removeSkillDay => Success");
                location.reload();
            }
        });
    } else if (courseName.slice(0, 3) === "FHB") {
        removeHybridDay(studentID, time).then((data) => {
            if (data.err) {
                log("[addCourse()] : post/removeHybridDay => " + data.err);
            } else {
                log("[addCourse()] : post/removeHybridDay => Success");
                location.reload();
            }
        });
    } else {
        removeStudentCourse(studentID, [courseID]).then((data) => {
            if (data.err) {
                log("[RemoveCourse()] : post/removeStudentCourse => " + data.err);
            } else {
                log("[RemoveCourse()] : post/removeStudentCourse => Success");
                location.reload();
            }
        });
    }
}
/**
 *
 * @param tableInfo
 */
function generateImage(tableInfo) {
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    //gen row
    const grade = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'SAT'];
    const day = ['TUE', 'THU', 'SAT', 'SUN'];
    const time = ['8-10', '10-12', '13-15', '15-17'];
    const tableCl = ['#ff47b2', '#ff47b2', '#ff47b2', '#ff47b2'];
    const border = 'border: 1px solid black;border-collapse: collapse;';
    const levelColor = ['#ff47b2', '#ff47b2', '#ff47b2', '#ff47b2', '#ff47b2', '#ff47b2',
        '#ff47b2', '#ff47b2', '#ff47b2', '#ff47b2', '#ff47b2', '#ff47b2', '#ff47b2'];
    let row1 = '<tr>' + '<th rowspan="2" colspan="2" style="' + border + 'font-size:40px;background-color:' +
        levelColor[1] + '">' + grade[tableInfo.grade - 1] + '</th>' + '<th colspan="2" style="' + border + '">' +
        'ID : ' + tableInfo.id + '</th>' + '<th rowspan="3" colspan="2" style="' + border + 'font-size: 24px">' +
        tableInfo.firstname + tableInfo.nickname + tableInfo.lastname + '</th>' + '<th rowspan="13" style="' + border +
        'width: 5px"></th>' + '<th style="' + border + 'height: 30px;width: 40px;background-color: black"></th>' +
        loop4(1, day, 40, tableCl) + '</tr>';
    let row2 = '<tr>' + '<th rowspan="2" colspan="2" style="' + border + '">' + 'barcode' + '</th>' +
        '<th style="' + border + 'height: 30px">' + time[0] + '</th>' + '</tr>';
    //gen canvas data
    let data =
        '<svg xmlns="http://www.w3.org/2000/svg" width="790" height="560">' +
        '<foreignObject width="100%" height="100%">' +
        '<div xmlns="http://www.w3.org/1999/xhtml">' +
        '<table style="border: 1px solid black;border-collapse: collapse">' +
        row1 + row2 +
        '</table>' +
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
function loop4(type, data, w, color) {
    let text = '';
    if (type === 1) {
        for (let i = 0; i < 4; i++) {
            text += '<th style="border:1px solid black;border-collapse:collapse;width:' + w + 'px;background-color:' + color[i] +
                '">' + data[i] + '</th>';
        }
    } else {
        for (let i = 0; i < 4; i++) {
            text += '<td style="border:1px solid black;border-collapse:collapse;width:' + w + 'px;background-color:' + color[i] +
                '">' + data[i] + '</td>';
        }
    }
    return text;
}