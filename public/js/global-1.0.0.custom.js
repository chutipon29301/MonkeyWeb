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
	var user = cookie.monkeyWebUser;
	var pwd = cookie.monkeyWebPassword;
	log("[checkLogin()] : cookie -> ");
	log(cookie);
	$.post("/post/password", {
		userID: user,
		password: pwd
	}, function (data) {
		if (data.err) {
			log("[checkLogin()] : post/return => Error");
		} else {
			log("[checkLogin()] : post/return => ");
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
			log("[checkLogin()] : post/return => Error");
		} else {
			log("[checkLogin()] : post/return => ");
			log(data);
			if (data.position != "student") {
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
			log("[checkLogin()] : post/return => Error");
		} else {
			log("[checkLogin()] : post/return => ");
			log(data);
			if (data.position != "tutor") {
				log("[checkLogin()] : redirecting to login");
				logout();
			}
		}
	});
}


/**
 * Generate object of document.cookie
 * @return dict object of document.cookie
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
	log("Logout");
	deleteCookie("monkeyWebUser");
	deleteCookie("monkeyWebPassword");
	self.location = "\login";
}
