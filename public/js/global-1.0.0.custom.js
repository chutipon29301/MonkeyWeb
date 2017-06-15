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
 * @param positionArray of available user in page
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
                    log("[loadRegistrationPage()] : redirection to registrationReceipt");
                    self.location = "/registrationReceipt";
                    break;
                case "rejected":
                    log("[loadRegistrationPage()] : redirection to studentProfile");
                    self.location = "/studentProfile";
                    break;
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

function getDescription() {
    let description = document.getElementById("description");
    let innerHtml = "";
    let cookie = getCookieDict();

    switch (cookie.grade) {
        case "4":
        case "5":
        case "6":
            innerHtml = '<p class="form-control-static"><b>SCIP456z</b>: เนื้อหาทั่วไป (สำหรับทุกคน)</p>'+
                '<p class="form-control-static"><b>SCIP6x</b>: ตะลุยโจทย์สอบเข้า (สำหรับป.6 สอบเข้า)</p>'+
                '<p class="form-control-static"><b>MP456a</b>: เนื้อหาสอบเข้าที่จำเป็น</p>'+
                '<p class="form-control-static"><b>MP456x</b>: ตะลุยโจทย์สอบเข้า (สำหรับทุกคน)</p>'+
                '<p class="form-control-static"><b>MP456g</b>: กลุ่ม gifted (สำหรับนร.ที่ผ่านคอร์สพี่พรีมาแล้ว)</p>';
            break;
        case "7":
            innerHtml = '<p class="form-control-static"><b>ES123a</b>: สำหรับนร.ที่มีพื้นฐานดี</p>'+
                '<p class="form-control-static"><b>ES123b</b>: สำหรับนร.ทั่วไป</p>'+
                '<p class="form-control-static"><b>CHS123z</b>: เนื้อหาเคมีทั่วไป (สำหรับทุกคน)</p>';
            break;
        case "8":
            innerHtml = '<p class="form-control-static"><b>ES123a</b>: สำหรับนร.ที่มีพื้นฐานดี</p>'+
                '<p class="form-control-static"><b>ES123b</b>: สำหรับนร.ทั่วไป</p>'+
                '<p class="form-control-static"><b>MS23w</b>: เนื้อหาและโจทย์สอบเข้า (ระดับเริ่มต้น)</p>'+
                '<p class="form-control-static"><b>MS23x</b>: ตะลุยโจทย์สอบเข้า (ระดับยาก)</p>'+
                '<p class="form-control-static"><b>PHS12b</b>: กลุ่มพื้นฐาน (สำหรับนร.ที่ผ่านคอร์สพี่แก๊กมาแล้ว)</p>'+
                '<p class="form-control-static"><b>PHS23g</b>: กลุ่ม gifted (สำหรับนร.ที่ผ่านคอร์สพี่เต๋ามาแล้ว)</p>'+
                '<p class="form-control-static"><b>CHS123z</b>: เนื้อหาเคมีทั่วไป (สำหรับทุกคน)</p>';
            break;
        case "9":
            innerHtml = '<p class="form-control-static"><b>ES123a</b>: สำหรับนร.ที่มีพื้นฐานดี หรือ นร.ม.3</p>'+
                '<p class="form-control-static"><b>ES23b</b>: สำหรับนร.ทั่วไป</p>'+
                '<p class="form-control-static"><b>MS23w</b>: เนื้อหาและโจทย์สอบเข้า (ระดับเริ่มต้น)</p>'+
                '<p class="form-control-static"><b>MS23x</b>: ตะลุยโจทย์สอบเข้า (ระดับยาก)</p>'+
                '<p class="form-control-static"><b>PHS23g</b>: กลุ่ม gifted (สำหรับนร.ที่ผ่านคอร์สพี่เต๋ามาแล้ว)</p>'+
                '<p class="form-control-static"><b>CHS123z</b>: เนื้อหาเคมีทั่วไป (สำหรับทุกคน)</p>';
            break;
        case "10":
            innerHtml = '<p class="form-control-static"><b>ES456a</b>: สำหรับนร.ที่มีพื้นฐานดี</p>'+
                '<p class="form-control-static"><b>ES456b</b>: สำหรับนร.ทั่วไป</p>'+
                '<p class="form-control-static"><b>CHS456a</b>: สำหรับนร.ที่มีพื้นฐานดี</p>'+
                '<p class="form-control-static"><b>CHS456b</b>: สำหรับนร.ทั่วไป</p>';
            break;
        case "11":
            innerHtml = '<p class="form-control-static"><b>ES456a</b>: สำหรับนร.ที่มีพื้นฐานดี</p>'+
                '<p class="form-control-static"><b>ES456b</b>: สำหรับนร.ทั่วไป</p>'+
                '<p class="form-control-static"><b>CHS456a</b>: สำหรับนร.ที่มีพื้นฐานดี</p>'+
                '<p class="form-control-static"><b>CHS456b</b>: สำหรับนร.ทั่วไป</p>'+
                '<p class="form-control-static"><b>PHS56v</b>: เนื้อหาพิเศษทางวิศวกรรม (เพิ่มคะแนน PAT3)</p>';
            break;
        case "12":
            innerHtml = '<p class="form-control-static"><b>CHS456a</b>: สำหรับนร.ที่มีพื้นฐานดี หรือ นร.ม.6</p>'+
                '<p class="form-control-static"><b>CHS456b</b>: สำหรับนร.ทั่วไป</p>'+
                '<p class="form-control-static"><b>PHS56v</b>: เนื้อหาพิเศษทางวิศวกรรม (เพิ่มคะแนน PAT3)</p>'+
                '<p class="form-control-static"><b>PHS6x</b>: ตะลุยโจทย์ฟิสิกส์สอบเข้า (กสพท.+ PAT3)</p>';
            break;
        default:
            innerHtml = "";
            break;
    }
    description.innerHTML = innerHtml;
}