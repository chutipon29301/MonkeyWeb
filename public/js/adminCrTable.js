const studentLevel = ["P1", "P2", "P3", "P4", "P5", "P6", "S1", "S2", "S3", "S4", "S5", "S6"];
let tableData = [];
function time(date) {
    switch (date) {
        case 176400000:
            return "sat8";
            break;
        case 183600000:
            return "sat10";
            break;
        case 194400000:
            return "sat13";
            break;
        case 201600000:
            return "sat15";
            break;
        case 262800000:
            return "sun8";
            break;
        case 270000000:
            return "sun10";
            break;
        case 280800000:
            return "sun13";
            break;
        case 288000000:
            return "sun15";
            break;
    }
}
function sendLevel() {
    let allLevel = [];
    $('#level').find(':checked').each(function () {
        allLevel.push($(this).val());
    });
    genData(allLevel);
    $("#tableLevel").empty().append("<td rowspan='2'></td>");
    $("#tableGroup").empty();
    $("#sat8").empty().append("<th width='70px' style='background-color: #cf95ff;text-align: center'>8-10</th>");
    $("#sat10").empty().append("<th style='background-color: #cf95ff;text-align: center'>10-12</th>");
    $("#sat13").empty().append("<th style='background-color: #cf95ff;text-align: center'>13-15</th>");
    $("#sat15").empty().append("<th style='background-color: #cf95ff;text-align: center'>15-17</th>");
    $("#sun8").empty().append("<th style='background-color: #ffd59a;text-align: center'>8-10</th>");
    $("#sun10").empty().append("<th style='background-color: #ffd59a;text-align: center'>10-12</th>");
    $("#sun13").empty().append("<th style='background-color: #ffd59a;text-align: center'>13-15</th>");
    $("#sun15").empty().append("<th style='background-color: #ffd59a;text-align: center'>15-17</th>");
    $("#spaceRow").empty().append("<td colspan='80'></td>");
    genTable(allLevel, 0);
}
function genTable(allLevel, i) {
    if (i >= allLevel.length) return;
    let position = allLevel[i] - 1;
    $.post("post/gradeCourse", {grade: allLevel[i]}).then((allCr) => {
        log(allCr.course);
        $.post("post/listCourseSuggestion", {grade: allLevel[i]}).then((suggCr) => {
            log(suggCr.course.length);
            $("#tableLevel").append("<th style='text-align: center;background-color:" + ((i % 2 === 0) ? "#bfffa5" : "#aeffff")
                + "' colspan=" + suggCr.course.length + ">" + studentLevel[position] + "</th>");
            if (suggCr.course.length === 0) {
                $("#tableGroup").append("<td style='text-align: center'></td>");
            } else genTableGroup(suggCr, 0);
            genTable(allLevel, i + 1);
        });
    });
}
function genTableGroup(suggCr, i) {
    if (i >= suggCr.course.length) return;
    $("#tableGroup").append("<th style='text-align: center'>" + suggCr.course[i].level + "</th>");
    genTableGroup(suggCr, i + 1)
}