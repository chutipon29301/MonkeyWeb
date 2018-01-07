var cookie

$(document).ready(function(){
	deleteCookie("Hybrid")
	cookie = getCookieDict()
	if(cookie.courseID){
		cookie.courseID = JSON.parse(cookie.courseID)
	}
	else{
		self.location = '/registrationCourse'
	}
	
	let allbtn = $('.sat,.sun,.thu,.tue').removeClass('disabled')
	$.post('post/allCourse',{quarter:quarter , year:year},(data)=>{
		for(let i in data.course){
			if(cookie.courseID.indexOf(data.course[i].courseID)>-1){
				fillTable(data.course[i])
			}
		}
	})
})

function btntoggle(btn){
    $(btn).blur();
    if ($(btn).hasClass('btn-success')) {
        $(btn).removeClass('btn-success').addClass('btn-default')
    }
    else{
        $('.'+($(btn).hasClass('sat')?'sat':$(btn).hasClass('sun')?'sun':$(btn).hasClass('thu')?'thu':$(btn).hasClass('tue')?'tue':'')+'[name="'+btn.name+'"]').removeClass('btn-success').addClass('btn-default')
        if(!$(btn).hasClass('disabled')){
            $(btn).removeClass('btn-default').addClass('btn-success')
        }
    }
    // $('#fee').html('Course fee : '+($('.sat.btn-success,.sun.btn-success').length*fee)+' บาท')
}

function fillTable(course){
	let time = new Date(course.day)
	let btn = $((time.getDay() == 6?'.sat':'.sun') +'[name="'+time.getHours()+'"]').addClass('course').addClass('disabled').html(course.courseName+'('+course.tutorNicknameEn[0]+')')
	$(btn[0]).removeClass('col-sm-6').addClass('col-sm-12')
	$(btn[1]).hide()
}

function next(){
	var all = ['tue','thu','sat','sun']
	var Hybrid = []
	var btn
	if($('.btn-success.sat,.btn-success.sun,.btn-success.tue,.btn-success.thu').length>0){
		$.post('post/v1/listHybridDayInQuarter',{quarter:quarter , year : year},(data)=>{
			for(let i = 0 ; i < all.length ; i++){
				btn = $('.btn-success.'+all[i])
				for(let j = 0 ; j < btn.length ; j++){
					for(let k in data){
						let time = new Date(data[k].day)
						if(time.getHours() == parseInt(btn[j].name) && time.getDay() == daytoNum(all[i])){
							Hybrid.push(JSON.stringify({ studentID : cookie.monkeyWebUser , day : moment(0).day(daytoNum(all[i])).hour(parseInt(btn[j].name)).valueOf() , subject : $(btn[j]).hasClass('M')?'M':'PH' , hybridID : data[k].hybridID}))	
							break
						}
					}
				}
			}
			writeCookie('Hybrid',JSON.stringify(Hybrid))
			self.location = '/registrationSkill'
		})
	}
	else{
		self.location = '/registrationSkill'
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