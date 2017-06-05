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
    var cookie = getCookieDict();
    /** @namespace cookie.monkeyWebUser */
    var user = cookie.monkeyWebUser;
    /** @namespace cookie.monkeyWebPassword */
    var pwd = cookie.monkeyWebPassword;
    log("[checkLogin()] : cookie -> ");
    log(cookie);
    $.post("/post/password", {
        userID: user,
        password: pwd
    }, function (data) {
        if (data.err) {
            log("[checkLogin()] : post/password => Error");
        } else {
            log("[checkLogin()] : post/password => ");
            log(data);
            if (!data.verified) {
                log("[checkLogin()] : redirecting to login");
                self.location = "\login";
            }
        }
    });
}

/**
 * Check whether user is student
 * if user is not student, logout
 */
function checkIDStudent() {
    "use strict";
    var cookie = getCookieDict();
    var user = cookie.monkeyWebUser;
    log("[checkLogin()] : cookie -> ");
    log(cookie);
    $.post("/post/position", {
        userID: user
    }, function (data) {
        if (data.err) {
            log("[checkLogin()] : post/position => Error");
        } else {
            log("[checkLogin()] : post/position => ");
            log(data);
            if (data.position !== "student") {
                log("[checkLogin()] : redirecting to login");
                logout();
            }
        }
    });
}

/**
 * Check whether user is tutor
 * if user is not tutor, logout
 */
function checkIDTutor() {
    "use strict";
    var cookie = getCookieDict();
    var user = cookie.monkeyWebUser;
    log("[checkLogin()] : cookie -> ");
    log(cookie);
    $.post("/post/position", {
        userID: user
    }, function (data) {
        if (data.err) {
            log("[checkLogin()] : post/position => Error");
        } else {
            log("[checkLogin()] : post/position => ");
            log(data);
            if (data.position !== "tutor") {
                log("[checkLogin()] : redirecting to login");
                logout();
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
    var allcookies = document.cookie;
    log(allcookies);
    var obj = {};
    var cookiearray = allcookies.split('; ');
    for (var i = 0; i < cookiearray.length; i++) {
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
    deleteCookie("monkeyWebUser");
    deleteCookie("monkeyWebPassword");
    self.location = "\login";
}

/**
 * Set student name to navigation bar
 */
function setStudentNavName() {
    "use strict";
    var cookie = getCookieDict();
    var user = cookie.monkeyWebUser;
    $.post("post/name", {
        userID: user
    }, function (data) {
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
 * Load registration page from status of student
 */
function loadRegistrationPage() {
    "use strict";
    var cookie = getCookieDict();
    var user = cookie.monkeyWebUser;
    $.post("post/registrationState", {
        userID: user
    }, function (data) {
        if (data.err) {
            log("[loadRegistrationPage()] : post/status => Error");
        } else {
            log("[loadRegistrationPage()] : post/status =>");
            log(data);
            switch (data.registrationState) {
                case "unregistered":
                    log("[loadRegistrationPage()] : redirection to registrationName");
                    self.location = "/registrationName";
                    break;
                case "untransfered":
                    log("[loadRegistrationPage()] : redirection to registrationReciept");
                    self.location = "/registrationReciept";
                    break;
                case "transfered":
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
