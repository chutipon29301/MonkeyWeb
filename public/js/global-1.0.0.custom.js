//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const allStudent = $.post("post/allStudent", {});

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const allCourse = $.post("/post/allCourse", {});

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
const changeRegistrationState = (studentID, registrationState) => $.post("post/changeRegistrationState", {
    studentID: studentID,
    registrationState: registrationState
});

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
const password = (userID, password) => $.post("/post/password", {
    userID: userID,
    password: password
});

//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const registrationState = (studentID) => $.post("post/registrationState", {
    studentID: studentID
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
 * Check whether user is login from value store in document.cookie
 * if user is not login, redirect to login page
 */
function checkLogin() {
    "use strict";
    let cookie = getCookieDict();
    //noinspection JSUnresolvedVariable
    password(cookie.monkeyWebUser, cookie.monkeyWebPassword).then((data) => {
        if (data.err) {
            log("[checkLogin()] : post/password => Error");
        } else {
            log("[checkLogin()] : post/password => ");
            log(data);
            if (!data.verified) {
                log("[checkLogin()] : redirecting to login");
                self.location = "/login";
            }
        }
    });
}
/**
 * Check if user is in valid page
 * @param position of available user in page
 */
function checkValidUser(positionArray) {
    "use strict";
    let cookie = getCookieDict();
    log("[checkValidUser()] : cookie -> ");
    log(cookie);
    //noinspection JSUnresolvedVariable
    position(parseInt(cookie.monkeyWebUser)).then((data) => {
        if (data.err) {
            log("[checkValidUser()] : post/position => Error");
        } else {
            log("[checkValidUser()] : post/position => ");
            log(data);
            if (positionArray.constructor === Array) {
                if ($.inArray(data.position, positionArray) === -1) {
                    log("[checkValidUser()] : redirecting to login");
                    logout();
                }
            } else {
                if (data.position !== positionArray) {
                    log("[checkValidUser()] : redirecting to login");
                    logout();
                }
            }

        }
    });
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
    self.location = "/login";
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
    "use strict";
    let cookie = getCookieDict();
    //noinspection JSUnresolvedVariable
    registrationState(cookie.monkeyWebUser).then((data) => {
        if (data.err) {
            log("[loadRegistrationPage()] : post/registrationState => " + data.err);
        } else {
            log("[loadRegistrationPage()] : post/registrationState =>");
            log(data);
            //noinspection SpellCheckingInspection
            switch (data.registrationState) {
                case "unregistered":
                    log("[loadRegistrationPage()] : redirection to registrationName");
                    self.location = "/registrationName";
                    break;
                case "untransferred":
                    log("[loadRegistrationPage()] : redirection to registrationReceipt");
                    self.location = "/registrationReceipt";
                    break;
                case "transferred":
                    break;
                case "rejected":
                    break;
                case "registered":
                    break;
                default:
                    break;
            }
        }
    });
}