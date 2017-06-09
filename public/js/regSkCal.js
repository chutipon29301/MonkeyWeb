$(document).ready(function(){
	modal = document.getElementById('id01');
	genTable()
	updateTable()
	var cookie = getCookieDict();
	cookie.regisCourse = JSON.parse(cookie.regisCourse)
	cookie.regisHybrid = JSON.parse(cookie.regisHybrid)
	for(i in cookie.regisCourse){
		if(cookie.regisCourse[i]!=false){
			cookie.regisCourse[i].day = new Date(cookie.regisCourse[i].day)
			if(cookie.regisCourse[i].day.getDay()==6 && cookie.regisCourse[i].select==true){
				var time = cookie.regisCourse[i].day.getHours()
				for(j=0;j<4;j++){
					var temp = (10*time)+(j*5)
					$( "#skilltime option[value="+temp+"],#skilltimeEng option[value="+temp+"]" ).wrap( "<span>" );
				}
			}
		}
	}
	for(i in cookie.regisHybrid){
		if(cookie.regisHybrid[i]!=false){
			cookie.regisHybrid[i].day = new Date(cookie.regisHybrid[i].day)
			if(cookie.regisHybrid[i].day.getDay()==6){
				var time = cookie.regisHybrid[i].day.getHours()
				for(j=0;j<4;j++){
					var temp = (10*time)+(j*5)
					$( "#skilltime option[value="+temp+"],#skilltimeEng option[value="+temp+"]" ).wrap( "<span>" );
				}
			}
		}
	}
	$('#skillSel').change(function(){
		console.log($('#skillSel').val())
		switch(parseInt($('#skillSel').val())){
			case 1:
				$('#math,#eng').show()
				break;
			case 2:
				$('#math').show()
				$('#eng').hide()
				$('#skilltimeEng').val('0')
				break;
			case 3:
				$('#math').hide()
				$('#eng').show()
				$('#skilltime').val('0')
				break;
			case 4:
				$('#math,#eng').hide()
				$('#skilltimeEng').val('0')
				$('#skilltime').val('0')
				break;
		}
	})
	$('#skillday').change(function(){
		var time = ['90','95','100','105','110','130','135','140','145','150']
		for(i=0;i<time.length;i++){
			if ( $( "#skilltime option[value="+time[i]+"]" ).parent().is( "span" ) ){
				$( "#skilltime option[value="+time[i]+"]" ).unwrap();
			}
		}
		var cookie = getCookieDict();
		cookie.regisCourse = JSON.parse(cookie.regisCourse)
		cookie.regisHybrid = JSON.parse(cookie.regisHybrid)
		for(i in cookie.regisCourse){
			if(cookie.regisCourse[i]!=false){
				cookie.regisCourse[i].day = new Date(cookie.regisCourse[i].day)
				if(cookie.regisCourse[i].day.getDay()==daytoNum($('#skillday').val()) && cookie.regisCourse[i].select==true){
					var time = cookie.regisCourse[i].day.getHours()
					for(j=0;j<4;j++){
						var temp = (10*time)+(j*5)
						$( "#skilltime option[value="+temp+"]").wrap( "<span>" );
					}
				}
			}
		}
		for(i in cookie.regisHybrid){
			if(cookie.regisHybrid[i]!=false){
				cookie.regisHybrid[i].day = new Date(cookie.regisHybrid[i].day)
				if(cookie.regisHybrid[i].day.getDay()==daytoNum($('#skillday').val())){
					var time = cookie.regisHybrid[i].day.getHours()
					for(j=0;j<4;j++){
						var temp = (10*time)+(j*5)
						$( "#skilltime option[value="+temp+"]" ).wrap( "<span>" );
					}
				}
			}
		}
	})
	
	$('#skilldayEng').change(function(){
		var time = ['90','95','100','105','110','130','135','140','145','150']
		for(i=0;i<time.length;i++){
			if ( $( "#skilltimeEng option[value="+time[i]+"]" ).parent().is( "span" ) ){
				$( "#skilltimeEng option[value="+time[i]+"]" ).unwrap();
			}
		}
		var cookie = getCookieDict();
		cookie.regisCourse = JSON.parse(cookie.regisCourse)
		cookie.regisHybrid = JSON.parse(cookie.regisHybrid)
		for(i in cookie.regisCourse){
			if(cookie.regisCourse[i]!=false){
				cookie.regisCourse[i].day = new Date(cookie.regisCourse[i].day)
				if(cookie.regisCourse[i].day.getDay()==daytoNum($('#skilldayEng').val()) && cookie.regisCourse[i].select==true){
					var time = cookie.regisCourse[i].day.getHours()
					for(j=0;j<4;j++){
						var temp = (10*time)+(j*5)
						$( "#skilltimeEng option[value="+temp+"]").wrap( "<span>" );
					}
				}
			}
		}
		for(i in cookie.regisHybrid){
			if(cookie.regisHybrid[i]!=false){
				cookie.regisHybrid[i].day = new Date(cookie.regisHybrid[i].day)
				if(cookie.regisHybrid[i].day.getDay()==daytoNum($('#skilldayEng').val())){
					var time = cookie.regisHybrid[i].day.getHours()
					for(j=0;j<4;j++){
						var temp = (10*time)+(j*5)
						$( "#skilltimeEng option[value="+temp+"]" ).wrap( "<span>" );
					}
				}
			}
		}
	})
	
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
	$("#stationEng").change(function(){
		if ($(this).val() == "2"){
			$('#skilltime').val('0')
			document.getElementById('skilldayEng').disabled = true
			document.getElementById('skilldayEng').style = "visibility:hidden"
			document.getElementById('skilltimeEng').disabled = true
			document.getElementById('skilltimeEng').style = "visibility:hidden"
			document.getElementById('skilltimeEng').value = "0"

		}
		else{
			document.getElementById('skilldayEng').disabled = false
			document.getElementById('skilldayEng').style = ""
			document.getElementById('skilltimeEng').disabled = false
			document.getElementById('skilltimeEng').style = ""
		}
	})

	$('#skilltime,#skilltimeEng,#skillday,#skilldayEng').change(function(){
		if($('#skillday').val() == $('#skilldayEng').val() && ($('#skilltime').val() == $('#skilltimeEng').val() || parseInt($('#skilltime').val())+5 == parseInt($('#skilltimeEng').val()) || parseInt($('#skilltime').val()) == parseInt($('#skilltimeEng').val())+5)){
			if($('#skilltime').val()!='0'){
				alert('คุณไม่สามารถเลือกเวลาเรียนทับกันได้')
				$('#skilltimeEng').val('0')
				$('#skilltime').val('0')
			}
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

function daytoNum(day) {
    switch (day) {
        case 'sun':
            return 0;
        case 'mon':
            return 1;
        case 'tue':
            return 2;
        case 'wed':
            return 3;
        case 'thu':
            return 4;
        case 'fri':
            return 5;
        case 'sat':
            return 6
    }
}