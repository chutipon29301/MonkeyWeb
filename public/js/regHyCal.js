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