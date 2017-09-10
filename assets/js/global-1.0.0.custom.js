//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const allStudent = () => $.post("post/allStudent", {});

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const allCourse = () => $.post("/post/allCourse", {
    quarter: "all"
});

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

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const addSkillDay = (studentID, day) => $.post("post/addSkillDay", {
    studentID: studentID,
    subject: "M",
    day: day
});

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const addHybridDay = (studentID, subject, day) => $.post("post/addHybridDay", {
    studentID: studentID,
    subject: subject,
    day: day
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
const removeHybridDay = (studentID, day) => $.post("post/removeHybridDay", {
    studentID: studentID,
    day: day
});

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const removeSkillDay = (studentID, day) => $.post("post/removeSkillDay", {
    studentID: studentID,
    day: day
});

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const registrationState = (studentID, quarter) => {
    if (quarter === undefined) {
        return $.post("post/registrationState", {
            studentID: studentID
        });
    } else {
        return $.post("post/registrationState", {
            studentID: studentID,
            quarter: quarter
        });
    }
}

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const getConfig = () => $.post("post/getConfig", {});

const listQuarter = (status) => $.post("post/listQuarter", {
    status: status
});

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
function setStudentNavName() {
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
}

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
    registrationState(cookie.monkeyWebUser).then((data) => {
        if (data.err) {
            log("[loadRegistrationPage()] : post/registrationState => " + data.err);
        } else {
            log("[loadRegistrationPage()] : post/registrationState =>");
            log(data);
            switch (data.registrationState) {
                case "unregistered":
                    log("[loadRegistrationPage()] : redirection to registrationName");
                    self.location = "/registrationName";
                    break;
                case "untransferred":
                case "rejected":
                    log("[loadRegistrationPage()] : redirection to registrationReceipt");
                    self.location = "/registrationReceipt";
                    break;
                case "transferred":
                case "pending":
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
                case "rejected":
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