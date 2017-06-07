$(document).ready(function(){
	modal = document.getElementById('id01');
	genTable()
	updateTable()
	$("#station").change(function(){
		if ($(this).val() == "2"){
			$('#skilltime').val('0')
			document.getElementById('skillday').disabled = true
			document.getElementById('skillday').style = "visibility:hidden"
			document.getElementById('skilltime').disabled = true
			document.getElementById('skilltime').style = "visibility:hidden"
			document.getElementById('skilltime').value = "0"

		}
		else{
			document.getElementById('skillday').disabled = false
			document.getElementById('skillday').style = ""
			document.getElementById('skilltime').disabled = false
			document.getElementById('skilltime').style = ""
		}
	})
})

function genTable(){
	var temp = document.getElementsByClassName('disabled')
	var i
	for(i=0;i<temp.length;i++){
		var j
		var name = ''
		for(j=0;j<6;j++){
			name += temp[i].className.split(' ')[j]+' ';
		}
		temp[i].className = name
		temp[i].innerHTML = '-'
	}
}

function updateTable(){
	var cookie = getCookieDict();
	cookie.regisCourse = JSON.parse(cookie.regisCourse)
	cookie.regisHybrid = JSON.parse(cookie.regisHybrid)
	for(i in cookie.regisCourse){
		if(cookie.regisCourse[i]!=false){
			cookie.regisCourse[i].day = new Date(cookie.regisCourse[i].day)
			if(cookie.regisCourse[i].day.getDay()==6 && cookie.regisCourse[i].select==true){
				var j
				var courseClass = document.getElementsByClassName('btn-sat '+cookie.regisCourse[i].day.getHours()+'.1')
				for(j=0;j<courseClass.length;j++){
					courseClass[j].className = courseClass[j].className+' cr';
					courseClass[j].innerHTML = 'CR : '+cookie.regisCourse[i].courseName;
				}
			}
			if(cookie.regisCourse[i].day.getDay()==0 && cookie.regisCourse[i].select==true){
				var j
				var courseClass = document.getElementsByClassName('btn-sun '+cookie.regisCourse[i].day.getHours()+'.1')
				for(j=0;j<courseClass.length;j++){
					courseClass[j].className = courseClass[j].className+' cr';
					courseClass[j].innerHTML = 'CR : '+cookie.regisCourse[i].courseName;
				}
			}
		}
	}
	for(i in cookie.regisHybrid){
		if(cookie.regisHybrid[i]!=false){
			cookie.regisHybrid[i].day = new Date(cookie.regisHybrid[i].day)
			var day = ['sat','sun','tue','thu']
			var dayNum = [6,0,2,4]
			for(k=0;k<4;k++){
				if(cookie.regisHybrid[i].day.getDay()==dayNum[k]){
					var j
					var hybridClass = document.getElementsByClassName('btn-'+day[k]+' '+cookie.regisHybrid[i].day.getHours()+'.1')
					for(j=0;j<hybridClass.length;j++){
						hybridClass[j].className = hybridClass[j].className+' hb';
						hybridClass[j].innerHTML = 'FHB : '+cookie.regisHybrid[i].subject;
						console.log(hybridClass[j].className)
					}
				}
			}
		}
	}
}

function back(){
	self.location = 'registrationHybrid'
}

function next(){
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}