function log(text) {
	"use strict";
	console.log(text);
}

function writeCookie(text) {
	"use strict";
	document.cookie = text;
	log(document.cookie);
}

function deleteCookie(key) {
	"use strict";
	document.cookie = key + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
}

function checkLogin() {
	"use strict";
	log(document.cookie);
	var cookie = getCookieDict();
	log(cookie);
	var user = cookie["monkeyWebUser"];
	var pwd = cookie["monkeyWebPassword"];
	log(pwd);

	$.post("http://192.168.1.135/post/password", {
		userID: user,
		password: pwd
	}, function (data) {
		if (data.err) {
			log("Invalid");
		} else {
			log(data);
			if (!data.verified) {
				self.location = "\login.html";
				log("Wrong");
			}
		}
	});

}

function getCookieDict() {
	"use strict";
	var allcookies = document.cookie;
	var dict = {};
	var cookiearray = allcookies.split('; ');
	for (var i = 0; i < cookiearray.length; i++) {
		dict[cookiearray[i].split('=')[0]] = cookiearray[i].split('=')[1];
	}
	return dict;
}

function logout() {
	"use strict";
	log("Logout");
	deleteCookie("monkeyWebUser");
	deleteCookie("monkeyWebPassword");
	self.location = "\login.html";
}
