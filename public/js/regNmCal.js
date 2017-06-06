$(document).ready(function(){
	var cookie = getCookieDict()
	console.log(cookie)
	if(cookie.name!=undefined && cookie.nameE!=undefined){
		cookie.name = JSON.parse(cookie.name)
		cookie.nameE = JSON.parse(cookie.nameE)
		cookie.tel = JSON.parse(cookie.tel)
		$('#nname').val(decodeURIComponent(cookie.name.nname))
		$('#name').val(decodeURIComponent(cookie.name.name))
		$('#sname').val(decodeURIComponent(cookie.name.sname))
		$('#nnameE').val(cookie.nameE.nname)
		$('#nameE').val(cookie.nameE.name)
		$('#snameE').val(cookie.nameE.sname)
		$('#grade').val(cookie.grade)
		$('#email').val(cookie.email)
		$('#parentNum').val(cookie.tel.parent)
		$('#studentNum').val(cookie.tel.student)
	}
	if($('#name').val()!='' && $('#nname').val()!='' && $('#sname').val()!='' && $('#grade').val()!='0'){
		document.getElementById('next').className="btn btn-default";
	}
	else{
		document.getElementById('next').className="btn btn-basic disabled";
	}
})
function next(){
	if($('#name').val()!='' && $('#nname').val()!='' && $('#sname').val()!='' && $('#grade').val()!='0' && $('#nameE').val()!='' && $('#nnameE').val()!='' && $('#snameE').val()!='' && $('#email').val()!='' && $('#parentNum').val()!='' && $('#studentNum').val()!=''){
		writeCookie('name',JSON.stringify({nname:encodeURIComponent($('#nname').val()) , name:encodeURIComponent($('#name').val()) , sname:encodeURIComponent($('#sname').val())}))
		writeCookie('nameE',JSON.stringify({nname:$('#nnameE').val() , name:$('#nameE').val() , sname:$('#snameE').val()}))
		writeCookie('email',$('#email').val())
		writeCookie('grade',$('#grade').val())
		writeCookie('tel',JSON.stringify({parent:$('#parentNum').val() , student:$('#studentNum').val()}))
		self.location = "registrationCourse"
	}
	else{
		alert("กรุณากรอกข้อมูลให้ครบทุกช่อง")
	}
}

