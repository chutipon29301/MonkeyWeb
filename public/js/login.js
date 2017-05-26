function loginSubmit() {
	"use strict";

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
				self.location = "\home.html";
			} else {
				log("Wrong");
				clearInput();
			}
		}
	});

}

function clearInput(){
	"use strict";
	var user = document.getElementById("usr");
	var pwd = document.getElementById("pwd");
	
	user.value = "";
	pwd.value = "";
}

function log(text) {
	"use strict";
	console.log(text);
}
