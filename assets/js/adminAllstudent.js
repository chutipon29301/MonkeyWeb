// sort by
let sortBy = 'id';
const changeSortBy = (type) => {
    if (pos != 'tutor') {
        sortBy = type;
        generateTable();
    }
};
// fix position in pc only
const checkType = () => {
    if ($(document).width() > 767) {
        $("#filter-panel").addClass("position-fixed");
    } else {
        $("#filter-panel").removeClass("position-fixed");
    }
}
checkType();
$(window).resize(() => {
    checkType();
});
// check selected quarter
let cookies = getCookieDict();
let pos;
position(cookies.monkeyWebUser).then((cb) => {
    pos = cb.position;
});
if (cookies.monkeyWebSelectedQuarter) $("#quarter-select").val(cookies.monkeyWebSelectedQuarter);
if (sessionStorage.length > 0) {
    $("#status-select").val(sessionStorage.status);
    $("#state-select").val(sessionStorage.state);
    $("#grade-select").val(sessionStorage.grade);
    $("#course-select").val(sessionStorage.course);
    sortBy = sessionStorage.sortBy;
}
generateTable();
$('.filter').change(function () {
    generateTable();
});
$('#quarter-select').change(function () {
    writeCookie("monkeyWebSelectedQuarter", this.value);
    generateTable();
});
// generate table from serverside
async function generateTable() {
    sessionStorage.setItem('status', $("#status-select").val());
    sessionStorage.setItem('state', $("#state-select").val());
    sessionStorage.setItem('grade', $("#grade-select").val());
    sessionStorage.setItem('course', $("#course-select").val());
    sessionStorage.setItem('sortBy', sortBy);
    let body = {
        quarter: $("#quarter-select").val(),
        status: $("#status-select").val(),
        state: $("#state-select").val(),
        grade: $("#grade-select").val(),
        course: $("#course-select").val(),
        sortBy: sortBy
    }
    try {
        let table = await $.get('/adminAllstudentTable', body);
        $("#content-panel").empty();
        $("#content-panel").append(table);
        $("#std-count").html($(".std-row").length);
    } catch (error) {
        let err = '<h1>Error to get data from server.</h1>';
        $("#content-panel").empty();
        $("#content-panel").append(err);
        $("#std-count").html('--');
    }

}
// go to student profile
const goToStudentProfile = (studentID) => {
    if (pos != 'tutor') {
        writeCookie('monkeyWebAdminAllstudentSelectedUser', studentID);
        self.location = '/adminStudentprofile';
    }
};
// scan barcode event
$("#barcode-form").submit(function (e) {
    e.preventDefault();
    goToStudentProfile(($("#barcode-input").val()).slice(0, -1));
});
// typeahead init
getSearchData();
async function getSearchData() {
    let allStd = (await $.post('post/v1/allStudent')).users;
    let searchData = allStd.map((e) => {
        return {
            name: e.nickname + ' ' + e.firstname,
            id: e.studentID
        }
    });
    $("#search-input").typeahead({
        source: searchData,
        autoSelect: true
    });
    $("#search-input").focus();
}
// typeahead event
$("#search-input").change(function () {
    let selected = $("#search-input").typeahead("getActive");
    goToStudentProfile(selected.id);
});
// add new student function
function createNewStudent() {
    $.post("/post/addBlankStudent", {
        number: 1
    }).then(data => {
        $("#newStudentUsername").html("Username: " + data.student[0].studentID);
        $("#newStudentPassword").html("Password: " + data.student[0].password);
        $("#newStudentDialog").modal({
            backdrop: 'static',
            keyboard: false
        });
    });
}
function closeNewStudentDialog() {
    $("#newStudentDialog").modal("hide");
    location.reload();
}
// draw rating star
const drawStar = (rate) => {
    let str = '';
    for (let i = 1; i < 6; i++) {
        if (i <= rate) {
            str += '<span class="fas fa-star"></span>';
        } else if ((i - rate) <= 0.5) {
            str += '<span class="fas fa-star-half"></span>';
        }
    }
    return str;
};
// show rating
async function showRating(studentID) {
    let rating = (await $.post('v2/rating/list', { studentID: studentID })).rating;
    for (let i in rating) {
        switch (rating[i].type) {
            case 'study':
                $("#dialog-std-star").html(drawStar(rating[i].rating));
                $("#dialog-std-score").html(rating[i].rating.toFixed(2));
                break;
            case 'behavior':
                $("#dialog-bv-star").html(drawStar(rating[i].rating));
                $("#dialog-bv-score").html(rating[i].rating.toFixed(2));
                break;
            default:
                break;
        }
    }
    $("#ratingHeader").html(studentID);
    $('#dialog-more-rating').collapse('hide');
    $("#dialog-go-btn").hide();
    $("#dialog-sm-btn").html('More')
    $("#ratingDialog").modal('show');
}
// show more/less rating
$("#dialog-go-btn").hide();
$("#dialog-sm-btn").click(function () {
    if (this.innerHTML == 'More') {
        showMoreRating();
        $("#dialog-go-btn").show();
        $("#dialog-sm-btn").html('Less')
    } else {
        $('#dialog-more-rating').collapse('hide');
        $("#dialog-go-btn").hide();
        $("#dialog-sm-btn").html('More')
    }
});
async function showMoreRating() {
    let id = Number($("#ratingHeader").html());
    let allRate = (await $.post('v2/rating/listDetail', { studentID: id })).rating;
    $("#dialog-more-bv-rating").empty();
    $("#dialog-more-std-rating").empty();
    allRate = _.groupBy(allRate, 'type');
    allRate.behavior = _.groupBy(allRate.behavior, 'tutorName');
    allRate.study = _.groupBy(allRate.study, 'tutorName');
    for (let i in allRate.behavior) {
        let n = allRate.behavior[i].length;
        let sum = _.sumBy(allRate.behavior[i], function (e) { return e.score; });
        let avg = (sum / n).toFixed(2);
        $("#dialog-more-bv-rating").append('<div class="row"><div class="col-12"><label>' + i +
            ' (' + avg + ')</label><label style="color:#FBC02D">' + drawStar(avg) + '</label></div></div>');
    }
    for (let i in allRate.study) {
        let n = allRate.study[i].length;
        let sum = _.sumBy(allRate.study[i], function (e) { return e.score; });
        let avg = (sum / n).toFixed(2);
        $("#dialog-more-std-rating").append('<div class="row"><div class="col-12"><label>' + i +
            ' (' + avg + ')</label><label style="color:#FBC02D">' + drawStar(avg) + '</label></div></div>');
    }
    $('#dialog-more-rating').collapse('show');
}
// clear all remark
function clearRemark() {
    if (pos != 'tutor') {
        if (confirm("ต้องการเคลียร์ทั้งหมด?")) {
            $.post("post/v1/resetRemark").then(() => {
                location.reload();
            });
        }
    }
}
// change Remark
function changeRemark(studentID, remark) {
    if (pos != 'tutor') {
        $.post("post/v1/setRemark", { studentID: studentID, remark: remark }).then(() => {
            let className;
            let color;
            let type;
            switch (remark) {
                case '1':
                    className = 'fa-check-circle';
                    color = 'blue';
                    type = 2;
                    break;
                case '2':
                    className = 'fa-check-circle';
                    color = 'green';
                    type = 0;
                    break;
                case '3':
                    className = 'fa-times-circle';
                    color = 'orange';
                    type = 1;
                    break;
                default:
                    className = 'fa-times-circle';
                    color = 'red';
                    type = 3;
                    break;
            }
            $("#remark" + studentID).html(
                '<span class="far fa-2x ' + className + '" style="color:' + color +
                '" onclick="changeRemark(\'' + studentID + '\',\'' + type + '\')"></span>'
            );
        });
    }
}