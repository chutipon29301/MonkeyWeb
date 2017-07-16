$(document).ready(function(){
    $("[type=submit]").click(function(event){
        event.preventDefault();
        var form=$(this).closest("form");
        var courseID=form.find("[name=courseID]").val();
        var numberOfSub=form.find("[name=numberOfSub]").val();
        var action=$(this).val();
        var tutorEmail=form.attr("tutorEmail");
        var tutorNicknameEn=form.attr("tutorNicknameEn");
        var courseName=form.attr("courseName");
        if(confirm(action.toUpperCase()+" "+courseName+"#"+numberOfSub)){
            $.post(form.attr("action"),{
                courseID:courseID,
                numberOfSub:numberOfSub,
                action:action
            },function(data){
                if(data.err){
                    alert(JSON.stringify(data));
                }
                else{
                    if(action=="accept"||action=="reject"){
                        window.location="mailto:"+tutorEmail+"?subject=TO%20"+tutorNicknameEn+"%20"+courseName+"#"+numberOfSub+"%20"+action.toUpperCase()+"ED";
                    }
                    location.reload();
                }
            });
        }
    });
});
