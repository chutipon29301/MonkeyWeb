//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const studentProfile = (studentID) => $.post("post/studentProfile", {
    studentID: studentID
});
//noinspection ES6ModulesDependencies,NodeModulesDependencies,JSUnresolvedFunction
const courseInfo = (courseID) => $.post("post/courseInfo", {
    courseID: courseID
});
$(document).ready(function(){
    genTable()
    var cookie = getCookieDict()
    $('#studentID').html('ID : '+cookie.monkeyWebUser)        
    console.log(cookie)
    studentProfile(parseInt(cookie.monkeyWebUser)).then((data) => {
        $('#name').html(data.nickname+' '+data.firstname+' '+data.lastname)
        $('#nameE').html(data.nicknameEn+' '+data.firstnameEn+' '+data.lastnameEn)
        $('#studentTel').html(data.phone)
        $('#parentTel').html(data.phoneParent)
        $('#email').html(data.email)
        $('#grade').html(() => {
            if(parseInt(data.grade)>6){
                return 'มัธยม '+(parseInt(data.grade)-6)
            }
            else{ return 'ประถม '+data.grade}
        })
        console.log(data)
        for(let i in data.hybridDay){
            var hybrid = document.getElementsByClassName('btn-'+(numtoDay((new Date(parseInt(data.hybridDay[i].day))).getDay()))+' '+(new Date(parseInt(data.hybridDay[i].day))).getHours()+'.1')
            for(j=0;j<hybrid.length;j++){
                hybrid[j].className = hybrid[j].className+' hb'
                hybrid[j].innerHTML = '<strong>FHB :</strong>' + '<br>' + fullHBname(data.hybridDay[i].subject)
            }
        }
        for(let i in data.skillDay){
            switch ((new Date(parseInt(data.skillDay[i].day))).getHours()){
                case 9: 
                    var time = '8'
                    break;
                case 10: case 11:
                    var time = '10'
                    break ;
                case 13: case 14:
                    var time = '13'
                    break;
                case 15:
                    var time = '15' 
                    break;
                default:
                    break;
            }
            console.log((new Date(parseInt(data.skillDay[i].day))).getHours())
            console.log(time)
            var skill = document.getElementsByClassName('btn-'+(numtoDay((new Date(parseInt(data.skillDay[i].day))).getDay()))+' '+time+'.1')
            for(j=0;j<skill.length;j++){
                if(!(skill[j].className.indexOf('sk')!=-1)){
                    skill[j].className = skill[j].className+' sk'
                    if((new Date(parseInt(data.skillDay[i].day))).getMinutes() == 0){
                        var temp = (new Date(parseInt(data.skillDay[i].day))).getHours()+'.00 น.'
                    }
                    else{
                        var temp = (new Date(parseInt(data.skillDay[i].day))).getHours()+'.30 น.'
                    }
                    skill[j].innerHTML = '<strong>SKILL '+ data.skillDay[i].subject + ' :</strong>' + '<br>' + temp
                }
                else{
                    if(skill[j].innerHTML.split('<br>')[1].split(' ')[0]<=(new Date(parseInt(data.skillDay[i].day))).getHours()+'.'+(new Date(parseInt(data.skillDay[i].day))).getMinutes()/100){
                        var temp = skill[j].innerHTML.split('<br>')[1].split(' ')[0]+'0 น.'
                    }
                    else{
                        var temp = (new Date(parseInt(data.skillDay[i].day))).getHours()+'.'+(new Date(parseInt(data.skillDay[i].day))).getMinutes()/100+'0 น.'
                    }
                    skill[j].innerHTML = '<strong>SKILL M/E :</strong>' + '<br>' + temp
                }
            }
        }
        for(let i in data.courseID){
            courseInfo(data.courseID[i]).then((cr) => {
                var course = document.getElementsByClassName('btn-'+(numtoDay((new Date(parseInt(cr.day))).getDay()))+' '+(new Date(parseInt(cr.day))).getHours()+'.1')
                for(j=0;j<course.length;j++){
                    course[j].className = course[j].className+' cr'
                    course[j].innerHTML = '<strong>CR :</strong>' + '<br>' + cr.courseName
                }
            })
        }
    })
})

function genTable() {
    var temp = document.getElementsByClassName('disabled');
    for (let i = 0; i < temp.length; i++) {
        var name = '';
        for (let j = 0; j < 6; j++) {
            name += temp[i].className.split(' ')[j] + ' ';
        }
        temp[i].className = name;
        temp[i].innerHTML = '&nbsp;'+'<br>'+'&nbsp;';
    }
}