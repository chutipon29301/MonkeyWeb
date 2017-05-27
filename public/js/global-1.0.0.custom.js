function log(text) {
	"use strict";
	console.log(text);
}

function writeCookie(text) {
	//	log(text);
	log("infunction");
	document.cookie = text;
	log(document.cookie);
}

function deleteCookie(key) {

}

function readCookie(key) {
	var allcookies = document.cookie;
	cookiearray = allcookies.split(';');
	for (var i = 0; i < cookiearray.length; i++) {
		name = cookiearray[i].split('=')[0];
		value = cookiearray[i].split('=')[1];
	}
}

function checkLogin() {
	log("Hello World");
}
