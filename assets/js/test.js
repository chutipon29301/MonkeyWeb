console.log('test method waiting for run');
async function sendCourseDataToOtherServer(serverURL, year, quarter) {
    let allCourse = await $.post('post/allCourse', { year: year, quarter: quarter });
    let promise = [];
    for (let i of allCourse.course) {
        promise.push($.ajax({
            url: 'http://' + serverURL + '/v1/class/course',
            type: 'post',
            data: {
                className: i.courseName,
                quarterID: Number(year) + '' + Number(quarter),
                classSubject: i.subject,
                classDate: new Date(i.day).toISOString(),
                tutorID: i.tutor[0]
            },
            headers: {
                authorization:'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI5OTAwOSIsImlhdCI6MTUzMTIxNTg5OSwiZXhwIjoxNTMxODIwNjk5fQ.VhpkkDiG_TTte0N4k2Geji2S3sViPcND_OGpptVCk8M'
            },
            dataType: 'application/x-www-form-urlencodeed'
        }));
    }
    let cb = await Promise.all(promise);
    console.log(cb);
}
$("#crSubmit").click(function () {
    sendCourseDataToOtherServer($("#crUrl").val(), $("#crYear").val(), $("#crQuarter").val());
});