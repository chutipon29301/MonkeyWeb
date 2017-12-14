//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const allStudent = () => $.post("post/allStudent", {});

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const allCourse = () => $.post("/post/allCourse", {
    quarter: "all"
});

const allCourseV1 = (year, quarter) => $.post("post/v1/allCourse", {
    year: year,
    quarter: quarter
});

const listStudentHybrid = (year, quarter, studentID) => $.post("post/v1/listStudentHybrid", {
    year: year,
    quarter: quarter,
    studentID: studentID
})

const listStudentSkill = (year, quarter, studentID) => $.post("post/v1/listStudentSkill", {
    year: year,
    quarter: quarter,
    studentID: studentID
})

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const studentProfile = (studentID) => $.post("post/studentProfile", {
    studentID: studentID
});

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const courseInfo = (courseID) => $.post("post/courseInfo", {
    courseID: courseID
});

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const name = (userID) => $.post("post/name", {
    userID: userID
});

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const position = (userID) => $.post("/post/position", {
    userID: userID
});

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const changeRegistrationState = (studentID, registrationState, quarter) => {
    if (quarter === undefined) {
        return $.post("post/changeRegistrationState", {
            studentID: studentID,
            registrationState: registrationState,
            quarter: quarter
        });
    } else {
        return $.post("post/changeRegistrationState", {
            studentID: studentID,
            registrationState: registrationState,
            year: quarter.year,
            quarter: quarter.quarter
        });
    }
}

const lineNotify = (recipient, message) => $.post("post/lineNotify", {
    recipient: recipient,
    message: message
});

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const addSkillStudent = (skillID, studentID, subject) => $.post("post/v1/addSkillStudent", {
    skillID: skillID,
    studentID: studentID,
    subject: subject
});

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const addHybridStudent = (hybridID, studentID, subject) => $.post("post/v1/addHybridStudent", {
    hybridID: hybridID,
    studentID: studentID,
    subject: subject
});

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const addStudentCourse = (studentID, courseID) => $.post("post/addStudentCourse", {
    studentID: studentID,
    courseID: courseID
});

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const removeStudentCourse = (studentID, courseID) => $.post("post/removeStudentCourse", {
    studentID: studentID,
    courseID: courseID
});

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const removeHybridStudent = (studentID, hybridID) => $.post("post/v1/removeHybridStudent", {
    studentID: studentID,
    hybridID: hybridID
});

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const removeSkillStudent = (studentID, skillID) => $.post("post/v1/removeSkillStudent", {
    studentID: studentID,
    skillID: skillID
});

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const registrationState = (studentID, quarter, year) => {
    if (quarter === undefined) {
        return $.post("post/registrationState", {
            studentID: studentID
        });
    } else {
        return $.post("post/registrationState", {
            studentID: studentID,
            quarter: quarter,
            year: year
        });
    }
}

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const getConfig = () => $.post("post/getConfig", {});

const listQuarter = (status) => $.post("post/listQuarter", {
    status: status
});
const logMoment = (moment) => {
    log(moment.format("DD/MM/YYYY HH:mm:ss"));
}
/**
 * Use to log text to console
 * @param text text to be log in console
 */
function log(text) {
    "use strict";
    console.log(text);
}
/**
 * Add variable to document.cookie
 * @param key variable name to be added
 * @param value variable value
 */
function writeCookie(key, value) {
    "use strict";
    document.cookie = key + "=" + value;
    log("[writeCookie()] -> " + key + " wrote");
}

/**
 * Delete variable from document.cookie
 * @param key variable name to be deleted
 */
function deleteCookie(key) {
    "use strict";
    document.cookie = key + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    log("[deleteCookie()] -> " + key + " deleted");
}

/**
 * Generate object of document.cookie
 * @return {object} object of document.cookie
 */
function getCookieDict() {
    "use strict";
    //noinspection SpellCheckingInspection
    let allcookies = document.cookie;
    let obj = {};
    //noinspection SpellCheckingInspection
    let cookiearray = allcookies.split('; ');
    for (let i = 0; i < cookiearray.length; i++) {
        obj[cookiearray[i].split('=')[0]] = cookiearray[i].split('=')[1];
    }
    return obj;
}

/**
 * Logout current user
 */
function logout() {
    "use strict";
    log("[Logout()] : redirection to login page");
    clearAllCookie();
    self.location = "/";
}

/**
 * Set student name to navigation bar
 */
/* function setStudentNavName() {
    "use strict";
    let cookie = getCookieDict();
    //noinspection JSUnresolvedVariable
    name(cookie.monkeyWebUser).then((data) => {
        if (data.err) {
            document.getElementById("navStudentName").innerHTML = " ";
            log("[setStudentNavName()] => Set student name in navigation bar to :  ");
        } else {
            document.getElementById("studentNavNameSmall").innerHTML = data.firstname;
            document.getElementById("studentNavNameLarge").innerHTML = data.firstname;
            log("[setStudentNavName()] => Set student name in navigation bar to : " + data.firstname);
        }
    });
} */

/**
 * Delete all cookies in browser
 */
function clearAllCookie() {
    log("[clearAllCookie()] is called");
    let cookieKeys = Object.keys(getCookieDict());
    for (let i = 0; i < cookieKeys.length; i++) {
        deleteCookie(cookieKeys[i]);
    }
}

/**
 * Load registration page from status of student
 */
function loadRegistrationPage() {
    let cookie = getCookieDict();
    registrationState(cookie.monkeyWebUser, 1, 2018).then((data) => {
        if (data.err) {
            log("[loadRegistrationPage()] : post/registrationState => " + data.err);
        } else {
            log("[loadRegistrationPage()] : post/registrationState =>");
            log(data);
            switch (data.registrationState) {
                case "unregistered":
                case "rejected":
                    log("[loadRegistrationPage()] : redirection to registrationCourse");
                    self.location = "/regisPage";
                    break;
                case "untransferred":
                    log("[loadRegistrationPage()] : redirection to registrationReceipt");
                    self.location = "/registrationReceipt";
                    break;
                case "pending":
                case "approved":
                case "transferred":
                case "registered":
                    log("[loadRegistrationPage()] : redirection to studentProfile");
                    self.location = "/studentProfile";
                    break;
                default:
                    break;
            }
        }
    });
}

/**
 * Load registration page for summer
 */
function loadSummerRegistrationPage() {
    let cookie = getCookieDict();
    registrationState(cookie.monkeyWebUser, "summer").then(data => {
        log(data);
        if (data.err) {
            log("[loadSummerRegistrationPage()] : post/registrationState => " + data.err);
        } else {
            log("[loadSummerRegistrationPage()] : post/registrationState =>");
            log(data);
            switch (data.registrationState) {

                case "untransferred":
                    log("[loadSummerRegistrationPage()] : redirection to ");
                    self.location = "/summerReceipt";
                    break;
                case "transferred":
                case "approved":
                case "pending":
                case "finished":
                    log("[loadSummerRegistrationPage()] : redirection to studentProfile");
                    self.location = "/studentProfile";
                    break;
                default:
                    log("[loadSummerRegistrationPage()] : redirection to registrationSummer");
                    self.location = "/registrationSummer";
                    break;
            }
        }
    });
}