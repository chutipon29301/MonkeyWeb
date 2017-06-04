function getAllStudentContent() {
	"use strict";
	$.post("/post/allStudent", "", function (data) {
		if (data.err) {
			log("[getAllStudent()] : post/return => Error");
		} else {
			log("[getAllStudent()] : post/return => ");
			log(data);
			var student = data.student;
			var table = document.getElementById("allStudentTable");
			for (var i = 0; i < student.length; i++) {
				var row = table.insertRow(i);
				var cell1 = row.insertCell(0);
				var cell2 = row.insertCell(1);
				var cell3 = row.insertCell(2);
				var cell4 = row.insertCell(3);
				var cell5 = row.insertCell(4);
				var cell6 = row.insertCell(5);
				cell1.innerHTML = "<td>" + student[i].studentID + "</td>";
				cell2.innerHTML = "<td>" + student[i].nickname + "</td>";
				cell3.innerHTML = "<td>" + student[i].firstname + "</td>";
				cell4.innerHTML = "<td>" + student[i].lastname + "</td>";
				cell5.innerHTML = "<td>" + ((student[i].inCourse) ? "✔" : "✖") + "</td>";
				cell6.innerHTML = "<td>" + ((student[i].inHybrid) ? "✔" : "✖") + "</td>";

				var clickHandler = function (row) {
					return function () {
						log(row.getElementsByTagName("td")[0].innerHTML);
						writeCookie("monkeyWebAdminAllstudentSelectedUser", row.getElementsByTagName("td")[0].innerHTML);
						self.location = "\adminStudentprofile";
					};
				};
				row.onclick = clickHandler(row);
			}
		}
	});
}

function getStudentProfile() {
	var cookie = getCookieDict();
	var studentID = cookie.monkeyWebAdminAllstudentSelectedUser;
	document.getElementById("studentID").innerHTML = "ID: " + studentID;
	$.post("post/studentProfile", {
		studentID: studentID,
	}, function (data) {
		if (data.err) {
			log("Invalid");
		} else {
			log(data);
			document.getElementById("studentName").innerHTML = data.firstname + " (" + data.nickname + ") " + data.lastname;
			document.getElementById("studentLevel").innerHTML = "LEVEL: " + getLetterGrade(data.grade);
			document.getElementById("studentState").innerHTML = "STAGE: " + data.registrationState;
			document.getElementById("studentStatus").innerHTML = "STATUS: " + data.status;
		}
	});
}

function getAllCourse() {

}

function getLetterGrade(grade) {
	if (grade <= 6) {
		return "P" + grade;
	} else {
		return "M" + (grade - 6);
	}
}
