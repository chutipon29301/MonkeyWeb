function loginBtnClick() {
	"use strict";
	var user = document.getElementById("usr");
	var pwd = document.getElementById("pwd");

	if (user.value.length === 0) {
		document.getElementById("usrReq").style.visibility = "visible";
		document.getElementById("usrFromGroup").classList.add("has-error");
	}
	if (pwd.value.length === 0) {
		document.getElementById("pwdReq").style.visibility = "visible";
		document.getElementById("pwdFromGroup").classList.add("has-error");
	}
}
