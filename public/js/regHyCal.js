$(document).ready(function(){
	var cookie = getCookieDict();
	console.log(cookie)
	var regCourse = cookie.regisCourse.split(" ");
	console.log(regCourse)
	var i
	for(i=0;i<regCourse.length;i++){
		var temp = regCourse[i].split(":")[1];
		var all1_disabled = document.getElementsByClassName("btn-"+temp.slice(0,3)+" "+temp.slice(3,temp.length-1)+".1")
		console.log(all1_disabled)
		console.log(all1_disabled.length)
		var all2_disabled = document.getElementsByClassName("btn-"+temp.slice(0,3)+" "+temp.slice(3,temp.length-1)+".2")
		var j
		for(j=0;j<all1_disabled.length;j++){
			var ini_class = all1_disabled[j].className
			console.log(ini_class)
			ini_class = ini_class.replace(/btn-default/g,"btn-basic disabled")
			console.log(ini_class)
			all1_disabled[j].className=ini_class
		}
		for(j=0;j<all2_disabled.length;j++){
			var ini_class = all2_disabled[j].className
			ini_class = ini_class.replace(/btn-default/g,"btn-basic disabled")
			all2_disabled[j].className=ini_class
		}
	}
})




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
	/*
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
	*/
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