// list all test
listAllTest();
async function listAllTest() {
    $("#testList").empty();
    let allTest = await $.get('/courseTestList');
    $("#testList").append(allTest);
}
// open add new test modal
$("#addNewTestBtn").click(function () {
    $('#addTestModal').modal('show');
});
// add new test
$("#addTestSubmitBtn").click(function () {
    if ($("#addTestName").val().length <= 0) {
        alert("Please input test name.");
    } else if ($("#addTestScore").val().length <= 0) {
        alert("Please input test max score.");
    } else if ($("#addTestDate").val().length <= 0) {
        alert("Please select test date.");
    } else {
        if (confirm("Add new test?")) {
            $.post('v2/testScore/addTest', {
                testName: $("#addTestName").val(),
                maxScore: $("#addTestScore").val(),
                testDate: $("#addTestDate").val()
            }).then((cb) => {
                console.log(cb);
                listAllTest();
                $('#addTestModal').modal('hide');
            });
        }
    }
});
// toggle test list btn
$("#testList").on('click', 'button', function () {
    getTestDetail(this.name.slice(5));
    if ($(this).hasClass('btn-outline-secondary')) {
        $('.test-list-btn').removeClass('btn-secondary').addClass('btn-outline-secondary');
        $(this).toggleClass('btn-secondary btn-outline-secondary');
    } else {
        $(this).toggleClass('btn-secondary btn-outline-secondary');
        $(this).addClass('btn-secondary').removeClass('btn-outline-secondary');
    }
    sessionStorage.setItem('testScoreTestID', this.name.slice(5));
});
// get blank page
function getBlank() {
    $("#testDetail").empty();
    $("#testDetail").append("<div class='col-12 text-center'><h1>Please select a test.</h1></div>");
}
// get test detail
async function getTestDetail(testID) {
    let sortType = $("#sortType").val();
    if (sortType == undefined) sortType = '1';
    let detail = await $.get('/courseTestDetail', {
        testID: testID,
        sortType: sortType
    });
    $("#testDetail").empty();
    $("#testDetail").append(detail);
    $("#sortType").val(sortType);
}
// delete test
function deleteTest(testID) {
    if (confirm('Are you sure to delete this test?')) {
        $.post('v2/testScore/deleteTest', {
            testID: testID
        }).then((cb) => {
            console.log(cb);
            getBlank();
            listAllTest();
        });
    }
}
// edit test
function editTest() {
    let head = $("#testTitle").html();
    $("#editTestName").val(head.slice(0, head.indexOf('(') - 1));
    let score = head.slice(head.indexOf('(') + 1, head.indexOf(')'));
    $("#editTestMax").val(Number(score));
    $("#editTestDetailModal").modal('show');
}
$("#editTestSubmitBtn").click(function () {
    let newName = $("#editTestName").val();
    let newMax = $("#editTestMax").val();
    if (confirm('Are you sure to edit this test?')) {
        let body = {
            testID: $("#thisTestID").html().slice(8),
            maxScore: newMax,
            testName: newName
        };
        console.log(body);
        $.post('v2/testScore/editTest', body).then((cb) => {
            getTestDetail(sessionStorage.getItem('testScoreTestID'));
            $("#editTestDetailModal").modal('hide');
        });
    }
});
// add student score
function addStudentScore() {
    getStudentInclass();
    $("#studentList").empty();
    $("#addStudentModal").modal('show');
}
async function getStudentInclass() {
    let crOption = await $.get('/courseTestOption');
    $("#courseSelect").empty();
    $("#courseSelect").append(crOption);
}
// edit student
function editStudent(studentID) {
    sessionStorage.setItem('testScoreStudentID', studentID);
    $("#addStudentScoreModal").modal('show');
}
// remove student
function removeStudent(testID, studentID) {
    if (confirm('Remove student from this test?')) {
        $.post('v2/testScore/removeStudent', {
            testID: testID,
            students: [studentID]
        }).then((cb) => {
            console.log(cb);
            getTestDetail(testID);
        })
    }
}
// get course student
$("#courseSelect").change(function () {
    if (this.value != '0') {
        generateStudentList();
    }
});
async function generateStudentList() {
    let testID = sessionStorage.getItem('testScoreTestID');
    let courseID = $("#courseSelect").val();
    let stdList = await $.get('/courseTestStudentList', {
        courseID: courseID,
        testID: testID
    });
    $("#studentList").empty();
    $("#studentList").append(stdList);
}
// add score
$("#studentList").on('click', '.student-btn', function () {
    sessionStorage.setItem('testScoreStudentID', this.name);
    $("#addStudentScoreModal").modal('show');
});
// add score
$("#addStudentScoreSubmitBtn").click(function () {
    let testID = sessionStorage.getItem('testScoreTestID');
    let studentID = sessionStorage.getItem('testScoreStudentID');
    let score = $("#studentScore").val();
    if (score != '') {
        $.post('v2/testScore/removeStudent', {
            testID: testID,
            students: [studentID]
        }).then((cb) => {
            console.log(cb);
            $.post('v2/testScore/addStudent', {
                testID: testID,
                students: {
                    _id: studentID,
                    score: score
                }
            }).then(() => {
                generateStudentList();
                getTestDetail(testID);
                $("#addStudentScoreModal").modal('hide');
                $("#studentScore").val('');
            });
        })
    }
});
// show test summary
async function showSummary() {
    let testID = sessionStorage.getItem('testScoreTestID');
    let summary = await $.get('/courseTestSummary', {
        testID: testID
    });
    $("#summaryBody").empty();
    $("#summaryBody").append(summary);
    $("#showSummaryModal").modal('show');
}