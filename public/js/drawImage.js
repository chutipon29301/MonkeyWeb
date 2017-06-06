var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var tableData = [
    [],
    [],
    [],
    [],
    []
];
var dateList = ['', 'TUE', 'THU', 'SAT', 'SUN'];
var timeList = ['', '8-10', '10-12', '13-15', '15-17'];
var bgColorList = ['black', 'deeppink', 'orange', 'purple', 'red'];
var textColorList = ['white', 'black', 'black', 'black', 'black'];
var textTableData;
var courseData = [
    [],
    [],
    [],
    []
];

/**
 * Create temp data in courseData Array
 */
for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
        courseData[i][j] = 'MS123a';
    }
}
log(courseData);


/**
 * Put courseData into tableData array
 */
for (var i = 0; i < 5; i++) {
    for (var j = 0; j < 5; j++) {
        if (i === 0) {
            tableData[i][j] = dateList[j];
        } else if (j === 0) {
            tableData[i][j] = timeList[i];
        } else {
            tableData[i][j] = courseData[i - 1][j - 1];
        }
    }
}

/**
 * Generate html from tableData array
 */
textTableData = '<table>';
for (var i = 0; i < tableData.length; i++) {
    textTableData += '<tr style="height: 72px;color: ' + textColorList[i] + ';font-size:36px;">';
    for (var j = 0; j < tableData[i].length; j++) {
        if (i === 0) {
            textTableData += '<th style="background-color: ' + bgColorList[j] + ';width: 160px;">' + tableData[i][j] + '</th>';
        } else {
            textTableData += '<td>' + tableData[i][j] + '</td>';
        }
    }
    textTableData += '</tr>';
}
textTableData += '</table>';

var data =
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="360">' +
    '<foreignObject width="100%" height="100%">' +
    '<div xmlns="http://www.w3.org/1999/xhtml">' +
    textTableData +
    '</div>' +
    '</foreignObject>' +
    '</svg>';
var DOMURL = window.URL || window.webkitURL || window;
var img = new Image();
var svg = new Blob([data], {
    type: 'image/svg+xml'
});
var url = DOMURL.createObjectURL(svg);

img.onload = function () {
    "use strict";
    ctx.drawImage(img, 0, 0);
    DOMURL.revokeObjectURL(url);
};
img.src = url;