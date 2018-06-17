$(".cr-blog").hide();
getTypeaheadData();

$("#cr-select").change(function () {
    if (this.value == 0) {
        $(".cr-blog").fadeOut(400, () => {
            $(".solo-blog").show();
        });
    } else {
        generateStudent(this.value);
        $(".solo-blog").fadeOut(400, () => {
            $(".cr-blog").show();
        });
    }
});

async function generateStudent(crID) {
    let crInfo;
    try {
        crInfo = await $.post('post/courseInfo', { courseID: crID });
    } catch (error) {
        alert("Error to get course info, try again later.");
        return;
    }
    let promise = [];
    for (let i in crInfo.student) {
        promise.push($.post('post/name', { userID: crInfo.student[i] }));
    }
    let student;
    try {
        student = await Promise.all(promise);
    } catch (error) {
        alert("Error to get user name, try again later.");
        return;
    }
    for (let i in crInfo.student) {
        crInfo.student[i] = {
            id: crInfo.student[i],
            nickname: student[i].nickname,
            firstname: student[i].firstname,
            nicknameEn: student[i].nicknameEn,
            firstnameEn: student[i].firstnameEn,
        }
    }
    addRatingInput(crInfo);
}

addRatingInput = (crInfo) => {
    let div = $("#student-container");
    div.empty();
    let student = crInfo.student;
    let bgcolor1 = "#E1F5FE";
    let bgcolor2 = "#FFF59D";
    for (let i in student) {
        div.append(
            "<div class='card' style='margin-bottom:8px'>" +
            "<div class='card-body'>" +
            "<div class='row'>" +
            "<div class='col-6'>" + student[i].nickname + " " + student[i].firstname + "</div>" +
            "<div class='col-6'><div class='form-check form-check-inline float-right'>" +
            "<input class='form-check-input' type='checkbox' value='" + student[i].id + "-check-form'>" +
            "<label class='form-check-label'>Absent</label>" +
            "</div></div>" +
            "</div>" +
            "<div class='row' style='margin-bottom:-15px; margin-top:15px;'>" +
            "<div class='col-12 col-md-6' style=\"background-color:" + bgcolor1 + ";padding:8px 15px 8px 15px;\">" +
            "<label style='margin-bottom:0'><span class='fas fa-book-open'></span> Study</label>" +
            "<label style='margin-bottom:0' class='float-right' id=" + student[i].id + "-std-score>5</label>" +
            "<input type='range' class='custom-range cr-range' min='0' max='5' step='0.5' id=" + student[i].id + "-std-range>" +
            "</div>" +
            "<div class='col-12 col-md-6' style=\"background-color:" + bgcolor2 + ";padding:8px 15px 8px 15px;\">" +
            "<label style='margin-bottom:0'><span class='fas fa-crown'></span> Behavior</label>" +
            "<label style='margin-bottom:0' class='float-right' id=" + student[i].id + "-bv-score>5</label>" +
            "<input type='range' class='custom-range cr-range' min='0' max='5' step='0.5' id=" + student[i].id + "-bv-range>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>"
        )
    }
    $(".cr-range").val(5);
}

$(document).on('input', '.cr-range', function () {
    let str = this.id.slice(0, this.id.lastIndexOf('-'));
    $("#" + str + "-score").html(this.value);
});

$("#submit-btn").click(function () {
    let allInput = $(".cr-range");
    let allDiss = $(".form-check-input:checked");
    let notUse = [];
    for (let i = 0; i < allDiss.length; i++) {
        let str = allDiss[i].value;
        notUse.push(str.slice(0, str.indexOf('-')));
    }
    let body1 = {
        type: 'study',
        scores: [],
        courseID: $("#cr-select").val()
    }
    let body2 = {
        type: 'behavior',
        scores: [],
        courseID: $("#cr-select").val()
    }
    for (let i = 0; i < allInput.length; i++) {
        let str = allInput[i].id;
        let type = str.slice(str.indexOf('-') + 1, str.lastIndexOf('-'));
        let id = str.slice(0, str.indexOf('-'));
        if (notUse.indexOf(id) < 0) {
            switch (type) {
                case 'bv':
                    body2.scores.push({
                        studentID: id,
                        score: allInput[i].value
                    });
                    break;
                case 'std':
                    body1.scores.push({
                        studentID: id,
                        score: allInput[i].value
                    });
                    break;
                default:
                    break;
            }
        }
    }
    try {
        Promise.all([$.post('v2/rating/addMany', body1), $.post('v2/rating/addMany', body2)]).then(() => {
            alert("Rating successful.");
            location.reload();
        });
    } catch (error) {
        alert("Rating error, try again later.");
    }
});
$("#solo-std-range").val(5);
$("#solo-bv-range").val(5);
$("#solo-std-range").on('input', function () {
    $("#solo-std-score").html(this.value);
});
$("#solo-bv-range").on('input', function () {
    $("#solo-bv-score").html(this.value);
});

async function getTypeaheadData() {
    let allStd = await allStudent();
    allStd = allStd.student;
    let stdForSearch = allStd.map((e) => {
        let obj = {
            name: e.nickname + ' ' + e.firstname + ' (' + e.studentID + ')',
            id: e.studentID
        }
        return obj;
    });
    $(".search-std").typeahead({
        source: stdForSearch,
        autoSelect: true
    });
}

$("#submit-solo-btn").click(function () {
    let stdData = $(".search-std").typeahead("getActive");
    if (stdData) {
        let body1 = {
            studentID: stdData.id,
            type: 'study',
            score: $("#solo-std-range").val()
        }
        let body2 = {
            studentID: stdData.id,
            type: 'behavior',
            score: $("#solo-bv-range").val()
        }
        try {
            Promise.all([
                $.post('v2/rating/add', body1),
                $.post('v2/rating/add', body2)
            ]).then((cb) => {
                alert("Rating successful.");
                location.reload();
            });
        } catch (error) {
            alert("Rating error, try again later.");
        }
    }
});