$(document).ready(function(){
	var cookie = getCookieDict()
	if(cookie.name!=undefined || cookie.name!=''){
		deleteCookie('name')
	}
	if(cookie.level!=undefined || cookie.level!=''){
		deleteCookie('level')
	}
	console.log(cookie.name)
	if($('#name').val()!='' && $('#nname').val()!='' && $('#sname').val()!='' && $('#level').val()!='0'){
		document.getElementById('next').className="btn btn-default";
	}
	else{
		document.getElementById('next').className="btn btn-basic disabled";
	}
	$('#nname,#name,#sname,#level').change(function(){
		if($('#name').val()!='' && $('#nname').val()!='' && $('#sname').val()!='' && $('#level').val()!='0'){
			document.getElementById('next').className="btn btn-default";
		}
		else{
			document.getElementById('next').className="btn btn-basic disabled";
		}
	})
})

function next(btn){
	if($('#name').val()!='' && $('#nname').val()!='' && $('#sname').val()!='' && $('#level').val()!='0'){
		writeCookie('name',$('#nname').val()+' '+$('#name').val()+' '+$('#sname').val())
		writeCookie('level',$('#level').val())
		self.location = "registrationCourse"
	}
}