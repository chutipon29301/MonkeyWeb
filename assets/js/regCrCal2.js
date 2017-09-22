var cookie
const year = 2017
const quarter = 3
const fee = 7200
$(document).ready(function(){
    deleteCookie("courseID")
    cookie = getCookieDict()
    $.post('/post/studentProfile', {studentID: parseInt(cookie.monkeyWebUser)}).then((data)=>{
        if(data.err) {
            alert("Cannot get data from server!\n Please refresh this page.")
            throw data.err;
        }
        $('#name').val(data.firstname+' ('+data.nickname+') '+data.lastname)
        $('#grade').val((data.grade>6)?'ม. '+(data.grade-6):'ป. '+data.grade)
        return data
    }).then((data)=>{
        $.post('/post/allCourse', {quarter:quarter,year:year}, function(sbj) {
            var time,selectbtn
            for(let i in sbj.course){
                if(checkgrade(sbj.course[i].grade,data.grade)){
                    time = new Date(sbj.course[i].day)
                    selectbtn = $('button.'+time.toDateString().split(' ')[0].toLowerCase()+'[name="'+time.getHours()+'"]')
                    for(let j = 0 ; j < selectbtn.length ; j++){
                        if($(selectbtn[j]).hasClass('disabled')){
                            $(selectbtn[j]).removeClass('disabled')
                            if(sbj.course[i].description!=undefined) $('#description').html($('#description').html()+sbj.course[i].courseName+'('+sbj.course[i].tutorNicknameEn[0]+') : '+sbj.course[i].description+'<br>');
                            $(selectbtn[j]).html(sbj.course[i].courseName+'('+sbj.course[i].tutorNicknameEn[0]+')'+'<span style="display:none">'+sbj.course[i].courseID+'</span>')
                            break
                        }
                    }    
                }
            }
            $.post('/post/listCourseSuggestion', {grade: data.grade}, function(suggest) {
                let allbtn = $('.sat,.sun')
                console.log(suggest)
                for(let i = 0 ; i < allbtn.length ; i++){
                    for(let j in suggest.course){
                        if(suggest.course[j].level == data.level){
                            for(let k in suggest.course[j].courseID){
                                if($($(allbtn[i]).children()[0]).html() == suggest.course[j].courseID[k]) $(allbtn[i]).addClass('suggest');
                            }
                        }
                    }
                }
            });
        });
    })
})

function checkgrade(arr,grade){
    for(let i in arr) if(arr[i] == grade) return true;
    return false;
}

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
    $('#fee').html('Course fee : '+($('.sat.btn-success,.sun.btn-success').length*fee)+' บาท')
}

function next(){
    var allsel = $('.btn-success.sat,.btn-success.sun').children()
    if(allsel.length>1){
        var courseID = []
        for(let i = 0 ; i < allsel.length ; i++){
            courseID.push($(allsel[i]).html())
        }
        writeCookie('courseID',JSON.stringify(courseID))
        self.location = '/registrationHybridTest'    
    }
    else{
        alert('คุณต้องลงทะเบียนอย่างน้อย 2 คอร์ส')
    }
}