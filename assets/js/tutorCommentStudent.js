$(document).ready(function () {
    // fix touch on iphone
    $('body').on('touchstart.dropdown', '.dropdown-menu', function (e) {
        e.stopPropagation();
    });
    // for add student to search box
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
    // for post comment
    $("#uploadButton").click(function () {
        $("#uploadModal").modal();
    });
    $("#postButton").click(function () {
        let comm = $('#search-box .typeahead').typeahead("getActive");
        let ufile = $('#file-1');
        let ext = ufile.val().split('.').pop().toLowerCase();
        if (comm !== undefined) {
            if (comm.length > 7) {
                let formData = new FormData();
                formData.append("studentID", comm.slice(-6, -1));
                formData.append("tutorID", tutor);
                formData.append("message", $('#comment').val());
                log(ext);
                if (ext === "") {
                    log("No Picture");
                    $.ajax({
                        url: 'post/addStudentComment',
                        type: 'POST',
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function (data) {
                            location.reload();
                        }
                    });
                } else if ($.inArray(ext, ['png', 'jpg', 'jpeg']) === -1) {
                    alert('กรุณาอัพไฟล์ .jpg, .jpeg หรือ .png เท่านั้น');
                } else {
                    let files = ufile.get(0).files;
                    if (files.length > 0) {
                        for (let i = 0; i < files.length; i++) {
                            let file = files[i];
                            formData.append('attachment', file, file.name);
                        }
                        $.ajax({
                            url: 'post/addStudentComment',
                            type: 'POST',
                            data: formData,
                            processData: false,
                            contentType: false,
                            success: function (data) {
                                location.reload();
                            }
                        });
                    }
                }
            } else alert("Please Select Correct Name")
        } else alert("Please Input Student Name");
    });
    // for show comment when load page
    let cookie = getCookieDict();
    let tutor = cookie.monkeyWebUser;
    let pos;
    writeCookie('commIndex', 0);
    cookie = getCookieDict();
    genPagination(1);
    $.post("post/position", { userID: tutor }).then((data) => {
        pos = data.position;
        writeCookie('pos', pos);
        showComment(pos, parseInt(cookie.commIndex));
    })
});
// for show comment
function showComment(pos, commIndex) {
    writeCookie('commIndex', commIndex);
    $.post('post/listStudentCommentByIndex', { start: commIndex, limit: 20 }).then((cm) => {
        $('#commentList').empty();
        // hide next button on last page
        if (cm.comment.length < 20) {
            $(".next").hide();
        } else if (cm.comment.length === 20) {
            $.post('post/listStudentCommentByIndex', { start: commIndex + 20, limit: 1 }).then((ckcm) => {
                (ckcm.comment.length === 0) ? $(".next").hide() : $(".next").show();
            })
        } else $(".next").show();
        // hide previous button on 1st page
        if (parseInt(commIndex) === 0) {
            $(".previous").hide();
        } else $(".previous").show();
        // chk error on pagination overflow
        genPagination(commIndex / 20 + 1);
        if (cm.comment.length === 0) {
            showComment(pos, commIndex - 20);
        }
        (pos !== "tutor") ? getNameAdmin(cm, 0) : getName(cm, 0);
    })
}
// tutor showComment method
function getName(cm, i) {
    log("======recur======:" + i);
    // get tutor name
    $.post('post/name', { userID: cm.comment[i].tutorID }).then((tname) => {
        // get student name
        $.post('post/name', { userID: cm.comment[i].studentID }).then((sname) => {
            let day = moment(cm.comment[i].timestamp, "x").format("DD MMM");
            let str = "<h4><span style='color:green' class='glyphicon glyphicon-ok" + (cm.comment[i].isCleared ? "" : " hidden") + "'></span><span class='glyphicon glyphicon-pushpin" + (cm.comment[i].priority > 0 ? "" : " hidden") + "' style='color:red'></span> " +
                tname.nickname + " -> " + sname.nickname + " " + sname.firstname + " (" + day + ")</h4>";
            $('#commentList').append(str);
            $('#commentList').append("<p>" + cm.comment[i].message + "</p>");
            $.post('post/getConfig').then((config) => {
                let path = config.studentCommentPicturePath;
                path = path.slice(path.search("MonkeyWebData") + 14) + cm.comment[i].commentID;
                $.get(path + ".jpg").done(function (result) {
                    $('#commentList').append("<div class='row'><img class='col-sm-4 col-xs-10' src='" + path + ".jpg" + "' class='img-thumbnail'></div>");
                    if (i < cm.comment.length - 1) getName(cm, i + 1);
                }).fail(function () {
                    $.get(path + ".jpeg").done(function (result) {
                        $('#commentList').append("<div class='row'><img class='col-sm-4 col-xs-10' src='" + path + ".jpeg" + "' class='img-thumbnail'></div>");
                        if (i < cm.comment.length - 1) getName(cm, i + 1);
                    }).fail(function () {
                        $.get(path + ".png").done(function (result) {
                            $('#commentList').append("<div class='row'><img class='col-sm-4 col-xs-10' src='" + path + ".png" + "' class='img-thumbnail'></div>");
                            if (i < cm.comment.length - 1) getName(cm, i + 1);
                        }).fail(function () {
                            if (i < cm.comment.length - 1) getName(cm, i + 1);
                        });
                    });
                });

            })
        })
    })
}
// admin showComment method
function getNameAdmin(cm, i) {
    log("======recur======:" + i);
    //get tutor name
    $.post('post/name', { userID: cm.comment[i].tutorID }).then((tname) => {
        // get student name
        $.post('post/name', { userID: cm.comment[i].studentID }).then((sname) => {
            let day = moment(cm.comment[i].timestamp, "x").format("DD MMM");
            $('#commentList').append("<div class='dropdown'></div>");

            let str = "<h4 class='dropdown-toggle' data-toggle='dropdown'><span style='color:green' class='glyphicon glyphicon-ok" + (cm.comment[i].isCleared ? "" : " hidden") +
                "'></span><span style='color:red' class='glyphicon glyphicon-pushpin" + (cm.comment[i].priority > 0 ? "" : " hidden") + "'></span> " +
                tname.nickname + " -> " + sname.nickname + " " + sname.firstname + " (" + day +
                ") <span class='glyphicon glyphicon-option-vertical'></span></h4>";
            $('.dropdown:last-child').append(str);
            $('.dropdown:last-child').append("<ul class='dropdown-menu'><li><a onClick='clearComment(\"" + cm.comment[i].commentID + "\")'>CLEAR</a></li><li><a onClick='addPin(\"" + cm.comment[i].commentID + "\")'>PIN</a></li><li><a onClick='rmPin(\"" + cm.comment[i].commentID + "\")'>UNPIN</a></li><li><a onClick='rmComm(\"" + cm.comment[i].commentID + "\")'>REMOVE</a></li></ul>");
            $('#commentList').append("<p>" + cm.comment[i].message + "</p>");
            $.post('post/getConfig').then((config) => {
                let path = config.studentCommentPicturePath;
                path = path.slice(path.search("MonkeyWebData") + 14) + cm.comment[i].commentID;
                $.get(path + ".jpg").done(function (result) {
                    $('#commentList').append("<div class='row'><img class='col-sm-4 col-xs-10' src='" + path + ".jpg" + "' class='img-thumbnail'></div>");
                    if (i < cm.comment.length - 1) getNameAdmin(cm, i + 1)
                }).fail(function () {
                    $.get(path + ".jpeg").done(function (result) {
                        $('#commentList').append("<div class='row'><img class='col-sm-4 col-xs-10' src='" + path + ".jpeg" + "' class='img-thumbnail'></div>");
                        if (i < cm.comment.length - 1) getNameAdmin(cm, i + 1)
                    }).fail(function () {
                        $.get(path + ".png").done(function (result) {
                            $('#commentList').append("<div class='row'><img class='col-sm-4 col-xs-10' src='" + path + ".png" + "' class='img-thumbnail'></div>");
                            if (i < cm.comment.length - 1) getNameAdmin(cm, i + 1)
                        }).fail(function () {
                            if (i < cm.comment.length - 1) getNameAdmin(cm, i + 1)
                        });
                    });
                });

            })
        })
    })
}
// for next and previous button
function commPosition(type) {
    let cookie = getCookieDict();
    let commIndex;
    if (type > 0) {
        commIndex = parseInt(cookie.commIndex) + 20;
        // writeCookie('commIndex', commIndex);
    } else {
        commIndex = parseInt(cookie.commIndex) - 20;
        // writeCookie('commIndex', commIndex);
    }
    let pos = cookie.pos;
    showComment(pos, commIndex);
}
// for clear comment
function clearComment(commID) {
    let cookie = getCookieDict();
    let pos = cookie.pos;
    $.post('post/clearStudentComment', { commentID: commID, isCleared: true }).then((data) => {
        showComment(pos, parseInt(cookie.commIndex));
    })
}
// for pin comment
function addPin(commID) {
    let cookie = getCookieDict();
    let pos = cookie.pos;
    $.post('post/changeStudentCommentPriority', { commentID: commID, priority: 1 }).then((data) => {
        showComment(pos, parseInt(cookie.commIndex));
    })
}
// for unpin comment
function rmPin(commID) {
    let cookie = getCookieDict();
    let pos = cookie.pos;
    $.post('post/changeStudentCommentPriority', { commentID: commID, priority: 0 }).then((data) => {
        showComment(pos, parseInt(cookie.commIndex));
    })
}
// for remove comment
function rmComm(commID) {
    let cookie = getCookieDict();
    let pos = cookie.pos;
    $.post('post/removeStudentComment', { commentID: commID }).then((data) => {
        showComment(pos, parseInt(cookie.commIndex));
    })
}
// for gen pagination
function genPagination(start) {
    $(".pagination").empty();
    let cookie = getCookieDict();
    let pos = cookie.pos;
    if (start <= 3) {
        for (let i = 1; i < 6; i++) {
            $(".pagination").append("<li id='page" + i + "'><a onClick=\"showComment('" + pos + "'," + ((i - 1) * 20) + ")\">" + i + "</a></li>");
        }
    } else {
        for (let i = start - 2; i < start + 3; i++) {
            $(".pagination").append("<li id='page" + i + "'><a onClick=\"showComment('" + pos + "'," + ((i - 1) * 20) + ")\">" + i + "</a></li>");
        }
    }
    $("#page" + start).addClass("active");
}