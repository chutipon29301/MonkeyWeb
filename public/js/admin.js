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
            log("[getAllCourseContent()] : post/allCourse => " + data.err);
        } else {
            log("[getAllCourseContent()] : post/allCourse => ");
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

/**
 * Generate tableInfo object 
 */
function generateImageData() {
    let studentID = parseInt(document.getElementById("studentID").innerHTML.slice(4, document.getElementById("studentID").innerHTML.length));
    let tableInfo = {
        "id": "" + studentID
    };
    let mainTable = {}, mathMiniTable = {}, physicsMiniTable = {};
    studentProfile(studentID).then((data) => {
        tableInfo.firstname = data.firstname;
        tableInfo.lastname = data.lastname;
        tableInfo.nickname = data.nickname;
        tableInfo.grade = "" + data.grade;

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

        tableInfo.mathMiniTable = mathMiniTable;
        tableInfo.physicsMiniTable = physicsMiniTable;
        return data.courseID;
    }).then((courseID) => {
        let promise = [];
        for (let i = 0; i < courseID.length; i++) {
            promise.push(courseInfo(courseID[i]));
        }
        Promise.all(promise).then((value) => {
            let tutorName = [];
            let dataArray = [];
            for (let i = 0; i < value.length; i++) {
                let data = value[i];
                dataArray.push(data);
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
                tutorName.push(name(data.tutor[0]));
            }
            Promise.all(tutorName).then((allName) => {
                log(allName.length);
                for (let i = 0; i < allName.length; i++) {
                    let name = allName[i];
                    let time = new Date(dataArray[i].day);
                    mainTable[getDateName(time.getDay()) + time.getHours()].tutor = name.nicknameEn;
                }
            }).then(() => {
                tableInfo.mainTable = mainTable;
                log("[generateImageData()] : Generated info => ");
                log(tableInfo);
                showReceipt(tableInfo);
                generateImage(tableInfo, 'math');
                generateImage(tableInfo, 'phy');
            });
        });
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
    log(button.innerHTML === "Add Course");
    if (button.innerHTML === "Add Course") {
        allCourse.then((data) => {
            if (data.err) {
                log("[addRemoveCourse()] : post/allCourse => " + data.err);
            } else {
                let localTime = new Date(parseInt(timeID));
                //noinspection ES6ModulesDependencies,JSUnresolvedFunction
                let serverTime = moment(0).day((localTime.getDay() === 0) ? 7 : localTime.getDay()).hour(localTime.getHours()).valueOf();
                //noinspection JSUndefinedPropertyAssignment
                data.course = data.course.filter(data => data.day === parseInt(serverTime));
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

                if (!(time.getDay() === 2 || time.getDay() === 4)) {
                    for (let i = 0; i < 4; i++) {
                        select.innerHTML += "<option id='" + time.getTime() + "'>SKILL " + time.getHours() +
                            ((i % 2 === 0) ? ":00" : ":30") + "</option>";
                        time.setMinutes(time.getMinutes() + 30);
                    }
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
 * @param subj
 */
function generateImage(tableInfo, subj) {
    let canvasID = subj + 'Canvas';
    let canvas = document.getElementById(canvasID);
    let ctx = canvas.getContext('2d');
    //gen row
    const grade = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'SAT'];
    const day = ['TUE', 'THU', 'SAT', 'SUN'];
    const time = ['8-10', '10-12', '13-15', '15-17', '17-19'];
    const tableCl = ['#ff47b2', '#ffa133', '#9645cf', '#ff2e2e'];
    const whtCl = ['#ffffff', '#ffffff', '#ffffff', '#ffffff'];
    const borderB = 'border: 1px solid black;border-collapse: collapse;';
    const borderG = 'border-bottom: 1px solid grey;border-right: 1px solid black;border-collapse: collapse;';
    const levelColor = ['#ff47b2', '#ff47b2', '#ff47b2', '#ff47b2', '#ff47b2', '#ff47b2',
        '#ff47b2', '#ff47b2', '#ff47b2', '#ff47b2', '#ff47b2', '#ff47b2', '#ff47b2'];
    const miniT = ['8', '10', '13', '15', '17'];
    let mini = {
        math8: [],
        math10: [],
        math13: [],
        math15: [],
        math17: [],
        phy8: [],
        phy10: [],
        phy13: [],
        phy15: [],
        phy17: []
    };
    log(tableRow(2, tableInfo, day, '8'));
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 4; j++) {
            if (tableInfo.mathMiniTable[day[j] + miniT[i]] !== undefined) {
                mini['math' + miniT[i]][j] = tableInfo.mathMiniTable[day[j] + miniT[i]];
            } else mini['math' + miniT[i]][j] = '';
            if (tableInfo.physicsMiniTable[day[j] + miniT[i]] !== undefined) {
                mini['phy' + miniT[i]][j] = tableInfo.physicsMiniTable[day[j] + miniT[i]];
            } else mini['phy' + miniT[i]][j] = '';
        }
    }
    let row1 = '';
    if (canvasID === 'mathCanvas') {
        row1 += '<tr>' + '<th rowspan="2" colspan="2" style="' + borderB + 'font-size:40px;background-color:' +
            levelColor[1] + '">' + grade[tableInfo.grade - 1] + '</th>' + '<th colspan="2" style="' + borderB + '">' +
            'ID : ' + tableInfo.id + '1</th>' + '<th rowspan="3" colspan="2" style="' + borderB + 'font-size: 24px">' +
            tableInfo.firstname + ' (' + tableInfo.nickname + ')' + tableInfo.lastname + '</th>' +
            '<th rowspan="15" style="' + borderB + 'width: 5px"></th>' + '<th style="' + borderB +
            'height: 30px;width: 40px;background-color: black"></th>' + loop4(1, 1, day, 40, tableCl, borderB) + '</tr>';
    } else {
        row1 += '<tr>' + '<th rowspan="2" colspan="2" style="' + borderB + 'font-size:40px;background-color:' +
            levelColor[1] + '">' + grade[tableInfo.grade - 1] + '</th>' + '<th colspan="2" style="' + borderB + '">' +
            'ID : ' + tableInfo.id + '2</th>' + '<th rowspan="3" colspan="2" style="' + borderB + 'font-size: 24px">' +
            tableInfo.firstname + ' (' + tableInfo.nickname + ')' + tableInfo.lastname + '</th>' +
            '<th rowspan="15" style="' + borderB + 'width: 5px"></th>' + '<th style="' + borderB +
            'height: 30px;width: 40px;background-color: black"></th>' + loop4(1, 1, day, 40, tableCl, borderB) + '</tr>';
    }

    let row2 = '<tr>' + '<th rowspan="2" colspan="2" style="' + borderB + '">' + 'BARCODE' + '</th>' +
        '<th style="' + borderB + 'height: 30px">' + time[0] + '</th>' + loop4(2, 1, mini[subj + '8'], 40, whtCl, borderB) + '</tr>';
    let row3 = '<tr>' + '<th style="' + borderB + 'width: 40px;background-color: #ffc107;color: white">' + 'M' + '</th>' +
        '<th style="' + borderB + 'width: 40px;background-color: #9c27b0;color: white">' + 'P' + '</th>' +
        '<th style="' + borderB + 'height: 30px">' + time[1] + '</th>' + loop4(2, 1, mini[subj + '10'], 40, whtCl, borderB) + '</tr>';
    let row4 = '<tr>' + '<th rowspan="2" colspan="2" style="' + borderB + 'background-color: black"></th>' +
        loop4(1, 2, day, 120, tableCl, borderB) + '<th style="' + borderB + 'height: 30px">' + time[2] + '</th>' +
        loop4(2, 1, mini[subj + '13'], 40, whtCl, borderB) + '</tr>';
    let row5 = '<tr>' + '<th style="' + borderB + 'height: 30px">' + time[3] + '</th>' + loop4(2, 1, mini[subj + '15'], 40, whtCl, borderB) + '</tr>';
    let row6 = '<tr>' + '<th rowspan="2" colspan="2" style="' + borderB + 'height: 60px">' + time[0] + '</th>' +
        loop4(2, 1, tableRow(1, tableInfo, day, '8'), 120, whtCl, borderG) + '<th style="' + borderB + 'height: 30px">'
        + time[4] + '</th>' + loop4(2, 1, mini[subj + '17'], 40, whtCl, borderB) + '</tr>';
    let row7 = '<tr>' + loop4(2, 1, tableRow(2, tableInfo, day, '8'), 120, whtCl, borderB) + '<th rowspan="2" colspan="5" style="' + borderB +
        'background-color: yellow">Note : </th>' + '</tr>';
    let row8 = '<tr>' + '<th rowspan="2" colspan="2" style="' + borderB + 'height: 60px">' + time[1] + '</th>' +
        loop4(2, 1, tableRow(1, tableInfo, day, '10'), 120, whtCl, borderG) + '</tr>';
    let row9 = '<tr>' + loop4(2, 1, tableRow(2, tableInfo, day, '10'), 120, whtCl, borderB) +
        '<th rowspan="7" colspan="5" style="' + borderB + '"></th>' + '</tr>';
    let row10 = '<tr>' + '<th rowspan="2" colspan="2" style="' + borderB + 'height: 60px">' + time[2] + '</th>' +
        loop4(2, 1, tableRow(1, tableInfo, day, '13'), 120, whtCl, borderG) + '</tr>';
    let row11 = '<tr>' + loop4(2, 1, tableRow(2, tableInfo, day, '13'), 120, whtCl, borderB) + '</tr>';
    let row12 = '<tr>' + '<th rowspan="2" colspan="2" style="' + borderB + 'height: 60px">' + time[3] + '</th>' +
        loop4(2, 1, tableRow(1, tableInfo, day, '15'), 120, whtCl, borderG) + '</tr>';
    let row13 = '<tr>' + loop4(2, 1, tableRow(2, tableInfo, day, '15'), 120, whtCl, borderB) + '</tr>';
    let row14 = '<tr>' + '<th rowspan="2" colspan="2" style="' + borderB + 'height: 60px">' + time[4] + '</th>' +
        loop4(2, 1, tableRow(1, tableInfo, day, '17'), 120, whtCl, borderG) + '</tr>';
    let row15 = '<tr>' + loop4(2, 1, tableRow(2, tableInfo, day, '17'), 120, whtCl, borderB) + '</tr>';
    //gen canvas data
    let data =
        '<svg xmlns="http://www.w3.org/2000/svg" width="790" height="480">' +
        '<foreignObject width="100%" height="100%">' +
        '<div xmlns="http://www.w3.org/1999/xhtml">' +
        '<table style="border: 1px solid black;border-collapse: collapse">' +
        row1 + row2 + row3 + row4 + row5 + row6 + row7 + row8 + row9 + row10 + row11 + row12 + row13 + row14 + row15 +
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
    barcode(tableInfo);
}
//function for generate duplicate 4 row table with a data in each row
function loop4(type, row, data, w, color, border) {
    let text = '';
    if (row > 1) {
        if (type === 1) {
            for (let i = 0; i < 4; i++) {
                text += '<th rowspan="' + row + '" style="' + border + 'text-align:center;width:' + w + 'px;background-color:' + color[i] +
                    '">' + data[i] + '</th>';
            }
        } else {
            for (let i = 0; i < 4; i++) {
                text += '<td rowspan="' + row + '" style="' + border + 'text-align:center;width:' + w + 'px;background-color:' + color[i] +
                    '">' + data[i] + '</td>';
            }
        }
    } else {
        if (type === 1) {
            for (let i = 0; i < 4; i++) {
                text += '<th style="' + border + 'text-align:center;width:' + w + 'px;background-color:' + color[i] +
                    '">' + data[i] + '</th>';
            }
        } else {
            for (let i = 0; i < 4; i++) {
                text += '<td style="' + border + 'text-align:center;width:' + w + 'px;background-color:' + color[i] +
                    '">' + data[i] + '</td>';
            }
        }
    }
    return text;
}

//for create data in a row of table from course data
function tableRow(type, tableInfo, day, time) {
    log(tableInfo);
    var size = Object.keys(tableInfo.mainTable).length;
    log(size);
    log(tableInfo.mainTable);
    let cookieKeys = Object.keys(tableInfo.mainTable);
    log(cookieKeys);
    let tableRow = ['', '', '', ''];
    for (let i = 0; i < 4; i++) {
        log(day[i] + time);
        log(tableInfo.mainTable[day[i] + time]);
        if (tableInfo.mainTable[day[i] + time] !== undefined) {
            if (type === 1) {
                tableRow[i] = tableInfo.mainTable[day[i] + time].courseName;
            } else tableRow[i] = tableInfo.mainTable[day[i] + time].tutor;
        }
    }
    return tableRow;
}

//for show receipt pic on page
function showReceipt(tableInfo) {
    let picId = tableInfo.id;
    $.get('pic/CR60Q3/15999.jpg', function (data, status) {
        if (status === 'success') {
            $('#imgTrans').attr("src", "pic/CR60Q3/" + picId + '.jpg');
        }
    });
    $.get('pic/CR60Q3/15999.jpeg', function (data, status) {
        if (status === 'success') {
            $('#imgTrans').attr("src", "pic/CR60Q3/" + picId + '.jpeg');
        }
    });
    $.get('pic/CR60Q3/15999.png', function (data, status) {
        if (status === 'success') {
            $('#imgTrans').attr("src", "pic/CR60Q3/" + picId + '.png');
        }
    });
}
function barcode(tableInfo) {
    const code = tableInfo.id;
    JsBarcode("#mathBarcode", code + '1', {
        lineColor: "black",
        width: 2,
        height: 40,
        displayValue: false
    });
    JsBarcode("#phyBarcode", code + '2', {
        lineColor: "black",
        width: 2,
        height: 40,
        displayValue: false
    });
}
function combineCanvas(subj) {
    let canvas = document.getElementById('combine');
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let canvas1 = document.getElementById(subj + 'Canvas');
    let canvas2 = document.getElementById(subj + 'Barcode');
    ctx.drawImage(canvas1, 0, 0);
    ctx.drawImage(canvas2, 120, 37);
}