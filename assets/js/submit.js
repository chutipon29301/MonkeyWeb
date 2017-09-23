var cookie;
var profile;
var promise = []

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
    promise.push($.post('post/addStudentCourse',{studentID : parseInt(cookie.monkeyWebUser),courseID : cookie.courseID}))
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
    $.post('post/studentProfile',{studentID:parseInt(cookie.monkeyWebUser)},(data)=>{
        if(data.err){
            alert('ขาดการเชื่อมต่อจากเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง')
            self.location = '/registrationCourse'
        }
        profile = data;
    })
    if(cookie.Hybrid){
        $.post('post/v1/listHybridDayInQuarter',{quarter:4 , year : 2017},(data)=>{    
            for(let j in data){
                let time2 = new Date(data[j].day)
                for(let i in cookie.Hybrid){
                    let time1 = new Date(cookie.Hybrid[i].day)
                    if(time1.getDay() == time2.getDay() && time1.getHours() == time2.getHours()){
                        promise.push($.post('post/v1/addHybridStudent',{studentID : parseInt(cookie.monkeyWebUser),subject:cookie.Hybrid[i].subject,hybridID : data[j].hybridID}))
                        break
                    }
                }    
            }
        })
    }
    // if(cookie.skill){
    //     $.post('post/v1/listSkillDayInQuarter',{quarter:quarter , year : year},(data)=>{    
    //         for(let j in data){
    //             let time2 = new Date(data[j].day)
    //             for(let i in cookie.skill){
    //                 let time1 = new Date(cookie.skill[i].day)
    //                 if(time1.getDay() == time2.getDay() && time1.getHours() == time2.getHours() && time1.getMinutes() == time2.getMinutes()){
    //                     promise.push($.post('post/v1/addSkillStudent',{studentID : parseInt(cookie.monkeyWebUser),subject:cookie.skill[i].subject,skillID : data[j].skillID}))
    //                     break
    //                 }
    //             }    
    //         }
    //     })
    // }
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
    if($('#check').is(':checked') || $('#reason').val().length>3){
        $.post('post/listConference',{},(data)=>{
            var conferenceID;
            for(let i in data){
                if(data[i].name.indexOf((profile.grade>6)?'s':'p')>-1){
                    if(profile.grade > 6 && data[i].name.indexOf(profile.grade-6) > -1){
                        conferenceID = data[i].conferenceID    
                    }
                    else if (data[i].name.indexOf(profile.grade)>-1){
                        conferenceID = data[i].conferenceID
                    }
                }
            }
            if(conferenceID){
                promise.push(
                    $.post('post/addStudentToConference',
                        {
                            conferenceID: conferenceID,
                            studentID : parseInt(cookie.monkeyWebUser),
                            isAttended : $('#check').is(':checked')
                        }
                    )
                )    
            }
            Promise.all(promise).then((data)=>{
                for(let i in data){
                    if(data[i].err){
                        alert('การลงทะเบียนมีปัญหา กรุณาติดต่อ Admin')
                        throw data[i].err
                    }
                }
                $.post('post/changeRegistrationState',{studentID : parseInt(cookie.monkeyWebUser),registrationState:'untransferred',quarter:quarter,year:year}).then((data)=>{
                    self.location = '/registrationReceipt'
                })
            })    
        })
    }
    else{
        alert('กรุณากรอกเหตุผลที่ไม่เข้าร่วมการสอบและประชุม')
    }
}