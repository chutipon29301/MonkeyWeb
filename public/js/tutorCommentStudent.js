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
    let cookie = getCookieDict();
    let tutor = cookie.monkeyWebUser;
    let pos;
    $.post("post/position", { userID: tutor }).then((data) => {
        pos = data.position;
        showComment(pos, parseInt(cookie.commIndex));
    })
    if (cookie.commIndex === undefined) {
        writeCookie('commIndex', 0);
    }
    log(parseInt(cookie.commIndex));
    if (parseInt(cookie.commIndex) === 0) $(".previous").toggle();
    $("#postButton").click(function () {
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
    });
});

function showComment(pos, commIndex) {
    $.post('post/listStudentCommentByIndex', { start: commIndex, limit: 10 }).then((cm) => {
        (pos !== "tutor") ? getNameAdmin(cm, 0) : getName(cm, 0);
        if (cm.comment.length < 10) $(".next").toggle();
    })
}
// tutor showComment method
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
// admin showComment method
function getNameAdmin(cm, i) {
    log("======recur======:" + i);
    $.post('post/name', { userID: cm.comment[i].tutorID }).then((tname) => {
        $.post('post/name', { userID: cm.comment[i].studentID }).then((sname) => {
            let day = moment(cm.comment[i].timestamp, "x").format("DD MMM");
            if (cm.comment[i].priority > 0) {
                $('#commentList').append("<div class='dropdown'></div>");
                $('.dropdown:last-child').append("<h4 class='dropdown-toggle' data-toggle='dropdown'><span class='glyphicon glyphicon-pushpin' style='color:red'></span> " +
                    tname.nickname + " -> " + sname.nickname + " " + sname.firstname + " (" + day +
                    ")</h4>");
                $('.dropdown:last-child').append("<ul class='dropdown-menu'><li><a onClick='addPin(\"" + cm.comment[i].commentID + "\")'>PIN</a></li><li><a onClick='rmPin(\"" + cm.comment[i].commentID + "\")'>UNPIN</a></li><li><a onClick='rmComm(\"" + cm.comment[i].commentID + "\")'>REMOVE</a></li></ul>");
                $('#commentList').append("<p>" + cm.comment[i].message + "</p>");
            } else {
                $('#commentList').append("<div class='dropdown'></div>");
                $('.dropdown:last-child').append("<h4 class='dropdown-toggle' data-toggle='dropdown'>" +
                    tname.nickname + " -> " + sname.nickname + " " + sname.firstname + " (" + day +
                    ")</h4>");
                $('.dropdown:last-child').append("<ul class='dropdown-menu'><li><a onClick='addPin(\"" + cm.comment[i].commentID + "\")'>PIN</a></li><li><a onClick='rmPin(\"" + cm.comment[i].commentID + "\")'>UNPIN</a></li><li><a onClick='rmComm(\"" + cm.comment[i].commentID + "\")'>REMOVE</a></li></ul>");
                $('#commentList').append("<p>" + cm.comment[i].message + "</p>");
            }
            if (i < cm.comment.length - 1) getNameAdmin(cm, i + 1);
        })
    })
}
function commPosition(n) {
    let cookie = getCookieDict();
    if (n > 0) {
        commIndex = parseInt(cookie.commIndex) + 10;
        writeCookie('commIndex', commIndex);
    } else {
        commIndex = parseInt(cookie.commIndex) - 10;
        writeCookie('commIndex', commIndex);
    }
    location.reload();
}
function addPin(commID) {
    $.post('post/changeStudentCommentPriority', { commentID: commID, priority: 1 }).then((data) => {
        location.reload();
    })
}
function rmPin(commID) {
    $.post('post/changeStudentCommentPriority', { commentID: commID, priority: 0 }).then((data) => {
        location.reload();
    })
}
function rmComm(commID) {
    $.post('post/removeStudentComment', { commentID: commID }).then((data) => {
        location.reload();
    })
}