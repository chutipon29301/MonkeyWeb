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
    }
});
// get blank page
function getBlank() {
    $("#testDetail").empty();
    $("#testDetail").append("<div class='col-12 text-center'><h1>Please select a test.</h1></div>");
}
// get test detail
async function getTestDetail(testID) {
    let detail = await $.get('/courseTestDetail', {
        testID: testID
    });
    $("#testDetail").empty();
    $("#testDetail").append(detail);
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
// add student score
async function addStudentScore(testID) {
    $("#addStudentModal").modal('show');
    log(testID);

}
// remove student
function removeStudent(testID, studentID) {
    if (confirm('Remove student from this test?')) {
        $.post('v2/testScore/removeStudent', {
            testID: testID,
            students: [studentID]
        }).then((cb) => {
            console.log(cb);
        })
    }
}