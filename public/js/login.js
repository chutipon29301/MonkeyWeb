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
	$.post("http://192.168.1.135/post/password", {
		userID: user,
		password: pwd
	}, function (data) {
		if (data.err) {
			log("Invalid");
		} else {
			console.log(data);
			if (data.verified) {
				self.location = "\home.html";
			} else {
				log("Wrong");
				alert("ID and password do not match.");
			}
		}
	});

}

function clesrInput(){
	var user = document.getElementById("usr");
	var pwd = document.getElementById("pwd");
	
}

function log(text) {
	"use strict";
	console.log(text);
}
