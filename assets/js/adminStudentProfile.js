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
 * Generate element for studentProfile page
 */
function getStudentProfile() {
    putQuarter();

    let cookie = getCookieDict();
    let studentID = cookie.monkeyWebAdminAllstudentSelectedUser;
    document.getElementById("studentID").innerHTML = "ID: " + studentID;
    let selectedValue = cookie.monkeyWebSelectedQuarter

    studentProfile(studentID).then((data) => {
        log("[getStudentProfile()] : post/studentProfile => ");
        log(data);
        // cr
        document.getElementById("studentName").innerHTML = data.firstname + " (" + data.nickname + ") " + data.lastname;
        document.getElementById("studentNameEng").innerHTML = data.firstnameEn + " (" + data.nicknameEn + ") " + data.lastnameEn;
        document.getElementById("studentLevel").innerHTML = "Grade: " + getLetterGrade(data.grade);
        document.getElementById("email").innerHTML = "e-mail: " + data.email;
        document.getElementById("phone").innerHTML = "phone: " + data.phone;
        document.getElementById("studentLevel").innerHTML = "Level: " + data.level;
        // summer
        document.getElementById("summerStudentName").innerHTML = data.firstname + " (" + data.nickname + ") " + data.lastname + " (" + getLetterGrade(data.grade) + ")";
        var summerStage, courseStage;
        for (let i = 0; i < data.quarter.length; i++) {
            log(data.quarter[i]);
            if (data.quarter[i].year === parseInt(cookie.courseQuarter.substring(0, cookie.courseQuarter.indexOf("-"))) &&
                data.quarter[i].quarter === parseInt(cookie.courseQuarter.substring(cookie.courseQuarter.indexOf("-") + 1))) {
                courseStage = data.quarter[i].registrationState;
            }
            if (data.quarter[i].year === parseInt(cookie.summerQuarter.substring(0, cookie.summerQuarter.indexOf("-"))) &&
                data.quarter[i].quarter === parseInt(cookie.summerQuarter.substring(cookie.summerQuarter.indexOf("-") + 1))) {
                summerStage = data.quarter[i].registrationState;
            }
        }
        if (courseStage !== undefined) {
            document.getElementById("studentStateCr").innerHTML = "STAGE CR: " + courseStage;
        }
        if (summerStage !== undefined) {
            document.getElementById("studentStateSm").innerHTML = "STAGE SM: " + summerStage;
            log(summerStage);
            switch (summerStage) {
                case "approved":
                    document.getElementById("approveSummerBtn").className += " disabled";
                    break;
                case "rejected":
                    document.getElementById("rejectSummerBtn").className += " disabled";
                    break;
                case "pending":
                    document.getElementById("approveSummerBtn").className += " disabled";
                    document.getElementById("rejectSummerBtn").className += " disabled";
                    document.getElementById("pendingSummerBtn").className += " disabled";
                    break;
                case "finished":
                    document.getElementById("approveSummerBtn").className += " disabled";
                    document.getElementById("rejectSummerBtn").className += " disabled";
                    document.getElementById("finishedSummerBtn").className += " disabled";
                    break;
                default:
                    break;
            }
        }
        document.getElementById("studentStatus").innerHTML = "STATUS: " + data.status;

        //add student data to modal
        document.getElementById("thNName").value = data.nickname;
        document.getElementById("thName").value = data.firstname;
        document.getElementById("thSName").value = data.lastname;
        document.getElementById("enNName").value = data.nicknameEn;
        document.getElementById("enName").value = data.firstnameEn;
        document.getElementById("enSName").value = data.lastnameEn;
        document.getElementById("classStudent").value = data.grade;
        // document.getElementById("stageStudent").value = data.registrationState;
        document.getElementById("levelStudent").value = data.level;
        document.getElementById("statusStudent").value = data.status;
        document.getElementById("emailStudent").value = data.email;
        document.getElementById("telStudent").value = data.phone;
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
                    let courseTimeID = moment(0).day(time.getDay()).hour(time.getHours()).minute(time.getMinutes()).valueOf();
                    document.getElementById(courseTimeID).innerHTML = course.courseName;
                    document.getElementById(courseTimeID).value = data.courseID[i];
                    document.getElementById(courseTimeID).className = "btn btn-warning col-md-12";
                    name(course.tutor[0]).then(tutorName => {
                        document.getElementById(courseTimeID).innerHTML += " - " + tutorName.nicknameEn;
                    })
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
            log(time.getTime());
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
    let inMath = false, inPhy = false;
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
            let hour = time.getHours();
            if (hour === 9 || hour === 11 || hour === 14 || hour === 16) {
                hour = hour - 1;
            }
            mainTable[getDateName(time.getDay()) + hour] = {};
            mainTable[getDateName(time.getDay()) + hour].courseName = "SKILL " + time.getHours() + ":" +
                ((time.getMinutes() === 0) ? "00" : "30");
            mainTable[getDateName(time.getDay()) + hour].tutor = " ";
        }

        for (let i = 0; i < data.hybridDay.length; i++) {
            let time = new Date(data.hybridDay[i].day);
            mainTable[getDateName(time.getDay()) + time.getHours()] = {};
            mainTable[getDateName(time.getDay()) + time.getHours()].courseName =
                ((data.hybridDay[i].subject === "M") ? "FHB : M" : "FHB : PH");
            mainTable[getDateName(time.getDay()) + time.getHours()].tutor = "Hybrid";
            if (data.hybridDay[i].subject === "M") {
                mathMiniTable[getDateName(time.getDay()) + time.getHours()] = "HB";
                inMath = true;
            } else {
                physicsMiniTable[getDateName(time.getDay()) + time.getHours()] = "HB";
                inPhy = true;
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
                mainTable[getDateName(time.getDay()) + time.getHours()].courseName = "CR : " + data.courseName;
                if (data.tutor[0] === 99000) {
                    if (data.courseName[0] === "M") {
                        mathMiniTable[getDateName(time.getDay()) + time.getHours()] = "CR";
                        inMath = true;
                    } else if (data.courseName[0] === "P") {
                        physicsMiniTable[getDateName(time.getDay()) + time.getHours()] = "CR";
                        inPhy = true;
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
                tableInfo.inMath = inMath;
                tableInfo.inPhy = inPhy;
                log("[generateImageData()] : Generated info => ");
                log(tableInfo);
                barcode(tableInfo);
                if (tableInfo.inPhy && tableInfo.inMath) {
                    $('#phyImg').attr("src", "images/mp" + ((tableInfo.grade > 6) ? 'h' : 'j') + ".png");
                    $('#phy').attr("class", "btn btn-default");
                    $('#phy').prop("disabled", false);
                    generateCover(tableInfo, "phy");
                    $('#mathImg').attr("src", "images/mp" + ((tableInfo.grade > 6) ? 'h' : 'j') + ".png");
                    $('#math').attr("class", "btn btn-default");
                    $('#math').prop("disabled", false);
                    generateCover(tableInfo, "math");
                } else if (tableInfo.inPhy) {
                    $('#phyImg').attr("src", "images/p" + ((tableInfo.grade > 6) ? 'h' : 'j') + ".png");
                    $('#phy').attr("class", "btn btn-default");
                    $('#phy').prop("disabled", false);
                    generateCover(tableInfo, "phy");
                } else if (tableInfo.inMath) {
                    $('#mathImg').attr("src", "images/m" + ((tableInfo.grade > 6) ? 'h' : 'j') + ".png");
                    $('#math').attr("class", "btn btn-default");
                    $('#math').prop("disabled", false);
                    generateCover(tableInfo, "math");
                }
                generateSummerCover();
            });
        });
    });
}

/**
 * Change registration state of user
 * @param registrationState change registration stage of user
 */
function setRegistrationState(registrationState, quarter) {
    let studentID = parseInt(document.getElementById("studentID").innerHTML.slice(4, document.getElementById("studentID").innerHTML.length));
    var quarterObject;
    switch (quarter) {
        case "quarter":
            var selectedQuarter = document.getElementById("courseQuarter");
            var selectedYear = parseInt(selectedQuarter.options[selectedQuarter.selectedIndex].value.substring(0, selectedQuarter.options[selectedQuarter.selectedIndex].value.indexOf("-")));
            var selectedQuarter = parseInt(selectedQuarter.options[selectedQuarter.selectedIndex].value.substring(selectedQuarter.options[selectedQuarter.selectedIndex].value.indexOf("-") + 1));
            // quarterObject = {
            //     "year": selectedYear,
            //     "quarter": selectedQuarter
            // }
            quarterObject = {
                year: 2017,
                quarter: 3
            }
            break;
        case "summer":
            var selectedQuarter = document.getElementById("summerQuarter");
            var selectedYear = parseInt(selectedQuarter.options[selectedQuarter.selectedIndex].value.substring(0, selectedQuarter.options[selectedQuarter.selectedIndex].value.indexOf("-")));
            var selectedQuarter = parseInt(selectedQuarter.options[selectedQuarter.selectedIndex].value.substring(selectedQuarter.options[selectedQuarter.selectedIndex].value.indexOf("-") + 1));
            quarterObject = {
                "year": selectedYear,
                "quarter": selectedQuarter
            }
            break;
        default:
            break;
    }
    log(quarterObject);
    changeRegistrationState(studentID, registrationState, quarterObject).then((data) => {
        if (data.err) {
            log("[setRegistrationState()] : post/changeRegistrationState => " + data.err);
        } else {
            if (quarter !== "summer") {
                if (registrationState === "finished" || registrationState === "pending") acceptReject(registrationState);
                log("[setRegistrationState()] : post/changeRegistrationState => Success");
            } else if (quarter === "summer") {
                if (registrationState === "finished" || registrationState === "pending") acRjSummer(registrationState);
                log("[setRegistrationState()] : post/changeRegistrationState => Success");
            }
        }
        location.reload();
    });
}

//for show profile pic on page
function showProfilePic() {
    let picId = document.getElementById("studentID").innerHTML.slice(4, document.getElementById("studentID").innerHTML.length);
    $.post("post/getConfig").then((config) => {
        //noinspection ES6ModulesDependencies
        $.get(config.profilePicturePath.slice(config.profilePicturePath.search("MonkeyWebData") + 14) + picId + '.jpg', function (data, status) {
            if (status === 'success') {
                $('#profilePic').attr("src", config.profilePicturePath.slice(config.profilePicturePath.search("MonkeyWebData") + 14) + picId + '.jpg');
            }
        });
        //noinspection ES6ModulesDependencies
        $.get(config.profilePicturePath.slice(config.profilePicturePath.search("MonkeyWebData") + 14) + picId + '.jpeg', function (data, status) {
            if (status === 'success') {
                $('#profilePic').attr("src", config.profilePicturePath.slice(config.profilePicturePath.search("MonkeyWebData") + 14) + picId + '.jpeg');
            }
        });
        //noinspection ES6ModulesDependencies
        $.get(config.profilePicturePath.slice(config.profilePicturePath.search("MonkeyWebData") + 14) + picId + '.png', function (data, status) {
            if (status === 'success') {
                $('#profilePic').attr("src", config.profilePicturePath.slice(config.profilePicturePath.search("MonkeyWebData") + 14) + picId + '.png');
            }
        });
    });
}



/**
 * Call when button in table is clicked
 * @param timeID get from id of button
 */
function addRemoveCourse(timeID) {
    let button = document.getElementById(timeID);
    if (button.innerHTML === "Add Course") {
        allCourse().then((data) => {
            log(data);
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

                let time = new Date(parseInt(timeID));
                if (!(time.getDay() === 1)) {
                    select.innerHTML += "<option id='" + time.getTime() + "'>FHB : M</option>";
                    select.innerHTML += "<option id='" + time.getTime() + "'>FHB : PH</option>";
                }

                if (!(time.getDay() === 2 || time.getDay() === 4 || time.getDay() === 1)) {
                    for (let i = 0; i < 4; i++) {
                        select.innerHTML += "<option id='" + time.getTime() + "'>SKILL " + time.getHours() +
                            ((i % 2 === 0) ? ":00" : ":30") + "</option>";
                        time.setMinutes(time.getMinutes() + 30);
                    }
                }
                let promise = [];
                for (let i = 0; i < data.course.length; i++) {
                    let course = data.course[i];
                    let grade = "";
                    if (course.grade[0] > 6) {
                        grade = "S" + course.grade.map((x) => (x - 6)
                        ).join("");
                    } else {
                        grade = "P" + course.grade.join("");
                    }
                    promise.push(name(course.tutor[0]));
                }
                Promise.all(promise).then((allName) => {
                    for (let i = 0; i < data.course.length; i++) {
                        let grade = "";
                        if (data.course[i].grade[0] > 6) {
                            grade = "S" + data.course[i].grade.map((x) => (x - 6)
                            ).join("");
                        } else {
                            grade = "P" + data.course[i].grade.join("");
                        }
                        select.innerHTML += "<option id='" + data.course[i].courseID + "'>" + data.course[i].subject + grade + data.course[i].level +
                            " - " + allName[i].nicknameEn + "</option>";
                    }
                    $("#addModal").modal();
                });
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
 * Edit student info
 */
function editStudent() {
    let studentID = parseInt(document.getElementById("studentID").innerHTML.slice(4, document.getElementById("studentID").innerHTML.length));
    let changeStatus = (userID, status) => $.post("post/changeStatus", {
        userID: userID,
        status: status
    });

    log("Hello World");

    let selectGrade = document.getElementById("classStudent");
    let grade = parseInt(selectGrade.options[selectGrade.selectedIndex].value);
    let level = document.getElementById("levelStudent");
    let selectLevel = level.options[level.selectedIndex].value;
    // let selectStage = document.getElementById("stageStudent");
    // let stage = selectStage.options[selectStage.selectedIndex].value;
    let selectStatus = document.getElementById("statusStudent");
    let status = selectStatus.options[selectStatus.selectedIndex].value;

    $.post("post/editStudent", {
        studentID: studentID,
        firstname: document.getElementById("thName").value,
        lastname: document.getElementById("thSName").value,
        nickname: document.getElementById("thNName").value,
        firstnameEn: document.getElementById("enName").value,
        lastnameEn: document.getElementById("enSName").value,
        nicknameEn: document.getElementById("enNName").value,
        email: document.getElementById("emailStudent").value,
        phone: document.getElementById("telStudent").value,
        level : selectLevel,
        grade: grade
    })
    // .then(() => {
    //     return changeRegistrationState(studentID, stage);
    // })
    .then(() => {
        changeStatus(studentID, status).then((data) => {
            location.reload();
        });
    });
}


function putQuarter() {
    var courseQuarter = document.getElementById("courseQuarter");
    var summerQuarter = document.getElementById("summerQuarter");
    let cookie = getCookieDict();

    position(cookie.monkeyWebUser).then(quarterData => {
        var quaterStatus = "public";
        switch (quarterData.position) {
            case "tutor":
            case "admin":
                quaterStatus = "protected";
                break;
            case "dev":
                quaterStatus = "private";
                break;
        }
        listQuarter(quaterStatus).then(quarterList => {
            courseQuarter.innerHTML = "";
            summerQuarter.innerHTML = "";
            for (let i = 0; i < quarterList.quarter.length; i++) {
                let appendText = "<option value = '" + quarterList.quarter[i].year + "-" + quarterList.quarter[i].quarter + "'>" + quarterList.quarter[i].name + "</option>";
                if (quarterList.quarter[i].quarter < 10) {
                    courseQuarter.innerHTML += appendText;
                } else {
                    summerQuarter.innerHTML += appendText;
                }
            }
            getConfig().then(data => {
                if (cookie.monkeyWebSelectedQuarter === undefined) {
                    courseQuarter.value = data.defaultQuarter.quarter.year + "-" + data.defaultQuarter.quarter.quarter;
                    summerQuarter.value = data.defaultQuarter.summer.year + "-" + data.defaultQuarter.summer.quarter;
                    writeCookie("courseQuarter", data.defaultQuarter.quarter.year + "-" + data.defaultQuarter.quarter.quarter);
                    writeCookie("summerQuarter", data.defaultQuarter.summer.year + "-" + data.defaultQuarter.summer.quarter)
                } else {
                    let selectedQuarter = cookie.monkeyWebSelectedQuarter;
                    if (parseInt(selectedQuarter.substring(selectedQuarter.indexOf("-") + 1)) < 10) {
                        courseQuarter.value = cookie.monkeyWebSelectedQuarter;
                        summerQuarter.value = data.defaultQuarter.summer.year + "-" + data.defaultQuarter.summer.quarter;
                        writeCookie("courseQuarter", cookie.monkeyWebSelectedQuarter);
                        writeCookie("summerQuarter", summerQuarter.value);
                    } else {
                        courseQuarter.value = data.defaultQuarter.quarter.year + "-" + data.defaultQuarter.quarter.quarter;
                        summerQuarter.value = cookie.monkeyWebSelectedQuarter;
                        writeCookie("courseQuarter", data.defaultQuarter.quarter.year + "-" + data.defaultQuarter.quarter.quarter);
                        writeCookie("summerQuarter", cookie.monkeyWebSelectedQuarter);
                    }
                }
            });
        });
    });
}

function quarterChange() {
    log("Hello");
}

//for show receipt pic on page
function showReceipt() {
    let picId = document.getElementById("studentID").innerHTML.slice(4, document.getElementById("studentID").innerHTML.length);
    //noinspection ES6ModulesDependencies
    $.post("post/getConfig").then((config) => {
        //noinspection ES6ModulesDependencies
        $.get(config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60Q3/' + picId + '.jpg', function (data, status) {
            if (status === 'success') {
                $('#imgTrans').attr("src", config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60Q3/' + picId + '.jpg');
            }
        });
        //noinspection ES6ModulesDependencies
        $.get(config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60Q3/' + picId + '.jpeg', function (data, status) {
            if (status === 'success') {
                $('#imgTrans').attr("src", config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60Q3/' + picId + '.jpeg');
            }
        });
        //noinspection ES6ModulesDependencies
        $.get(config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60Q3/' + picId + '.png', function (data, status) {
            if (status === 'success') {
                $('#imgTrans').attr("src", config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60Q3/' + picId + '.png');
            }
        });
        //noinspection ES6ModulesDependencies
        $.get(config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60OCT/' + picId + '.jpg', function (data, status) {
            if (status === 'success') {
                $('#smTrans').attr("src", config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60OCT/' + picId + '.jpg');
            }
        });
        //noinspection ES6ModulesDependencies
        $.get(config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60OCT/' + picId + '.jpeg', function (data, status) {
            if (status === 'success') {
                $('#smTrans').attr("src", config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60OCT/' + picId + '.jpeg');
            }
        });
        //noinspection ES6ModulesDependencies
        $.get(config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60OCT/' + picId + '.png', function (data, status) {
            if (status === 'success') {
                $('#smTrans').attr("src", config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + 'CR60OCT/' + picId + '.png');
            }
        });
    });
}

function barcode(tableInfo) {
    const code = tableInfo.id;
    JsBarcode("#mathBarcode", code + '1', {
        lineColor: "black",
        width: 3.4,
        height: 68,
        displayValue: false
    });
    JsBarcode("#phyBarcode", code + '2', {
        lineColor: "black",
        width: 3.4,
        height: 68,
        displayValue: false
    });
}
// gen accept or reject img for CR
function acceptReject(state) {
    let studentID = document.getElementById("studentID").innerHTML.slice(4, document.getElementById("studentID").innerHTML.length);
    let cfCanvas = document.getElementById('appRej');
    let ctxCf = cfCanvas.getContext('2d');
    let canvas1 = document.getElementById('mathCanvas');
    let img = document.getElementById('imgTrans');
    ctxCf.fillStyle = "white";
    ctxCf.fillRect(0, 0, cfCanvas.width, cfCanvas.height);
    if (state === 'pending') {
        ctxCf.save();
        ctxCf.drawImage(canvas1, 0, -100);
        ctxCf.drawImage(img, 90, 70, 220, 165);
        ctxCf.rotate(11 * Math.PI / 6);
        ctxCf.font = "bold 55px Cordia New";
        ctxCf.fillStyle = "orange";
        ctxCf.textAlign = 'center';
        ctxCf.fillText('Pending กรุณาติดต่อครูแมว', 150, 340);
        ctxCf.restore();
    } else if (state === 'registered') {
        ctxCf.save();
        ctxCf.drawImage(canvas1, 0, -100);
        ctxCf.drawImage(img, 90, 70, 220, 165);
        ctxCf.rotate(11 * Math.PI / 6);
        ctxCf.font = "bold 90px Cordia New";
        ctxCf.fillStyle = "green";
        ctxCf.textAlign = 'center';
        ctxCf.fillText('Approved', 150, 340);
        ctxCf.restore();
    }
    let dlImg = cfCanvas.toDataURL();
    let aref = document.createElement('a');
    aref.href = dlImg;
    aref.download = studentID + state + '.png';
    document.body.appendChild(aref);
    aref.click();
}
// gen accept or reject for SM
function acRjSummer(state) {
    let studentID = document.getElementById("studentID").innerHTML.slice(4, document.getElementById("studentID").innerHTML.length);
    let canvas = document.getElementById('acRjSummerCanvas');
    let ctx = canvas.getContext('2d');
    let img1 = document.getElementById('summerReceiptTableImg');
    let img2 = document.getElementById('smTrans');
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.drawImage(img1, Math.abs(img1.width / img1.height * canvas.height - canvas.width) / 2, 0, img1.width / img1.height * canvas.height, canvas.height);
    ctx.drawImage(img2, (canvas.width - img2.width / img2.height * 230) / 2, 220, img2.width / img2.height * 230, 230);
    ctx.font = "bold 24px Cordia New";
    ctx.fillStyle = "black";
    ctx.fillText(($("#-255600000").html() === "Add Course") ? "" : $("#-255600000").html(), 200, 75);
    ctx.fillText(($("#-248400000").html() === "Add Course") ? "" : $("#-248400000").html(), 200, 125);
    ctx.fillText(($("#-237600000").html() === "Add Course") ? "" : $("#-237600000").html(), 200, 175);
    ctx.font = "bold 90px Cordia New";
    ctx.textAlign = 'center';
    ctx.fillStyle = (state == "finished") ? "green" : "red";
    ctx.rotate(11 * Math.PI / 6);
    ctx.fillText((state == "finished") ? "FINISHED" : "PENDING", 160, 400);
    ctx.restore();
    let dlImg = canvas.toDataURL();
    let aref = document.createElement('a');
    aref.href = dlImg;
    aref.download = studentID + state + '(CR60OCT).png';
    document.body.appendChild(aref);
    aref.click();
}
// upload profile picture
function upPic() {
    //noinspection JSUnresolvedVariable
    let ID = document.getElementById("studentID").innerHTML.slice(4, document.getElementById("studentID").innerHTML.length);
    let ufile = $('#file-1');
    let ext = ufile.val().split('.').pop().toLowerCase();
    if ($.inArray(ext, ['png', 'jpg', 'jpeg']) === -1) {
        alert('กรุณาอัพไฟล์ .jpg, .jpeg หรือ .png เท่านั้น');
    } else {
        let files = ufile.get(0).files;
        let formData = new FormData();
        formData.append('file', files[0], files[0].name);
        formData.append('userID', ID);
        $.ajax({
            url: 'post/updateProfilePicture',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                showProfilePic();
                $('#profileModal').modal('hide');
            }
        });
    }
}
// upload receipt
function upReciept(quarter) {
    //noinspection JSUnresolvedVariable
    let ID = document.getElementById("studentID").innerHTML.slice(4, document.getElementById("studentID").innerHTML.length);
    let ufile = ((quarter === "quarter") ? $('#file-2') : $('#file-3'));
    let ext = ufile.val().split('.').pop().toLowerCase();
    if ($.inArray(ext, ['png', 'jpg', 'jpeg']) === -1) {
        alert('กรุณาอัพไฟล์ .jpg, .jpeg หรือ .png เท่านั้น');
    } else {
        let files = ufile.get(0).files;
        let formData = new FormData();
        formData.append('file', files[0], files[0].name);
        formData.append('studentID', ID);
        formData.append('quarter', quarter);
        $.ajax({
            url: 'post/submitReceipt',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                $('#rcModal').modal('hide');
                location.reload();
            }
        });
    }
}
function generateCover(tableInfo, subj) {
    const grade = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'SAT'];
    let canvasID = subj + 'Canvas';
    let canvas = document.getElementById(canvasID);
    let ctx = canvas.getContext('2d');
    //add Table BG
    let img = document.getElementById(subj + 'Img');
    ctx.drawImage(img, 0, 0, 1654, 1170);
    //add Level
    ctx.font = "100px Oxygen";
    ctx.fillText(grade[tableInfo.grade - 1], 50, 128);
    //add barcode
    let canvas2 = document.getElementById(subj + 'Barcode');
    ctx.drawImage(canvas2, 418, 115);
    //add profilePic
    let profile = document.getElementById('profilePic');
    let picH = 184;
    let picW = profile.width * picH / profile.height;
    ctx.drawImage(profile, 205, 30, picW, picH);
    //add ID
    ctx.font = "bold 40px Taviraj";
    if (subj === "math") {
        ctx.fillText("ID: " + tableInfo.id + "1", 445, 84);
    } else {
        ctx.fillText("ID: " + tableInfo.id + "2", 445, 84);
    }
    //add Name
    let name1 = ((tableInfo.firstname + tableInfo.nickname).length > 18) ? tableInfo.firstname : tableInfo.firstname + ' (' + tableInfo.nickname + ')';
    let name2 = ((tableInfo.firstname + tableInfo.nickname).length > 18) ? '(' + tableInfo.nickname + ') ' + tableInfo.lastname : tableInfo.lastname;
    ctx.font = "bold 52px Trirong";
    ctx.textAlign = "center";
    ctx.fillText(name1, 930, 94);
    ctx.fillText(name2, 930, 174);
    //add smallTable data & mainTable data
    ctx.textBaseline = "middle";
    const dayS = ['TUE', 'THU', 'SAT', 'SUN'];
    const timeS = ['8', '10', '13', '15', "17"];
    const miniW = [1342, 1420, 1498, 1576];
    const miniH = [144, 218, 292, 366, 440];
    const mainW = [324, 568, 812, 1056];
    const mainCrH = [386, 514, 642, 770, 898];
    const mainTutorH = [448, 576, 704, 832, 960];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 5; j++) {
            ctx.font = "bold 28px Taviraj";
            if (subj === 'math') {
                if (tableInfo.mathMiniTable[dayS[i] + timeS[j]] !== undefined) {
                    ctx.fillText(tableInfo.mathMiniTable[dayS[i] + timeS[j]], miniW[i], miniH[j])
                }
            } else {
                if (tableInfo.physicsMiniTable[dayS[i] + timeS[j]] !== undefined) {
                    ctx.fillText(tableInfo.physicsMiniTable[dayS[i] + timeS[j]], miniW[i], miniH[j])
                }
            }
            ctx.font = "bold 36px Taviraj";
            let dayM = dayS[i] + timeS[j];
            if (tableInfo.mainTable[dayM] !== undefined) {
                let str = Object.values(tableInfo.mainTable[dayM])[0];
                str = str.replace("PH", "Ph");
                str = str.replace("CH", "Ch");
                str = str.replace("SCI", "Sci");
                ctx.fillText(str, mainW[i], mainCrH[j]);
                if (Object.values(tableInfo.mainTable[dayM])[1] === "Hybrid") {
                    ctx.fillText("HB", mainW[i], mainTutorH[j]);
                } else ctx.fillText(Object.values(tableInfo.mainTable[dayM])[1], mainW[i], mainTutorH[j]);
            }
        }
    }
}
function generateSummerCover() {
    let canvasID = 'summerCanvas';
    let canvas = document.getElementById(canvasID);
    let ctx = canvas.getContext('2d');
    //add Table BG
    let img1 = document.getElementById('summerImg');
    ctx.drawImage(img1, 0, 0, 622, 880);
    ctx.fillStyle = "black";
    ctx.font = "bold 40px Cordia New";
    let ID = $("#studentID").html().slice(4, 9);
    ctx.fillText(ID, 525, 45);
    let name = $("#studentName").html().slice(0, $("#studentName").html().indexOf(")") + 1);
    ctx.textAlign = "right";
    ctx.fillText(name, 595, 85);
    ctx.textAlign = "left";
    ctx.fillText(($("#-255600000").html() === "Add Course") ? "" : $("#-255600000").html(), 200, 130);
    ctx.fillText(($("#-248400000").html() === "Add Course") ? "" : $("#-248400000").html(), 200, 180);
    ctx.fillText(($("#-237600000").html() === "Add Course") ? "" : $("#-237600000").html(), 200, 230);
    ctx.font = "bold 32px Cordia New";
    $.post("post/listStudentAttendanceModifierByStudent", { studentID: ID, start: moment("10-09-2017 8:00", "MM-DD-YYYY HH:mm").valueOf() }).then((data) => {
        var numAbs = 0;
        var oldDay = moment("10-08-2017", "MM-DD-YYYY");
        var numPre = 0;
        for (let i = 0; i < data.modifier.length; i++) {
            let day = moment(data.modifier[i].day);
            if (data.modifier[i].reason === "ลา") {
                if (day.date() !== oldDay.date()) {
                    let text = ((day.date() < 10) ? "0" + day.date() : day.date()) + "  " + (day.month() + 1) + "   " + (day.year() - 1957);
                    ctx.fillText(text, 48, 355 + (35 * numAbs));
                    switch (day.hour()) {
                        case 8:
                            ctx.fillText("✓", 180, 360 + (35 * numAbs));
                            break;
                        case 10:
                            ctx.fillText("✓", 225, 360 + (35 * numAbs));
                            break;
                        case 13:
                            ctx.fillText("✓", 270, 360 + (35 * numAbs));
                            break;
                        default:
                            break;
                    };
                    oldDay = day;
                    numAbs += 1;
                } else {
                    switch (day.hour()) {
                        case 8:
                            ctx.fillText("✓", 180, 360 + (35 * (numAbs - 1)));
                            break;
                        case 10:
                            ctx.fillText("✓", 225, 360 + (35 * (numAbs - 1)));
                            break;
                        case 13:
                            ctx.fillText("✓", 270, 360 + (35 * (numAbs - 1)));
                            break;
                        default:
                            break;
                    };
                }
            } else if (data.modifier[i].reason === "เพิ่ม") {
                // log("present")
                let text = ((day.date() < 10) ? "0" + day.date() : day.date()) + "  " + (day.month() + 1) + "   " + (day.year() - 1957);
                ctx.fillText(text, 323, 355 + (35 * numPre));
                numPre += 1;
            }
        }
    })
}
function showComment() {
    let ID = document.getElementById("studentID").innerHTML.slice(4, document.getElementById("studentID").innerHTML.length);
    $comment = $("#comment");
    $("#comment").empty();
    $comment.append("<a id='showAll' onClick='showAllComment()'>Click here to see all comment</a>");
    $.post('post/listStudentCommentByStudent', { studentID: ID, limit: 10 }).then((cm) => {
        getName(cm, 0);
    })
}
function showAllComment() {
    let ID = document.getElementById("studentID").innerHTML.slice(4, document.getElementById("studentID").innerHTML.length);
    $comment = $("#comment");
    $("#comment").empty();
    $comment.append("<a id='showSome' onClick='showComment()'>Click here to hide comment</a>");
    $.post('post/listStudentCommentByStudent', { studentID: ID }).then((cm) => {
        getName(cm, 0);
    })
}
function getName(cm, i) {
    $.post('post/name', { userID: cm.comment[i].tutorID }).then((name) => {
        let day = moment(cm.comment[i].timestamp, "x").format("DD MMM");
        let str = "<h4>"
            + "<span class='glyphicon glyphicon-pushpin'" + (cm.comment[i].priority > 0 ? "style='color:red'" : "style='color:silver'") + "onClick='pin(\"" + cm.comment[i].commentID + "\"," + (cm.comment[i].priority > 0 ? 0 : 1) + ");'></span>"
            + "<span class='glyphicon glyphicon-ok'" + (cm.comment[i].isCleared ? "style='color:green'" : "style='color:silver'") + "onClick='clearComm(\"" + cm.comment[i].commentID + "\"," + (cm.comment[i].isCleared ? 0 : 1) + ");'></span>"
            + name.nickname + " (" + day + ") "
            + "<span class='glyphicon glyphicon-trash' style='color:red' onClick='rmComm(\"" + cm.comment[i].commentID + "\");'></span>"
            + "</h4>"
        $("#comment").append(str);
        $("#comment").append("<p> " + cm.comment[i].message + "</p>");
        if (cm.comment[i].hasAttachment) {
            $.post('post/getConfig').then((config) => {
                let path = config.studentCommentPicturePath;
                path = path.slice(path.search("MonkeyWebData") + 14) + cm.comment[i].commentID;
                $.get(path + ".jpg").done(function (result) {
                    $("#comment").append("<div class='row'><img class='col-sm-4 col-xs-10' src='" + path + ".jpg" + "' class='img-thumbnail'></div>");
                    if (i < cm.comment.length - 1) getName(cm, i + 1)
                }).fail(function () {
                    $.get(path + ".jpeg").done(function (result) {
                        $("#comment").append("<div class='row'><img class='col-sm-4 col-xs-10' src='" + path + ".jpeg" + "' class='img-thumbnail'></div>");
                        if (i < cm.comment.length - 1) getName(cm, i + 1)
                    }).fail(function () {
                        $.get(path + ".png").done(function (result) {
                            $("#comment").append("<div class='row'><img class='col-sm-4 col-xs-10' src='" + path + ".png" + "' class='img-thumbnail'></div>");
                            if (i < cm.comment.length - 1) getName(cm, i + 1)
                        }).fail(function () {
                            if (i < cm.comment.length - 1) getName(cm, i + 1)
                        });
                    });
                });
            })
        }
        else if (i < cm.comment.length - 1) getName(cm, i + 1)
    })
}
// for clear/unclear comment
function clearComm(commID, val) {
    $.post('post/clearStudentComment', { commentID: commID, isCleared: val }).then((data) => {
        showComment();
    })
}
// for pin/unpin comment
function pin(commID, val) {
    $.post('post/changeStudentCommentPriority', { commentID: commID, priority: val }).then((data) => {
        showComment();
    })
}
// for remove comment
function rmComm(commID) {
    if (confirm("ต้องการลบ comment นี้") === true) {
        $.post('post/removeStudentComment', { commentID: commID }).then((data) => {
            showComment();
        })
    }
}