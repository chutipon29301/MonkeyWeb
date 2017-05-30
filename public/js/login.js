function loginSubmit() {
	"use strict";

	var user = document.getElementById("usr");
	var pwd = document.getElementById("pwd");

	if (user.value.length === 0) {
		document.getElementById("usrReq").style.visibility = "visible";
		document.getElementById("usrFromGroup").classList.add("has-error");
	}
	if (user.value.length !== 0) {
		document.getElementById("usrReq").style.visibility = "hidden";
		document.getElementById("usrFromGroup").className = "form-group";
	}
	if (pwd.value.length === 0) {
		document.getElementById("pwdReq").style.visibility = "visible";
		document.getElementById("pwdFromGroup").classList.add("has-error");
	}
	if (pwd.value.length !== 0) {
		document.getElementById("pwdReq").style.visibility = "hidden";
		document.getElementById("pwdFromGroup").className = "form-group";
	}

	if (pwd.value.length !== 0 && user.value.length !== 0) {
		login(parseInt(user.value), pwd.value);
	}
}

function login(user, pwd) {
	"use strict";
	log("Username:" + user + ",Password:" + pwd);
	log(encrypt(pwd).toString());
	$.post("post/password", {
		userID: user,
		password: encrypt(pwd).toString()
	}, function (data) {
		if (data.err) {
			log("Invalid");
		} else {
			log(data);
			if (data.verified) {
				writeUserCookie(user, pwd);
				log(document.cookie);
//				self.location = "\home";
				self.location = "\home";
			} else {
				log("Wrong");
				clearInput();
			}
		}
	});
}

function clearInput() {
	"use strict";
	var user = document.getElementById("usr");
	var pwd = document.getElementById("pwd");

	user.value = "";
	pwd.value = "";
}

function encrypt(text) {
	"use strict";
	return CryptoJS.SHA3(text);
}

function writeUserCookie(user, pwd) {
	"use strict";
	writeCookie("monkeyWebUser", user);
	writeCookie("monkeyWebPassword", encrypt(pwd).toString());
}