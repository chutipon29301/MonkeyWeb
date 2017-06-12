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
    /** @namespace cookie.monkeyWebUser */
    let user = cookie.monkeyWebUser;
    /** @namespace cookie.monkeyWebPassword */
    let pwd = cookie.monkeyWebPassword;
    log("[checkLogin()] : cookie -> ");
    log(cookie);
    //noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
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
                self.location = "/login";
            }
        }
    });
}
/**
 * Check if user is in valid page
 * @param position of available user in page
 */
function checkValidUser(position) {
    "use strict";
    let cookie = getCookieDict();
    let user = cookie.monkeyWebUser;
    log("[checkValidUser()] : cookie -> ");
    log(cookie);
    //noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
    $.post("/post/position", {
        userID: user
    }, function (data) {
        if (data.err) {
            log("[checkValidUser()] : post/position => Error");
        } else {
            log("[checkValidUser()] : post/position => ");
            log(data);
            if (position.constructor === Array) {
                log($.inArray(data.position, position) === -1);
                if ($.inArray(data.position, position) === -1) {
                    log("[checkValidUser()] : redirecting to login");
                    logout();
                }
            } else {
                if (data.position !== position) {
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
    deleteCookie("monkeyWebUser");
    deleteCookie("monkeyWebPassword");
    self.location = "/login";
}
/**
 * Set student name to navigation bar
 */
function setStudentNavName() {
    "use strict";
    let cookie = getCookieDict();
    let user = cookie.monkeyWebUser;
    //noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
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
    let cookie = getCookieDict();
    let user = cookie.monkeyWebUser;
    //noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
    $.post("post/registrationState", {
        studentID: user
    }, function (data) {
        if (data.err) {
            log("[loadRegistrationPage()] : post/status => Error");
            log(data.err);
        } else {
            log("[loadRegistrationPage()] : post/status =>");
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