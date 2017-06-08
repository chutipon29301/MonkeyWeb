$(document).ready(function () {
    var cookie = getCookieDict();
    if (cookie.name !== undefined && cookie.nameE !== undefined) {
        cookie.name = JSON.parse(cookie.name);
        cookie.nameE = JSON.parse(cookie.nameE);
        cookie.tel = JSON.parse(cookie.tel);
        $('#nname').val(decodeURIComponent(cookie.name.nname));
        $('#name').val(decodeURIComponent(cookie.name.name));
        $('#sname').val(decodeURIComponent(cookie.name.sname));
        $('#nnameE').val(cookie.nameE.nname);
        $('#nameE').val(cookie.nameE.name);
        $('#snameE').val(cookie.nameE.sname);
        $('#grade').val(cookie.grade);
        $('#email').val(cookie.email);
        $('#parentNum').val(cookie.tel.parent);
        $('#studentNum').val(cookie.tel.student)
    }
});
var ascii=/^[\x00-\xFF]*$/;
var english = /^[a-zA-Z0-9]+$/;
var isAscii=function (str) {
    return ascii.test(str)
};
var isNotEnglish = function (str) {
    return !english.test(str)
};
var isNotAllNumber = function (str) {
    for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) < 48 || str.charCodeAt(i) > 57) {
            log(str.charCodeAt(i));
            return true;
        }
    }
    return false;
};
function next() {
    var nname = $('#nname').val();
    var name = $('#name').val();
    var sname = $('#sname').val();
    var nnameE = $('#nnameE').val();
    var nameE = $('#nameE').val();
    var snameE = $('#snameE').val();
    var email = $('#email').val();
    var parentNum = $('#parentNum').val();
    var studentNum = $('#studentNum').val();
    if(isAscii(nname)||isAscii(name)||isAscii(sname)){
        alert('กรุณากรอกชื่อภาษาไทยให้ถูกต้อง เช่น ณัฐพงษ์')
    } else if (isNotEnglish(nnameE) || isNotEnglish(nameE) || isNotEnglish(snameE)) {
        alert('กรุณากรอกชื่อภาษาอังกฤษให้ถูกต้อง เช่น Nuttapong');
    } else if (email.indexOf('@') < 0) {
        alert("กรุณากรอก E-Mail ให้ถูกต้อง");
    } else {
        var grade = $('#grade').val();
        if (parentNum.length !== 10 || studentNum.length !== 10 || isNotAllNumber(parentNum) || isNotAllNumber(studentNum)) {
                alert("เบอร์โทรศัพท์ต้องมี 10 ตัวและประกอบด้วยตัวเลข 0-9 เท่านั้น")
            } else if (name !== '' && nname !== '' && sname !== '' && grade !== '0' && nameE !== '' && nnameE !== '' && snameE !== '' && email !== '' && parentNum !== '' && studentNum !== '') {
                writeCookie('name', JSON.stringify({
                    nname: encodeURIComponent(nname),
                    name: encodeURIComponent(name),
                    sname: encodeURIComponent(sname)
                }));
                writeCookie('nameE', JSON.stringify({
                    nname: nnameE,
                    name: nameE,
                    sname: snameE
                }));
                writeCookie('email', email);
                writeCookie('grade', grade);
                writeCookie('tel', JSON.stringify({parent: parentNum, student: studentNum}));
                self.location = "registrationCourse"
            } else {
                alert("กรุณาเลือกชั้นเรียน")
            }
    }
}