$(document).ready(function(){
    $("form").trigger("reset");
    $("form").submit(function(event){
        event.preventDefault();
        var data=new FormData();
        var form=$(this);
        var file=form.find("[type=file]").get(0).files;
        var courseID=form.find("[name=courseID]").val();
        var numberOfSub=form.find("[name=numberOfSub]").val();
        var courseName=form.find("[name=courseID] option:selected").text();
        var confirmMessage="Submit "+courseName+"#"+numberOfSub;
        for(var i=0;i<file.length;i++){
            data.append("file",file[i],file[i].name);
            confirmMessage+="\nFile#"+(i+1)+" : "+file[i].name;
        }
        data.append("courseID",courseID);
        data.append("numberOfSub",numberOfSub);
        if(confirm(confirmMessage)){
            $("#loadingModal").modal({backdrop:"static"});
            $.ajax({
                url:$(this).attr("action"),
                type:"post",
                data:data,
                processData:false,
                contentType:false,
                success:function(data){
                    if(data.err){
                        alert(JSON.stringify(data));
                    }
                    else location.reload();
                }
            });
        }
    });
});
