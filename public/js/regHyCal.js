$(document).ready(function(){
	var cookie = getCookieDict();
	console.log(cookie.regisCourse)
	if(cookie.regisCourse == undefined || cookie.regisCourse == ''){
		self.location = "registrationCourse";
	}
	genTable()
	genTableCookie()
	var daytoDis = ['sat','sun']
	var k
	for(k=0;k<2;k++){
		if($('#skillday').val() == daytoDis[k]){
			var allregCourse = cookie.regisCourse.split(" ");
			var regCourse = []
			var i
			for(i=0;i<allregCourse.length;i++){
				if(allregCourse[i].slice(allregCourse[i].indexOf(':')+1,allregCourse[i].indexOf(':')+4)==daytoDis[k]){
					regCourse.push(allregCourse[i].slice(allregCourse[i].indexOf(':')+1,allregCourse[i].length-1))
				}
			}
			for(i=0;i<regCourse.length;i++){
				var timetoDis = []
				var j
				for(j=-2;j<3;j++){
					timetoDis.push(10*regCourse[i].slice(3,parseInt(regCourse[i].length))+(5*(j+1)))
				}
				for(j=0;j<timetoDis.length;j++){
					$( "#skilltime option[value="+timetoDis[j]+"]" ).wrap( "<span>" );
				}
			}
		}
	}
	$("#skillday").change(function(){
		var daytoDis = ['sat','sun']
		var k
		for(k=0;k<2;k++){
			if($('#skillday').val() == daytoDis[k]){
				var allregCourse = cookie.regisCourse.split(" ");
				var regCourse = []
				var i
				for(i=0;i<allregCourse.length;i++){
					if(allregCourse[i].slice(allregCourse[i].indexOf(':')+1,allregCourse[i].indexOf(':')+4)==daytoDis[k]){
						regCourse.push(allregCourse[i].slice(allregCourse[i].indexOf(':')+1,allregCourse[i].length-1))
					}
				}
				for(i=0;i<regCourse.length;i++){
					var timetoDis = []
					var j
					for(j=-2;j<3;j++){
						timetoDis.push(10*regCourse[i].slice(3,parseInt(regCourse[i].length))+(5*(j+1)))
					}
					for(j=0;j<timetoDis.length;j++){
						$( "#skilltime option[value="+timetoDis[j]+"]" ).wrap( "<span>" );
					}
				}
			}
		}
		var k
		for(k=0;k<2;k++){
			if($('#skillday').val() != daytoDis[k]){
				var allregCourse = cookie.regisCourse.split(" ");
				var regCourse = []
				var i
				for(i=0;i<allregCourse.length;i++){
					if(allregCourse[i].slice(allregCourse[i].indexOf(':')+1,allregCourse[i].indexOf(':')+4)==daytoDis[k]){
						regCourse.push(allregCourse[i].slice(allregCourse[i].indexOf(':')+1,allregCourse[i].length-1))
					}
				}
				for(i=0;i<regCourse.length;i++){
					var timetoDis = []
					var j
					for(j=-2;j<3;j++){
						timetoDis.push(10*regCourse[i].slice(3,parseInt(regCourse[i].length))+(5*(j+1)))
					}
					for(j=0;j<timetoDis.length;j++){
						if ( $( "#skilltime option[value="+timetoDis[j]+"]" ).parent().is( "span" ) ){
    						$( "#skilltime option[value="+timetoDis[j]+"]" ).unwrap();
						}
					}
				}
			}
		}
	})

	$("#station").change(function(){
		if ($(this).val() == "2"){
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
	$("#skilltime,#skillday").change(function(){
		genTable()
		genTableCookie()
		var skilltime = $("#skilltime").val();
		var disTime = [8,10,13,15]
		var i
		var out = []
		for ( i=0;i<disTime.length;i++ ){
			if(parseInt(skilltime)>=(disTime[i]*10) && parseInt(skilltime)<((disTime[i]*10)+20)){
				out.push(disTime[i])
			}
			if(parseInt(skilltime)+10>(disTime[i]*10)+20 && parseInt(skilltime)+10<((disTime[i]*10)+40)){
				out.push(disTime[i]+2)
			}
		}
		for (i=0;i<out.length;i++){
			var disabledClass = document.getElementById('skillday').value+' '+out[i]
			console.log(out[i])
			console.log(disabledClass)
			var j
			var disabledBtn = document.getElementsByClassName('btn-'+disabledClass+'.1')
			console.log(disabledBtn)
			for(j=0;j<disabledBtn.length;j++){
				var raw = disabledBtn[j].className.split(' ')
				disabledBtn[j].className = raw[0]+' '+raw[1]+' btn btn-basic disabled '+raw[raw.length-1]
			}
			disabledBtn = document.getElementsByClassName('btn-'+disabledClass+'.2')
			for(j=0;j<disabledBtn.length;j++){
				var raw = disabledBtn[j].className.split(' ')
				disabledBtn[j].className = raw[0]+' '+raw[1]+' btn btn-basic disabled '+raw[raw.length-1]
			}
		}
	})
})

function genTableCookie(){
	var cookie = getCookieDict();
	var regCourse = cookie.regisCourse.split(" ");
	var i
	for(i=0;i<regCourse.length;i++){
		var temp = regCourse[i].split(":")[1];
		var all1_disabled = document.getElementsByClassName("btn-"+temp.slice(0,3)+" "+temp.slice(3,temp.length-1)+".1")
		var all2_disabled = document.getElementsByClassName("btn-"+temp.slice(0,3)+" "+temp.slice(3,temp.length-1)+".2")
		var j
		for(j=0;j<all1_disabled.length;j++){
			var ini_class = all1_disabled[j].className
			ini_class = ini_class.replace(/btn-default/g,"btn-basic disabled")
			all1_disabled[j].className=ini_class
		}
		for(j=0;j<all2_disabled.length;j++){
			var ini_class = all2_disabled[j].className
			ini_class = ini_class.replace(/btn-default/g,"btn-basic disabled")
			all2_disabled[j].className=ini_class
		}
	}
}

function genTable(){ /* gen normal table at first */
	var satTable = document.getElementsByClassName("btn-sat")
	var sunTable = document.getElementsByClassName("btn-sun")
	var i
	for (i = 0 ; i<satTable.length ; i++){
		var raw = satTable[i].className.split(' ')
		satTable[i].className = raw[0]+' '+raw[1]+' btn btn-default '+raw[raw.length-1]
	}
	for (i = 0 ; i<sunTable.length ; i++){
		var raw = sunTable[i].className.split(' ')
		sunTable[i].className = raw[0]+' '+raw[1]+' btn btn-default '+raw[raw.length-1]
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
