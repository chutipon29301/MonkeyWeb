


/**
 * Create temp data in courseData Array
 */
for (i = 0; i < 4; i++) {
    for (j = 0; j < 4; j++) {
        courseData[i][j] = 'MS123b';
    }
}
log(courseData);


function generateImage(courseData) {

    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    let tableData = [[], [], [], [], []];
    let dateList = ['', 'TUE', 'THU', 'SAT', 'SUN'];
    let timeList = ['', '8-10', '10-12', '13-15', '15-17'];
    let bgColorList = ['black', 'deeppink', 'orange', 'purple', 'red'];
    let textColorList = ['white', 'black', 'black', 'black', 'black'];
    let textTableData;
    let courseData = [[], [], [], []];

    let i;
    let j;

    /**
     * Put courseData into tableData array
     */
    for (i = 0; i < 5; i++) {
        for (j = 0; j < 5; j++) {
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
    textTableData = '<table style="border: solid black;border-collapse: collapse">';
    for (i = 0; i < tableData.length; i++) {
        textTableData += '<tr style="height: 72px;border: solid black;color: ' + textColorList[i] + ';font-size:36px;">';
        for (j = 0; j < tableData[i].length; j++) {
            if (i === 0) {
                textTableData += '<th style="background-color: ' + bgColorList[j] + ';border: solid black;width: 160px;">'
                    + tableData[i][j] + '</th>';
            } else {
                textTableData += '<td style="border: solid black;">' + tableData[i][j] + '</td>'
            }
        }
        textTableData += '</tr>';
    }
    textTableData += '</table>';

    let data =
        '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="360">' +
        '<foreignObject width="100%" height="100%">' +
        '<div xmlns="http://www.w3.org/1999/xhtml">' +
        textTableData +
        '</div>' +
        '</foreignObject>' +
        '</svg>';
//noinspection SpellCheckingInspection,JSUnresolvedVariable
    let DOMURL = window.URL || window.webkitURL || window;
    let img = new Image();
    let svg = new Blob([data], {
        type: 'image/svg+xml'
    });
//noinspection JSUnresolvedFunction
    let url = DOMURL.createObjectURL(svg);

//noinspection SpellCheckingInspection
    img.onload = function () {
        ctx.drawImage(img, 0, 0);
        //noinspection JSUnresolvedFunction
        DOMURL.revokeObjectURL(url);
    };
    img.src = url;
}