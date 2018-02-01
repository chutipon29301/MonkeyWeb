// Navigation control function
const containClass = (element) => {
    if (element.className.indexOf("userNav") > -1) {
        return "user";
    } else if (element.className.indexOf("stdNav") > -1) {
        return "std";
    } else if (element.className.indexOf("crNav") > -1) {
        return "cr";
    } else if (element.className.indexOf("configNav") > -1) {
        return "config";
    } else if (element.className.indexOf("etcNav") > -1) {
        return "etc";
    }
};
$(".myContent").hide();
$(".navigationIcon").hide();
$(".myNav").click(function () {
    $("#navigation").slideUp();
    $(".navigationIcon").slideDown();
    $("." + containClass(this) + "Content").slideDown();
});
$("#globalBack").click(function () {
    $("#navigation").slideDown();
    $(".navigationIcon").slideUp();
    $(".myContent").slideUp();
});

// Content function
initGlobalData();
async function initGlobalData() {
    for (let i = 1; i < 13; i++) {
        let str = (i < 7) ? "P" + i : "S" + (i - 6);
        $(".gradeSelect").append(
            "<option value=" + i + ">" + str + "</option>"
        );
    }
    $(".subjectSelect").append(
        "<option value='M'>Math</option>" +
        "<option value='P'>Physic</option>" +
        "<option value='C'>Chemistry</option>" +
        "<option value='E'>English</option>" +
        "<option value='Sci'>Science</option>"
    );
    let [config, allQuarter, allTutor] = await Promise.all([getConfig(), listQuarter("private"), $.post("post/v1/listTutorJson")]);
    log(config);
    log(allQuarter);
    log(allTutor);
    for (let i in allQuarter.quarter) {
        $(".quarterSelect").prepend(
            "<option value=" + allQuarter.quarter[i].year + "-" + allQuarter.quarter[i].quarter + ">" + allQuarter.quarter[i].name + "</option>"
        );
    }
    for (let i in allTutor.tutors) {
        $(".tutorSelect").append(
            "<option value=" + allTutor.tutors[i].tutorID + ">" + allTutor.tutors[i].nicknameEn + "</option>"
        );
    }
}
// course pane function
const listAllCourse = () => {
    let year = $("#allCourseQuarterSelect").val().slice(0, 4);
    let quarter = $("#allCourseQuarterSelect").val().slice(5);
    $.post("post/v1/allCourse", { year: year, quarter: quarter }).then(data => {
        $("#allCourseTableBody").empty();
        for (let i in data) {
            $("#allCourseTableBody").append(
                "<tr>" +
                "<td class='text-center'>" + data[i].courseID + "</td>" +
                "<td class='text-center'>" + data[i].courseName + "</td>" +
                "<td class='text-center'>" + moment(data[i].day).format("ddd H") + "</td>" +
                "<td class='text-center'>" + data[i].grade + "</td>" +
                "<td class='text-center'>" + data[i].room + "</td>" +
                "<td class='text-center'>" + data[i].studentCount + "</td>" +
                "<td class='text-center'>" + data[i].tutorName + "</td>" +
                "</tr>"
            );
        }
    })
};
const listGradeCourse = () => {
    let year = $("#gradeCourseQuarterSelect").val().slice(0, 4);
    let quarter = $("#gradeCourseQuarterSelect").val().slice(5);
    $.post("post/gradeCourse", { year: year, quarter: quarter, grade: $("#gradeCourseGradeSelect").val() }).then(cb => {
        $("#gradeCourseTableBody").empty();
        let data = cb.course;
        for (let i in data) {
            $("#gradeCourseTableBody").append(
                "<tr>" +
                "<td class='text-center'>" + data[i].courseID + "</td>" +
                "<td class='text-center'>" + data[i].courseName + "</td>" +
                "<td class='text-center'>" + moment(data[i].day).format("ddd H") + "</td>" +
                "<td class='text-center'>" + data[i].description + "</td>" +
                "<td class='text-center'>" + data[i].tutor + "</td>" +
                "</tr>"
            );
        }
    });
};
$("#crInfoQuarterSelect").change(function () {
    if (this.value !== "0") {
        $.post("post/v1/allCourse", { year: this.value.slice(0, 4), quarter: this.value.slice(5) }).then(data => {
            $("#crInfoCourseSelect").empty();
            for (let i in data) {
                $("#crInfoCourseSelect").append(
                    "<option value=" + data[i].courseID + ">" + data[i].courseName + "-" + data[i].tutorName + "</option>"
                );
            }
        });
    }
});
$("#crInfoCourseSelect").change(function () {
    if (this.value !== 0) {
        $.post("post/courseInfo", { courseID: this.value }).then(cb => {
            $("#crInfoOutput").empty();
            $("#crInfoOutput").append(
                "<p class='mb-1 mt-3'>Course name: " + cb.courseName + "</p>" +
                "<p class='mb-1'>Day: " + moment(cb.day).format("ddd H") + "</p>" +
                "<p class='mb-1'>Description: " + cb.description + "</p>" +
                "<p class='mb-1'>Level: " + cb.level + "</p>" +
                "<p class='mb-1'>Room: " + cb.room + "</p>" +
                "<p class='mb-1'>Student: " + cb.student + "</p>" +
                "<p class='mb-1'>Tutor: " + cb.tutor + "</p>"
            );
        });
    }
});
const addNewCourse = () => {
    if ($(".addCourseCheck:checked").length <= 0) {
        alert("Please select at least 1 grade!");
    } else if ($("#addCourseLevel").val().length <= 0) {
        alert("Please input course level!");
    } else {
        let year = $("#addCourseQuarterSelect").val().slice(0, 4);
        let quarter = $("#addCourseQuarterSelect").val().slice(5);
        let subj = $("#addCourseSubjectSelect").val();
        let grade = $(".addCourseCheck:checked").map(function () {
            return this.value;
        }).get();
        let level = $("#addCourseLevel").val();
        let day = $("#addCourseDaySelect").val();
        let tutor = $("#addCourseTutorSelect").val();
        let room = $("#addCourseRoomSelect").val();
        let description = $("#addCourseDescription").val();
        $.post("post/addCourse", {
            year: year,
            quarter: quarter,
            subject: subj,
            grade: grade,
            level: level,
            day: day,
            tutor: [tutor],
            description: description,
            room: room
        }).then(cb => {
            log("OK => " + cb);
            alert("Complete to add course.");
        });
    }
};