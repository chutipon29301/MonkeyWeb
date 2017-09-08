var cr = []
var crSuggest = []
var cookie
const feepersbj = 9000
$(document).ready(function () {
	cookie = getCookieDict()
	$.post("/post/allCourse", { year: 2017, quarter: 12 }, function (data) {
		if (data.err) {
			alert("Cannot get course data from server")
			throw data.err
		}
		addCourse(data.course, cookie.monkeyWebUser)
		// for (let i = 0; i < data.course.length; i++) {
		// 	if (data.course[i].description !== null) {
		// 		$("#crDescription").append("<p>- " + data.course[i].courseName + " คือคอร์ส" + data.course[i].description + "</p>")
		// 	}
		// }
	})
	$('.btn').click(function () {
		let allsel = $('.btn-success')
		$('#total').html('จำนวนเงิน : ' + (feepersbj * allsel.length) + ' บาท')
	})
	$("#group").change(function () {
		let allbtn = document.getElementsByClassName('btn');
		let val = $("#group").val();
		for (let i = 0; i < crSuggest.length; i++) {
			if (crSuggest[i].level === val) {
				for (let j = 0; j < crSuggest[i].courseID.length; j++) {
					for (let k = 0; k < allbtn.length; k++) {
						if (crSuggest[i].courseID[j] === allbtn[k].id) {
							$(allbtn[k]).addClass("btn-grow")
						} else $(allbtn[k]).removeClass("btn-grow")
					}
				}
			} else {
				for (let k = 0; k < allbtn.length; k++) {
					$(allbtn[k]).removeClass("btn-grow")
				}
			}
		}
	})
})
function addCourse(allcourse, id) {
	$.post("/post/studentProfile", { studentID: parseInt(id) }, function (data) {
		if (data.err) {
			alert("Cannot get student profile from server")
			throw data.err
		}
		$.post("post/listCourseSuggestion", { grade: data.grade, quarter: "summer" }, function (crSugg) {
			if (crSugg.course.length === 0) {
				$("#group-form").hide();
			} else {
				for (let i = 0; i < crSugg.course.length; i++) {
					crSuggest.push(crSugg.course[i]);
					$("#group").append("<option value='" + crSugg.course[i].level + "'>" + crSugg.course[i].level + "</option>");
				}
			}
		})
		$('#name').val(data.firstname + ' (' + data.nickname + ') ' + data.lastname)
		$('#grade').val((data.grade > 6) ? 'ม. ' + (data.grade - 6) : 'ป. ' + data.grade)
		for (let i in allcourse) {
			if (checkgrade(allcourse[i], data.grade)) {
				if (allcourse[i].description !== null) {
					$("#crDescription").append("<p>- " + allcourse[i].courseName + " คือคอร์ส" + allcourse[i].description + "</p>")
				}
				cr.push(allcourse[i])
				let coursetime = new Date(allcourse[i].day)
				log(coursetime.getHours())
				let btn = document.getElementsByName(coursetime.getHours())
				for (let j = 0; j < btn.length; j++) {
					if (btn[j].innerHTML == '&nbsp;') {
						btn[j].innerHTML = allcourse[i].courseName + ' (' + allcourse[i].tutorNicknameEn[0] + ')'
						btn[j].id = allcourse[i].courseID
						break
					}
				}
			}
		}
		let allbtn = document.getElementsByClassName('btn')
		for (let k = 0; k < allbtn.length; k++) {
			if (allbtn[k].innerHTML == '&nbsp;') {
				$(allbtn[k]).addClass('disabled')
			}
		}
	})
}

function checkgrade(course, grade) {
	for (let i in course.grade) {
		if (course.grade[i] == grade) {
			return true
		}
	}
}

function getCookieDict() {
	"use strict";
	//noinspection SpellCheckingInspection
	let allcookies = document.cookie;
	let obj = {};
	//noinspection SpellCheckingInspection
	let cookiearray = allcookies.split('; ');
	for (let i = 0; i < cookiearray.length; i++) {
		obj[cookiearray[i].split('=')[0]] = cookiearray[i].split('=')[1];
	}
	return obj;
}

function btntoggle(ele) {
	if (!$(ele).hasClass('disabled')) {
		if (ele.className.includes('btn-success')) {
			$(ele).addClass('btn-default')
			$(ele).removeClass('btn-success')
		} else {
			let allele = $('[name=' + ele.name + ']')
			for (let i = 0; i < 2; i++) {
				$(allele[i]).removeClass('btn-success')
				$(allele[i]).addClass('btn-default')
			}
			$(ele).removeClass('btn-default')
			$(ele).addClass('btn-success')
		}
	}
	$(ele).blur()
}

function sendData() {
	var allsel = $('.btn-success')
	var allsend = []
	if (allsel.length > 0) {
		for (let i = 0; i < allsel.length; i++) {
			for (let j in cr) {
				let time = new Date(cr[j].day)
				if (cr[j].courseName == allsel[i].innerHTML.split(' ')[0] && parseInt(time.getHours()) == parseInt(allsel[i].name)) {
					allsend.push(cr[j].courseID)
				}
			}
		}
		console.log(allsend)
		$.post('/post/addStudentCourse', { studentID: cookie.monkeyWebUser, courseID: allsend }, function (data) {
			console.log('eiei')
			console.log(data)
			if (data.err) {
				alert('การเชื่อมต่อมีปัญหา โปรดลองใหม่อีกครั้ง');
				throw data.err;
			}
			$.post('/post/changeRegistrationState', { studentID: parseInt(cookie.monkeyWebUser), registrationState: 'untransferred', quarter: "summer" }, function (data2) {
				if (data2.err) {
					alert('เกิดข้อผิดพลาดบางอย่างขึ้น โปรดลองใหม่อีกครั้งหรือติดต่อAdmin')
					throw data2.err;
				}
				self.location = 'summerAbsentForm'
			})
		})
	}
}

function confirm() {
	let allsel = $('.btn-success');
	console.log(allsel.length)
	if (allsel.length > 0) {
		$('#noSel').hide()
		$('#haveSel').show()
		$('#confirm').show()
		//fill in vvvvvv
		let sbjtxt = '';
		for (let i = 0; i < allsel.length; i++) {
			sbjtxt += $(allsel[i]).html() + '<br>'
		}
		$(sbj).html(sbjtxt)
		$('#fee').html(('' + (feepersbj * allsel.length)).slice(0, ('' + (feepersbj * allsel.length)).length - 3) + ",000 บาท")
	} else {
		$('#confirm').hide()
		$('#noSel').show()
		$('#haveSel').hide()

	}
}