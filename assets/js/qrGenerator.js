// init
let lastTxt = "";
$("#hotLabel").hide();
$("#hwLabel").hide();
$("#skLabel").hide();
$("#testLabel").hide();

const genPreview = () => {
    let str = "";
    str += $("#subjSelect").val() + "-";
    str += $("#seriesSelect").val() + $("#difficultSelect").val();
    str += ($("#sheetNumSelect").val().length > 1) ? $("#sheetNumSelect").val() : "0" + $("#sheetNumSelect").val();
    str += $("#subSeriesSelect").val();
    str += "(rev" + $("#revInput").val() + ")";
    lastTxt = str;
    $("#previewInput").val(str);
};

// gen data preview
genPreview();
$("#subjSelect").change(function () {
    genPreview();
});
$("#seriesSelect").change(function () {
    genPreview();
});
$("#difficultSelect").change(function () {
    genPreview();
});
$("#sheetNumSelect").change(function () {
    genPreview();
});
$("#subSeriesSelect").change(function () {
    genPreview();
});
$("#revInput").change(function () {
    genPreview();
});

// Request QR from server
$("#generateButt").click(function () {
    requestQR();
});
async function requestQR() {
    let body = {};
    body.subject = $("#subjSelect").val().slice(0, 1);
    body.ageGroup = $("#subjSelect").val().slice(1);
    body.level = $("#seriesSelect").val();
    body.difficulty = $("#difficultSelect").val();
    body.number = ($("#sheetNumSelect").val().length > 1) ? $("#sheetNumSelect").val() : "0" + $("#sheetNumSelect").val();
    body.rev = $("#revInput").val().slice(0, 1);
    body.subRev = $("#revInput").val().slice(2);
    let optional = $("#subSeriesSelect").val();
    if (optional !== "") {
        if (optional.length > 1) {
            body.alternative = optional.slice(0, 1);
            body.supplement = optional.slice(1);
        } else {
            body.alternative = optional;
        }
    }
    let qr = await $.post("post/v1/requestQR", body);
    generateQR(qr)
}

// gen QR
function generateQR(qr) {
    $("#hotLabel").show();
    $("#hwLabel").show();
    $("#skLabel").show();
    $("#testLabel").show();
    $('#hotQR').empty();
    $('#hwQR').empty();
    $('#skQR').empty();
    $('#testQR').empty();
    $('#hotQR').qrcode({ width: 256, height: 256, text: qr.hot });
    $('#hwQR').qrcode({ width: 256, height: 256, text: qr.hw });
    $('#skQR').qrcode({ width: 256, height: 256, text: qr.skill });
    $('#testQR').qrcode({ width: 256, height: 256, text: qr.test });
}

// download QR
function downloadQR(id, text) {
    let canvas;
    canvas = document.getElementById(id).getElementsByTagName('canvas')[0];
    log(canvas);
    let dlImg = canvas.toDataURL();
    let aref = document.createElement('a');
    aref.href = dlImg;
    aref.download = text;
    document.body.appendChild(aref);
    aref.click();
    // document.body.remove(aref);
}
$('#hotQR').click(function () {
    downloadQR(this.id, lastTxt + "hotkey");
});
$('#hwQR').click(function () {
    downloadQR(this.id, lastTxt + "homework");
});
$('#skQR').click(function () {
    downloadQR(this.id, lastTxt + "skill");
});
$('#testQR').click(function () {
    downloadQR(this.id, lastTxt + "test");
});