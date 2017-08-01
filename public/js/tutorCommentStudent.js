let tutor;
let cookie;
let pos;
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
    cookie = getCookieDict();
    tutor = cookie.monkeyWebUser;
    $.post("post/position", { userID: tutor }).then((data) => {
        pos = data.position;
    })
    if (cookie.commIndex === undefined) {
        writeCookie('commIndex', 0);
    }
    log(parseInt(cookie.commIndex));
    if (parseInt(cookie.commIndex) === 0) $(".previous").toggle();
    showComment(pos, parseInt(cookie.commIndex));
});
function postComment() {
    let comm = $('#search-box .typeahead').typeahead("getActive");
    let x = $('#comment').val();
    if (comm !== undefined) {
        if (comm.length > 7) {
            $.post("post/addStudentComment", {
                studentID: comm.slice(-6, -1),
                tutorID: tutor,
                message: $('#comment').val()
            }, function (data, status) {
                location.reload();
            });
        } else alert("Please Select Correct Name")
    } else alert("Please Input Student Name");
}
function showComment(pos, commIndex) {
    $.post('post/listStudentCommentByIndex', { start: commIndex, limit: 10 }).then((cm) => {
        getName(cm, 0);
        if (cm.comment.length < 10) $(".next").toggle();
    })
}
function getName(cm, i) {
    log("======recur======:" + i);
    $.post('post/name', { userID: cm.comment[i].tutorID }).then((tname) => {
        $.post('post/name', { userID: cm.comment[i].studentID }).then((sname) => {
            let day = moment(cm.comment[i].timestamp, "x").format("DD MMM");
            if (cm.comment[i].priority > 0) {
                $('#commentList').append("<h4><span class='glyphicon glyphicon-pushpin' style='color:red'></span> " +
                    tname.nickname + " -> " + sname.nickname + " " + sname.firstname + " (" + day + ")</h4>");
                $('#commentList').append("<p>" + cm.comment[i].message + "</p>");
            } else {
                $('#commentList').append("<h4>" + tname.nickname + " -> " + sname.nickname + " " + sname.firstname +
                    " (" + day + ")</h4>");
                $('#commentList').append("<p>" + cm.comment[i].message + "</p>");
            }
            if (i < cm.comment.length - 1) getName(cm, i + 1);
        })
    })
}
function commPosition(n) {
    if (n > 0) {
        commIndex = parseInt(cookie.commIndex) + 10;
        writeCookie('commIndex', commIndex);
    } else {
        commIndex = parseInt(cookie.commIndex) - 10;
        writeCookie('commIndex', commIndex);
    }
    location.reload();
}