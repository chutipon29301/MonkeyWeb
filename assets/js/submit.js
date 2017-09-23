var cookie

$(document).ready(function(){
    cookie = getCookieDict()
    if(cookie.courseID){
        cookie.courseID = JSON.parse(cookie.courseID)
        $('#fee').html('ค่าลงทะเบียนคอร์ส : '+(fee*cookie.courseID.length) + ' บาท')
    }
    else{
        self.location = '/registrationCourse'
    }
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
    if(cookie.skill){
        cookie.skill = JSON.parse(cookie.skill)
        for(let i in cookie.skill){
            fillTable(cookie.skill[i],'skill')
        }
    }
    $('#check').change(function(){
        if($('#check').is(':checked')){
            $('#reason').hide()
        }
        else{
            $('#reason').show()
        }
    })
})

function fillTable(course,option){
    let time = new Date(course.day)
    if(option == 'skill'){
        let btn = $((time.getDay() == 6?'.sat':time.getDay() == 0?'.sun':time.getDay() == 2?'.tue':time.getDay() == 4?'.thu':'') +'[name="'+course.btn+'"]')
        if(btn.hasClass('skill')){
            btn.html(((course.subject == 'M')?'Math/':'Eng/')+btn.html().split(' ')[0]+'(Skill)')
        }
        else{
            btn.addClass('skill').html(course.text)    
        }
    }
    else if (time.getDay() == 6 || time.getDay() == 0 || time.getDay() == 2 || time.getDay() == 4){
        let btn = $((time.getDay() == 6?'.sat':time.getDay() == 0?'.sun':time.getDay() == 2?'.tue':time.getDay() == 4?'.thu':'') +'[name="'+time.getHours()+'"]')
        if(option == 'hybrid'){
            btn.addClass('hybrid').html(course.subject == 'M'?'Math(FHB)':'Physics(FHB)')
        }
        else{
            btn.addClass('course').html(course.courseName+'('+course.tutorNicknameEn[0]+')')    
        }
    }
}

function confirm(){
    var promise = []
    if($('#check').is(':checked') || $('#reason').val().length>3){
        $.post('post/listConference',{},(data)=>{
            promise.push($.post('post/addStudentCourse',{studentID : parseInt(cookie.monkeyWebUser),courseID : cookie.courseID}))
            if(cookie.Hybrid){
                for(let i in cookie.Hybrid){
                    promise.push($.post('post/addHybridDay',{studentID : parseInt(cookie.monkeyWebUser),subject:cookie.Hybrid[i].subject,day:cookie.Hybrid[i].day}))
                }    
            }
            if(cookie.skill){
                for(let i in cookie.skill){
                    promise.push($.post('post/addSkillDay',{studentID : parseInt(cookie.monkeyWebUser),subject:cookie.skill[i].subject,day:cookie.skill[i].day}))
                }
            }
            promise.push(
                $.post('post/addStudentToConference',
                    {
                        //conferenceID: something
                        studentID : parseInt(cookie.monkeyWebUser),
                        isAttended : $('#check').is(':checked')
                    }
                )
            )
            promise.push($.post('post/changeRegistrationState',{studentID : parseInt(cookie.monkeyWebUser),registrationState:'untransferred',quarter:quarter,year:year}))
            Promise.all(promise).then((data)=>{
                for(let i in data){
                    if(data[i].err){
                        alert('การลงทะเบียนมีปัญหา กรุณาติดต่อ Admin')
                        throw data[i].err
                    }
                }
                self.location = '/registrationReceipt'
            })    
        })
    }
    else{
        alert('กรุณากรอกเหตุผลที่ไม่เข้าร่วมการสอบและประชุม')
    }
}