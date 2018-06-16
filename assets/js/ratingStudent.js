$("#form-container").hide();
$("#button-container").hide();
$("#cr-select").change(function () {
    if (this.value == 0) {
        $("#form-container").hide();
        $("#button-container").hide();
        $("#fetch-container").show();
    } else {
        generateStudent(this.value);
        $("#form-container").show();
        $("#button-container").show();
        $("#fetch-container").hide();
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
    let bgcolor = "#E1F5FE";
    for (let i in student) {
        div.append(
            "<div class='card' style='margin-bottom:8px'>" +
            "<div class='card-body'>" +
            "<div class='row'>" +
            "<div class='col-12 col-md-2'>" + student[i].nickname + " " + student[i].firstname + "</div>" +
            "<div class='col-12 col-md-5' style=\"background-color:" + bgcolor + "\">" +
            "<label style='margin-bottom:0'><span class='fas fa-book-open'></span> Study</label>" +
            "<label style='margin-bottom:0' class='float-right' id=" + student[i].id + "-std-score>2.5</label>" +
            "<input type='range' class='custom-range' min='0' max='5' step='0.5' id=" + student[i].id + "-std-range>" +
            "</div>" +
            "<div class='col-12 col-md-5' style=\"background-color:" + bgcolor + "\">" +
            "<label style='margin-bottom:0'><span class='fas fa-crown'></span> Behavior</label>" +
            "<label style='margin-bottom:0' class='float-right' id=" + student[i].id + "-bv-score>2.5</label>" +
            "<input type='range' class='custom-range' min='0' max='5' step='0.5' id=" + student[i].id + "-bv-range>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>"
        )
    }
}

$(document).on('change', '.custom-range', function () {
    let str = this.id.slice(0, this.id.lastIndexOf('-'));
    $("#" + str + "-score").html(this.value);
});

$("#submit-btn").click(function () {
    let allInput = $(".custom-range");
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
    try {
        Promise.all([$.post('v2/rating/addMany', body1), $.post('v2/rating/addMany', body2)]).then(() => {
            alert("Rating successful.");
            location.reload();
        });
    } catch (error) {
        alert("Rating error, try again later.");
    }
});