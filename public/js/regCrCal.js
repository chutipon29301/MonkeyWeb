var availableCourse={sat81 : false,sat82 : false,sat101 : false,sat102 : false,sat131 : false,sat132 : false,sat151 : false,sat152 : false,
	sun81 : false,sun82 : false,sun101 : false,sun102 : false,sun131 : false,sun132 : false,sun151 : false,sun152 : false}
$(document).ready(function(){
$("#level").change(function(){ /* level table changed and gen table */
	genTable()
	availableCourse={sat81 : false,sat82 : false,sat101 : false,sat102 : false,sat131 : false,sat132 : false,sat151 : false,sat152 : false,
	sun81 : false,sun82 : false,sun101 : false,sun102 : false,sun131 : false,sun132 : false,sun151 : false,sun152 : false}
	var grade = $(this).val()
	$.post("http://192.168.1.135/post/gradeCourse",{grade:parseInt(grade)}, function (arrayCourse) {		
		var i
		for(i=0;i<arrayCourse.length;i++){
			if (arrayCourse[i].day.getDay()==6){
				if(arrayCourse[i].day.getHours()==8){
					if(availableCourse.sat81==false){
						availableCourse.sat81 = arrayCourse[i]
					}
					else if(availableCourse.sat82==false){
						availableCourse.sat82 = arrayCourse[i]
					}
				}
				if(arrayCourse[i].day.getHours()==10){
					if(availableCourse.sat101==false){
						availableCourse.sat101 = arrayCourse[i]
					}
					else if(availableCourse.sat102==false){
						availableCourse.sat102 = arrayCourse[i]
					}
				}
				if(arrayCourse[i].day.getHours()==13){
					if(availableCourse.sat131==false){
						availableCourse.sat131 = arrayCourse[i]
					}
					else if(availableCourse.sat132==false){
						availableCourse.sat132 = arrayCourse[i]
					}
				}
				if(arrayCourse[i].day.getHours()==15){
					if(availableCourse.sat151==false){
						availableCourse.sat151 = arrayCourse[i]
					}
					else if(availableCourse.sat152==false){
						availableCourse.sat152 = arrayCourse[i]
					}
				}
			}
			if (arrayCourse[i].day.getDay()==0){
				if(arrayCourse[i].day.getHours()==8){
					if(availableCourse.sun81==false){
						availableCourse.sun81 = arrayCourse[i]
					}
					else if(availableCourse.sun82==false){
						availableCourse.sun82 = arrayCourse[i]
					}
				}
				if(arrayCourse[i].day.getHours()==10){
					if(availableCourse.sun101==false){
						availableCourse.sun101 = arrayCourse[i]
					}
					else if(availableCourse.sun102==false){
						availableCourse.sun102 = arrayCourse[i]
					}
				}
				if(arrayCourse[i].day.getHours()==13){
					if(availableCourse.sun131==false){
						availableCourse.sun131 = arrayCourse[i]
					}
					else if(availableCourse.sun132==false){
						availableCourse.sun132 = arrayCourse[i]
					}
				}
				if(arrayCourse[i].day.getHours()==15){
					if(availableCourse.sun151==false){
						availableCourse.sun151 = arrayCourse[i]
					}
					else if(availableCourse.sun152==false){
						availableCourse.sun152 = arrayCourse[i]
					}
				}
			}
		}
		updateTable(availableCourse);
	});
});
});

function updateTable(course){ /* update table after gen to change from blank to recieved data */
	var i
	for (i in course){
		if(course[i]!=false){
			var temp = document.getElementsByClassName("btn-"+i.slice(0,3)+" "+i.slice(3,i.length-1)+"."+i[i.length-1])
			var j
			for(j=0;j<temp.length;j++){
			var rep = temp[j].className;
			rep.replace(/btn-basic disabled/g,"btn btn-default");
			temp[j].className = rep;
			temp[j].innerHTML = course[i].courseName;
			}
		}
	}
}

function genTable(){ /* gen blank table at first */
	var satTable = document.getElementsByClassName("btn-sat")
	var sunTable = document.getElementsByClassName("btn-sun")
	var i
	for (i = 0 ; i<satTable.length ; i++){
		var raw = satTable[i].className.split(' ')
		satTable[i].className = raw[0]+' '+raw[1]+' btn btn-basic disabled '+raw[raw.length-1]
		satTable[i].innerHTML = "Blank"
	}
	for (i = 0 ; i<sunTable.length ; i++){
		var raw = sunTable[i].className.split(' ')
		sunTable[i].className = raw[0]+' '+raw[1]+' btn btn-basic disabled '+raw[raw.length-1]
		sunTable[i].innerHTML = "Blank"
	}

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
	var temp = btn.className.split(' ')
	var dayHour = temp[0].slice(temp[0].length-3,temp[0].length) + temp[1]
	dayHour.replace(/./g,'');
	if (availableCourse[dayHour!=false]){
		if(btn.className.indexOf("btn-success")!=-1){
			availableCourse[dayHour]["select"] = true
		}
		else{
			availableCourse[dayHour]["select"] = false	
		}
	}
	document.getElementById	('show_price').innerHTML = document.getElementsByClassName('btn-success').length*6000/2;
	nextCheck();
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

function nextCheck(){ /* check next btn */
	var i
	var check = false
	for(i in availableCourse){
		if (availableCourse[i]!=false){
			if (availableCourse[i].select==true && availableCourse[i].tutor.nicknameEng!="Hybrid"){
				check = true;
			}
		}
	}
	if(check){
		document.getElementById("next-btn").className = "btn btn-default";
	}
}

function next(gg){
	if(gg.className.indexOf("disabled")==-1){
		var i
		var cookie=""
		for(i in availableCourse){
			if (availableCourse[i]!=false){
				if(availableCourse[i].select){
					cookie+=availableCourse[i].courseName+":"+i+" ";
				}			
			}
		}
		cookie = "MP123a:sat81 PS4a:sun101"
		writeCookie("regisCourse",cookie);
		self.location = "registrationHybrid.html";
	}
			cookie = "MP123a:sat81 PS4a:sun101"
		writeCookie("regisCourse",cookie);
		self.location = "registrationHybrid.html";
}