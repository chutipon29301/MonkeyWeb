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
    writeCookie('commIndex', 0);
    cookie = getCookieDict();
    $.post("post/position", { userID: tutor }).then((data) => {
        pos = data.position;
        writeCookie('pos', pos);
        showComment(pos, parseInt(cookie.commIndex));
    })
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
        $('#commentList').empty();
        (pos !== "tutor") ? getNameAdmin(cm, 0) : getName(cm, 0);
        if (cm.comment.length < 10) {
            $(".next").hide();
        } else $(".next").show();
        if (parseInt(commIndex) === 0) {
            $(".previous").hide();
        } else $(".previous").show();
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
                    ") <span class='glyphicon glyphicon-option-vertical'></span></h4>");
                $('.dropdown:last-child').append("<ul class='dropdown-menu'><li><a onClick='addPin(\"" + cm.comment[i].commentID + "\")'>PIN</a></li><li><a onClick='rmPin(\"" + cm.comment[i].commentID + "\")'>UNPIN</a></li><li><a onClick='rmComm(\"" + cm.comment[i].commentID + "\")'>REMOVE</a></li></ul>");
                $('#commentList').append("<p>" + cm.comment[i].message + "</p>");
            } else {
                $('#commentList').append("<div class='dropdown'></div>");
                $('.dropdown:last-child').append("<h4 class='dropdown-toggle' data-toggle='dropdown'>" +
                    tname.nickname + " -> " + sname.nickname + " " + sname.firstname + " (" + day +
                    ") <span class='glyphicon glyphicon-option-vertical'></span></h4>");
                $('.dropdown:last-child').append("<ul class='dropdown-menu'><li><a onClick='addPin(\"" + cm.comment[i].commentID + "\")'>PIN</a></li><li><a onClick='rmPin(\"" + cm.comment[i].commentID + "\")'>UNPIN</a></li><li><a onClick='rmComm(\"" + cm.comment[i].commentID + "\")'>REMOVE</a></li></ul>");
                $('#commentList').append("<p>" + cm.comment[i].message + "</p>");
            }
            if (i < cm.comment.length - 1) getNameAdmin(cm, i + 1);
        })
    })
}
function commPosition(n) {
    let cookie = getCookieDict();
    let commIndex;
    if (n > 0) {
        commIndex = parseInt(cookie.commIndex) + 10;
        writeCookie('commIndex', commIndex);
    } else {
        commIndex = parseInt(cookie.commIndex) - 10;
        writeCookie('commIndex', commIndex);
    }
    let pos = cookie.pos;
    showComment(pos, commIndex);
}
function addPin(commID) {
    let cookie = getCookieDict();
    let pos = cookie.pos;
    $.post('post/changeStudentCommentPriority', { commentID: commID, priority: 1 }).then((data) => {
        showComment(pos, parseInt(cookie.commIndex));
    })
}
function rmPin(commID) {
    let cookie = getCookieDict();
    let pos = cookie.pos;
    $.post('post/changeStudentCommentPriority', { commentID: commID, priority: 0 }).then((data) => {
        showComment(pos, parseInt(cookie.commIndex));
    })
}
function rmComm(commID) {
    let cookie = getCookieDict();
    let pos = cookie.pos;
    $.post('post/removeStudentComment', { commentID: commID }).then((data) => {
        showComment(pos, parseInt(cookie.commIndex));
    })
}