var cookie
var selectBtn;

$(document).ready(function(){
    deleteCookie('skill')
    cookie = getCookieDict()
    if(cookie.courseID){
        cookie.courseID = JSON.parse(cookie.courseID)    
    }
    else{
        self.location = '/registrationCourse'
    }
    $('.sat.disabled,.sun.disabled').removeClass('disabled')
    if(cookie.Hybrid) {
        cookie.Hybrid = JSON.parse(cookie.Hybrid)
        for(let i in cookie.Hybrid){
            cookie.Hybrid[i] = JSON.parse(cookie.Hybrid[i])
            fillTable(cookie.Hybrid[i],'hybrid')
        }
    }
    

    $.post('post/allCourse',{quarter:quarter , year:year},(data)=>{
        for(let i in data.course){
            if(cookie.courseID.indexOf(data.course[i].courseID)>-1){
                fillTable(data.course[i])
            }
        }
    })
})

function btntoggle(btn){
    if($(btn).hasClass('btn-success')){
        $($(btn).hasClass('M')?'.M':'.E').removeClass('disabled')
        $(btn).addClass('btn-default').removeClass('btn-success').blur().html($(btn).html().split(' ')[0])
    }
    else if(!$(btn).hasClass('disabled')){
        selectBtn = btn;
        let alltime = $('#time').children().show()
        let remain = ['.00','.30','.00']
        let hr = parseInt($(btn).attr('name'))
        for(let i = 0 ; i < alltime.length ; i++){
            if(i == 2) hr++;
            $(alltime[i]).html((($(btn).hasClass('sat'))?'Sat ':'Sun ')+hr+remain[i]+'-'+(hr+1)+remain[i]+' น.')
        }
        if(btn.name == '8'){
            $(alltime[0]).hide()
            $(alltime[1]).hide();
        } 
        if(btn.name == '15'){
            $(alltime[1]).hide();
            $(alltime[2]).hide();
        }
        $('#timeSelect').modal();  
    } 
}

function fillTable(course,option){
    let time = new Date(course.day)
    if (time.getDay() == 6 || time.getDay() == 0){
        let btn = $((time.getDay() == 6?'.sat':time.getDay() == 0?'.sun':'') +'[name="'+time.getHours()+'"]')
        if(option == 'hybrid'){
            btn.addClass('hybrid').addClass('disabled').html(course.subject == 'M'?'Math(FHB)':'Physics(FHB)')
        }
        else{
            btn.addClass('course').addClass('disabled').html(course.courseName+'('+course.tutorNicknameEn[0]+')')    
        }
        $(btn[0]).removeClass('col-md-6').addClass('col-md-12').removeClass($(btn[0]).hasClass('M')?'M':'E')
        $(btn[1]).hide()    
    }
}

function addTime(btn){
    $($(selectBtn).hasClass('M')?'.M':'.E').addClass('disabled')
    $(selectBtn).removeClass('btn-default').removeClass('disabled').addClass('btn-success').html($(selectBtn).html()+' '+$(btn).html().split(' ')[1])

}

function next(){
    var allselect = $('.sat.btn-success,.sun.btn-success')
    var skill = []
    if(allselect.length == 2 && $(allselect[0]).html().split(' ')[1] == $(allselect[1]).html().split(' ')[1] && $(allselect[0]).hasClass('sat') == $(allselect[1]).hasClass('sat')){
        alert('ไม่สามารถเลือกเวลาเรียนทับกันได้')
    }
    else if(allselect.length>0){
        for(let i = 0 ; i < allselect.length ; i++){
            skill.push({
                studentID : cookie.monkeyWebUser ,
                subject : $(allselect[i]).hasClass('M')?'M':'E' ,
                day : moment(0).day($(allselect[i]).hasClass('sat')?6:7).hour(parseInt($(allselect[i]).html().split(' ')[1].split('-')[0])).minute(parseInt($(allselect[i]).html().split(' ')[1].split('-')[0].split('.')[1])).valueOf(),
                btn : allselect[i].name,
                text : $(allselect[i]).html()
            })
        }
        writeCookie('skill',JSON.stringify(skill))
        self.location = '/submit'
    }
    else if(allselect.length == 0){
        self.location = '/submit'   
    }
}