$(document).ready(function(){
	var cookie = getCookieDict()
	if(cookie.regisCourse==undefined){
		self.location = "registrationCourse"
	}
	cookie.regisCourse=JSON.parse(cookie.regisCourse)
	for(i in cookie.regisCourse){
		if(cookie.regisCourse[i]!=false){
			cookie.regisCourse[i].day = new Date(cookie.regisCourse[i].day)
			if(cookie.regisCourse[i].day.getDay()==6 && cookie.regisCourse[i].select==true){
				var j
				var courseClass = document.getElementsByClassName('btn-sat '+cookie.regisCourse[i].day.getHours()+'.2')
				for(j=1;j>=0;j--){
					courseClass[j].remove()
				}
				console.log(courseClass)
				var courseClass = document.getElementsByClassName('btn-sat '+cookie.regisCourse[i].day.getHours()+'.1')
				for(j=0;j<courseClass.length;j++){
					courseClass[j].className = courseClass[j].className.replace(/btn-default/g,"btn-basic disabled");
					courseClass[j].innerHTML = cookie.regisCourse[i].courseName
					if(courseClass[j].className.indexOf('col-md')!=-1){
						courseClass[j].className = courseClass[j].className.replace(/col-md-6/g,"col-md-12");
					}
					else if(courseClass[j].className.indexOf('col-xs')!=-1){
						courseClass[j].className = courseClass[j].className
						courseClass[j].style = "padding: 19% 0 19% 0 ; color:black"
					}
				}
			}
			if(cookie.regisCourse[i].day.getDay()==0 && cookie.regisCourse[i].select==true){
				var j
				var courseClass = document.getElementsByClassName('btn-sun '+cookie.regisCourse[i].day.getHours()+'.2')
				for(j=1;j>=0;j--){
					courseClass[j].remove()
				}
				var courseClass = document.getElementsByClassName('btn-sun '+cookie.regisCourse[i].day.getHours()+'.1')
				for(j=0;j<courseClass.length;j++){
					courseClass[j].className = courseClass[j].className.replace(/btn-default/g,"btn-basic disabled");
					courseClass[j].innerHTML = cookie.regisCourse[i].courseName
					if(courseClass[j].className.indexOf('col-md')!=-1){
						courseClass[j].className = courseClass[j].className.replace(/col-md-6/g,"col-md-12");
					}
					else if(courseClass[j].className.indexOf('col-xs')!=-1){
						courseClass[j].className = courseClass[j].className
						courseClass[j].style = "padding: 19% 0 19% 0 ; color:black "
					}
				}
			}
		}
	}
	console.log(cookie.regisCourse)
})

function next(){
	self.location = "registrationSkill"
}

function calculate(btn){ /* run after click btn in HTML to switch between select and non-select */
	var i;
	var all_same=document.getElementsByClassName(btn.className.split(' ')[0]+' '+btn.className.split(' ')[1]);
	for (i = 0;i<all_same.length;i++){
		var raw = all_same[i].className;
		var check = all_same[i].className.split(' ')[0]+' '+all_same[i].className.split(' ')[1]
		if (raw.indexOf("btn-default")!=-1){
			raw = raw.replace(/btn-default/g,"btn-success");
			all_same[i].className=raw;
			if (check[check.length-1] == '1'){
				var temp=document.getElementsByClassName(check.slice(0,check.length-1)+'2');
				var j
				for(j=0;j<temp.length;j++){
					if (temp[j].className.indexOf("btn-success")!=-1){
						deselect(temp[j])
					}
				}
			}
			else if (check[check.length-1] == '2'){
				var temp=document.getElementsByClassName(check.slice(0,check.length-1)+'1');
				var j
				for(j=0;j<temp.length;j++){
					if (temp[j].className.indexOf("btn-success")!=-1){
						deselect(temp[j])
					}
				}
			}
		}
		else if (raw.indexOf("btn-success")!=-1){
			raw = raw.replace(/btn-success/g,"btn-default");
			all_same[i].className=raw;
		}
	}
}

function deselect(btn){	 /* sub function to deselect duo btn if both is selected */
	var i;
	var all_same=document.getElementsByClassName(btn.className.split(' ')[0]+' '+btn.className.split(' ')[1]);
	for (i = 0;i<all_same.length;i++){
		var raw = all_same[i].className;
		if (raw.indexOf("btn-default")!=-1){
			raw = raw.replace(/btn-default/g,"btn-success");
			all_same[i].className=raw;
		}
		else if (raw.indexOf("btn-success")!=-1){
			raw = raw.replace(/btn-success/g,"btn-default");
			all_same[i].className=raw;
		}
	}
}

function back(){
	self.location = "registrationCourse"
}