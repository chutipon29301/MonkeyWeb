//noinspection JSUnusedLocalSymbols
function loginSubmit() {
	"use strict";

	let user = document.getElementById("usr");
	let pwd = document.getElementById("pwd");

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
				redirectLocation(user);
			} else {
				log("Wrong");
				alert("ID and password do not match.");
				clearInput();

			}
		}
	});
}

function redirectLocation(user){
	$.post("post/position", {
		userID: user
    }, function (data) {
		if (data.err) {
			log("Invalid");
		} else {
			log(data);
			switch(data.position){
				case "student":
					self.location = "/home";
					break;
				case "tutor":
					self.location = "/adminHome";
					break;
				case "admin":
					self.location="/testadmin";
				default:
					break;
			}
		}
	});
}

function clearInput() {
	"use strict";
	var pwd = document.getElementById("pwd");

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