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
    showComment();
});
function postComment() {
    let cookie = getCookieDict();
    let comm = $('#search-box .typeahead').typeahead("getActive");
    let x = $('#comment').val();
    log(comm);
    log(x);
    if (comm !== undefined) {
        if (comm.length > 7) {
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
function showComment() {
    $.post('post/listStudentCommentByIndex', { start: 0, limit: 30 }).then((cm) => {
        log(cm)
        for (let i = 0; i < cm.comment.length; i++) {
            $.post('post/name', { userID: cm.comment[i].tutorID }).then((name) => {
                $.post('post/name', { userID: cm.comment[i].studentID }, function (data, status) {
                    let day = moment(cm.comment[i].timestamp, "x").format("DD MMM");
                    if (cm.comment[i].priority > 0) {
                        $('#commentList').append("<h4><span class='glyphicon glyphicon-pushpin'></span>" + name.nickname + "=>" +
                            data.nickname + " (" + day + ")</h4>");
                        $('#commentList').append("<p> " + cm.comment[i].message + "</p>");
                    } else {
                        $('#commentList').append("<h4>" + name.nickname + " => " + data.nickname + " (" + day + ")</h4>");
                        $('#commentList').append("<p> " + cm.comment[i].message + "</p>");
                    }
                })
            })
        }
    })
}