function loginSubmit() {
	"use strict";

	console.log("Hello World");
	var user = document.getElementById("usr");
	var pwd = document.getElementById("pwd");

	if (user.value.length === 0) {
		document.getElementById("usrReq").style.visibility = "visible";
		document.getElementById("usrFromGroup").classList.add("has-error");
	}
	if (pwd.value.length === 0) {
		document.getElementById("usrReq").style.visibility = "visible";
		document.getElementById("usrFromGroup").classList.add("has-error");
	}

	if (pwd.value.length !== 0 && user.value.length !== 0) {
		login(parseInt(user.value), pwd.value);
	}
}

function login(user, pwd) {
	"use strict";
	log("Username:" + user + ",Password:" + pwd);
	$.post("http://192.168.1.135/post/password", {
		userID: user,
		password: pwd
	}, function (data) {
		if (data.err) {
			log("Invalid");
		} else {
			console.log(data);
			if (data.verified) {
				log("Pass");
			} else {
				log("Wrong");
			}
		}
	});

}

function log(text) {
	"use strict";
	console.log(text);
}
