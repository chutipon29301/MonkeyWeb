$(document).ready(function(){
	modal = document.getElementById('id01');
	var cookie = getCookieDict();
	cookie.regisCourse = JSON.parse(cookie.regisCourse)
	for(i in cookie.regisCourse){
		if(cookie.regisCourse[i]!=false){
			cookie.regisCourse[i].day = new Date(cookie.regisCourse[i].day)
			if(cookie.regisCourse[i].day.getDay()==6 && cookie.regisCourse[i].select==true){
				var j
				var courseClass = document.getElementsByClassName('btn-sat '+cookie.regisCourse[i].day.getHours()+'.1')
				for(j=0;j<courseClass.length;j++){
					courseClass[j].className = courseClass[j].className+' cr';
					courseClass[j].innerHTML = cookie.regisCourse[i].courseName+' (CR)';
				}
			}
			if(cookie.regisCourse[i].day.getDay()==0 && cookie.regisCourse[i].select==true){
				var j
				var courseClass = document.getElementsByClassName('btn-sun '+cookie.regisCourse[i].day.getHours()+'.1')
				for(j=0;j<courseClass.length;j++){
					courseClass[j].className = courseClass[j].className+' cr';
					courseClass[j].innerHTML = cookie.regisCourse[i].courseName+' (CR)';
				}
			}
		}
	}
})

function back(){
	self.location = "registrationHybrid"
}

function next(){

}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}