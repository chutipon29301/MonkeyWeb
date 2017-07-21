$(document).ready(function () {
    var student = [];
    $.post("post/allStudent").then((data) => {
        for (let i = 0; i < data.student.length; i++) {
            if (data.student[i].status === "active") {
                student.push(data.student[i].nickname + " " + data.student[i].firstname + "(" + data.student[i].studentID + ")");
            }
        }
        $('#search-box .typeahead').typeahead({
            source: student,
        });
    });
});
function postComment() {
    let cookie = getCookieDict();
    let comm = $('#search-box .typeahead').typeahead("getActive");
    let x = $('#comment').val();
    if (comm !== undefined) {
        if (comm.length > 5) {
            $.post("post/addStudentComment", {
                studentID: comm.slice(-6, -1),
                tutorID: cookie.monkeyWebUser,
                message: $('#comment').val()
            }, function (data, status) {
                location.reload();
            });
        } else alert("Please Select Correct Name")
    } else alert("Please Input Student Name");
}