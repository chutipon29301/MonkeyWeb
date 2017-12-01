let pageIndex = 1;
let cookie = getCookieDict();
let ID = "";
if (cookie.monkeyWebUser == undefined) {
    self.location = "/login";
} else {
    ID = cookie.monkeyWebUser;
}
$("#fhbRegis-table").hide();
$("#skRegis").hide();
$("#submit-table").hide();
genStudentInfo();

// add event when click next & back
$("#backButt").hide();
$("#backButt").click(function () {
    changePage(-1);
});
$("#nextButt").click(function () {
    changePage(1);
});

// change page function
function changePage(value) {
    if (pageIndex == 1) {
        let level = $("#levelCard").html().slice(6);
        let realGrade = level.slice(0, -1);
        if (parseInt(realGrade) == 12) {
            if ($("#crRegis-table .btn-success").length < 3) {
                alert("ต้องลงอย่างน้อย 2 คอร์ส")
            } else {
                pageIndex = pageIndex + value;
            }
        } else {
            if ($("#crRegis-table .btn-success").length < 2) {
                alert("ต้องลงอย่างน้อย 2 คอร์ส")
            } else {
                pageIndex = pageIndex + value;
            }
        }
    } else if (pageIndex == 3) {
        let skMC = 0;
        let skEC = 0;
        for (let i = 0; i < $("#skRegis .btn-success").length; i++) {
            let str = $("#skRegis .btn-success")[i].innerHTML;
            if (str.indexOf("SKILL:M") >= 0) {
                skMC += 1;
            } else {
                skEC += 1;
            }
        }
        if (skMC > 1 || skEC > 1) {
            alert("ห้ามลง skill วิชาเดียวกันหลายเวลา")
        } else pageIndex = pageIndex + value;
    } else {
        pageIndex = pageIndex + value;
    }
    let $backButt = $("#backButt");
    let $progressBar = $("#progressBar");
    switch (pageIndex) {
        case 1:
            $("#fhbRegis-table").hide();
            $("#crRegis-table").show();
            $("#crFeeBox").show();
            $backButt.hide();
            $progressBar.css("width", "30%").html("ลงทะเบียนCourse");
            break;
        case 2:
            genFhbTable();
            $("#crRegis-table").hide();
            $("#crFeeBox").hide();
            $("#skRegis").hide();
            $("#fhbRegis-table").show();
            $backButt.show();
            $progressBar.css("width", "50%").html("ลงทะเบียนHybrid");
            break;
        case 3:
            genSkSelect();
            $("#submit-table").hide();
            $("#fhbRegis-table").hide();
            $("#skRegis").show();
            $backButt.show();
            $progressBar.css("width", "75%").html("ลงทะเบียนSkill");
            $("#backButt").html("Back");
            $("#nextButt").html("Next");
            break;
        case 4:
            genSubmitData();
            $("#skRegis").hide();
            $("#crFeeBox").show();
            $("#submit-table").show();
            $backButt.show();
            $progressBar.css("width", "100%").html("ตรวจสอบความถูกต้อง");
            $("#backButt").html("แก้ไข");
            $("#nextButt").html("ยืนยัน");
            break;
        case 5:
            if (confirm("ยืนยันการลงทะเบียน")) {
                submitData();
            } else {
                changePage(-1);
            }
            break;
        default:
            break;
    }
}

// gen student info function
async function genStudentInfo() {
    let studentInfo = await studentProfile(ID);
    $("#nameCard").html(studentInfo.nickname + " " + studentInfo.firstname);
    $("#gradeCard").html("ชั้น: " + (studentInfo.grade > 6 ? "มัธยม " + (studentInfo.grade - 6) : "ประถม " + studentInfo.grade));
    $("#levelCard").html("Level: " + studentInfo.level);
    genCrTable();
}

// gen table for cr regis func
async function genCrTable() {
    let level = $("#levelCard").html().slice(6);
    let realGrade = level.slice(0, -1);
    let realLevel = level.slice(-1);
    let crIndex = [1, 1, 1, 1, 1, 1, 1, 1];
    $(".cr-select").html("-").addClass("disabled");
    if (descriptionTitle[parseInt(realGrade) - 1] != "") {
        $("#descriptionTitle").html("Description: " + descriptionTitle[parseInt(realGrade) - 1]);
    }
    let [gradeCourse, courseSuggest] = await Promise.all([$.post("post/gradeCourse", { year: year, quarter: quarter, grade: realGrade }), $.post("post/listCourseSuggestion", { year: year, quarter: quarter, grade: realGrade })]);
    for (let i in gradeCourse.course) {
        let time = moment(gradeCourse.course[i].day);
        let index = 0;
        if (time.day() == 0) index += 4;
        index += parseInt((time.hour() - 8) / 2);
        $(".btn" + time.day() + "-" + time.hour() + "-" + crIndex[index]).html(gradeCourse.course[i].courseName + (gradeCourse.course[i].tutor[0] == "99000" ? "(HB)" : ""));
        $(".btn" + time.day() + "-" + time.hour() + "-" + crIndex[index]).removeClass("disabled").attr("id", gradeCourse.course[i].courseID);
        crIndex[index] = crIndex[index] + 1;
        if (gradeCourse.course[i].description != "" && gradeCourse.course[i].description != "-") {
            $("#crDescription").append(
                "<p>" + gradeCourse.course[i].courseName + " คือ " + gradeCourse.course[i].description + "</p>"
            );
        }
    }
    for (let i in courseSuggest.course) {
        if (courseSuggest.course[i].level == realLevel) {
            for (let j in courseSuggest.course[i].courseID) {
                $("#" + courseSuggest.course[i].courseID[j]).css("box-shadow", "0px 0px 5px #64dd17")
            }
        }
    }
}

// add event when click cr-select
$(".cr-select").click(function () {
    let level = $("#levelCard").html().slice(6);
    let realGrade = level.slice(0, -1);
    let realLevel = level.slice(-1);
    if (!$(this).hasClass("disabled")) {
        if (realGrade == 12) {
            if (this.id == "5a1d0ba242ec5e1710ea9e90" || this.id == "5a1d0c5642ec5e1710ea9e96") {
                $("#5a1d0ba242ec5e1710ea9e90").toggleClass("btn-light btn-success");
                $("#5a1d0c5642ec5e1710ea9e96").toggleClass("btn-light btn-success");
            } else if (this.id == "5a1d0ae442ec5e1710ea9e87" || this.id == "5a1d0c4c42ec5e1710ea9e95") {
                $("#5a1d0ae442ec5e1710ea9e87").toggleClass("btn-light btn-success");
                $("#5a1d0c4c42ec5e1710ea9e95").toggleClass("btn-light btn-success");
            } else if (this.id == "5a1d0b0342ec5e1710ea9e88" || this.id == "5a1d0ce042ec5e1710ea9e9d") {
                $("#5a1d0b0342ec5e1710ea9e88").toggleClass("btn-light btn-success");
                $("#5a1d0ce042ec5e1710ea9e9d").toggleClass("btn-light btn-success");
            } else if (this.id == "5a1d0b8f42ec5e1710ea9e8f" || this.id == "5a1d0cda42ec5e1710ea9e9c") {
                $("#5a1d0b8f42ec5e1710ea9e8f").toggleClass("btn-light btn-success");
                $("#5a1d0cda42ec5e1710ea9e9c").toggleClass("btn-light btn-success");
            } else if (this.id == "5a1d0b2e42ec5e1710ea9e8a") {
                $("#5a1d0c0242ec5e1710ea9e92").toggleClass("btn-light btn-success");
                $("#5a1d0b2e42ec5e1710ea9e8a").toggleClass("btn-light btn-success");
            } else if (this.id == "5a1d0b3742ec5e1710ea9e8b") {
                $("#5a1d0c0242ec5e1710ea9e92").toggleClass("btn-light btn-success");
                $("#5a1d0b3742ec5e1710ea9e8b").toggleClass("btn-light btn-success");
            } else if (this.id == "5a1d0c0242ec5e1710ea9e92") {
                if (realLevel == "c") {
                    $("#5a1d0c0242ec5e1710ea9e92").toggleClass("btn-light btn-success");
                    $("#5a1d0b3742ec5e1710ea9e8b").toggleClass("btn-light btn-success");
                } else {
                    $("#5a1d0c0242ec5e1710ea9e92").toggleClass("btn-light btn-success");
                    $("#5a1d0b2e42ec5e1710ea9e8a").toggleClass("btn-light btn-success");
                }
            } else {
                $(this).toggleClass("btn-light btn-success");
            }
        } else {
            $(this).toggleClass("btn-light btn-success");
        }
        // check same time pick
        if ($(this).hasClass("btn-success") && $($(this).siblings()[0]).hasClass("btn-success")) {
            if (realGrade == 12) {
                if ($(this).siblings()[0].id == "5a1d0ba242ec5e1710ea9e90" || $(this).siblings()[0].id == "5a1d0c5642ec5e1710ea9e96") {
                    $("#5a1d0ba242ec5e1710ea9e90").removeClass("btn-success").addClass("btn-light");
                    $("#5a1d0c5642ec5e1710ea9e96").removeClass("btn-success").addClass("btn-light");
                } else if ($(this).siblings()[0].id == "5a1d0ae442ec5e1710ea9e87" || $(this).siblings()[0].id == "5a1d0c4c42ec5e1710ea9e95") {
                    $("#5a1d0ae442ec5e1710ea9e87").removeClass("btn-success").addClass("btn-light");
                    $("#5a1d0c4c42ec5e1710ea9e95").removeClass("btn-success").addClass("btn-light");
                } else if ($(this).siblings()[0].id == "5a1d0b0342ec5e1710ea9e88" || $(this).siblings()[0].id == "5a1d0ce042ec5e1710ea9e9d") {
                    $("#5a1d0b0342ec5e1710ea9e88").removeClass("btn-success").addClass("btn-light");
                    $("#5a1d0ce042ec5e1710ea9e9d").removeClass("btn-success").addClass("btn-light");
                } else if ($(this).siblings()[0].id == "5a1d0b8f42ec5e1710ea9e8f" || $(this).siblings()[0].id == "5a1d0cda42ec5e1710ea9e9c") {
                    $("#5a1d0b8f42ec5e1710ea9e8f").removeClass("btn-success").addClass("btn-light");
                    $("#5a1d0cda42ec5e1710ea9e9c").removeClass("btn-success").addClass("btn-light");
                } else if ($(this).siblings()[0].id == "5a1d0b2e42ec5e1710ea9e8a") {
                    $("#5a1d0c0242ec5e1710ea9e92").removeClass("btn-success").addClass("btn-light");
                    $("#5a1d0b2e42ec5e1710ea9e8a").removeClass("btn-success").addClass("btn-light");
                } else if ($(this).siblings()[0].id == "5a1d0b3742ec5e1710ea9e8b") {
                    $("#5a1d0c0242ec5e1710ea9e92").removeClass("btn-success").addClass("btn-light");
                    $("#5a1d0b3742ec5e1710ea9e8b").removeClass("btn-success").addClass("btn-light");
                } else if ($(this).siblings()[0].id == "5a1d0c0242ec5e1710ea9e92") {
                    if (realLevel == "c") {
                        $("#5a1d0c0242ec5e1710ea9e92").removeClass("btn-success").addClass("btn-light");
                        $("#5a1d0b3742ec5e1710ea9e8b").removeClass("btn-success").addClass("btn-light");
                    } else {
                        $("#5a1d0c0242ec5e1710ea9e92").removeClass("btn-success").addClass("btn-light");
                        $("#5a1d0b2e42ec5e1710ea9e8a").removeClass("btn-success").addClass("btn-light");
                    }
                } else {
                    $(this).siblings().removeClass("btn-success").addClass("btn-light");
                }
            } else {
                $(this).siblings().removeClass("btn-success").addClass("btn-light");
            }
        }
        if (realGrade == 12) {
            $("#crFee").html("รวมเป็นเงิน " + $(".btn-success").length * extraFee + " บาท");
        } else {
            $("#crFee").html("รวมเป็นเงิน " + $(".btn-success").length * fee + " บาท");
        }
    }
});

// gen table for fhb regis func
async function genFhbTable() {
    $(".hb-select").addClass("btn-light").removeClass("btn-success").show();
    $(".sk-select").addClass("btn-light").removeClass("btn-success").show();
    $("#submit-table .sk").hide();
    $("#submit-table .hb").hide();
    $("#submit-table .cr").hide();
    let promise = [];
    for (let i = 0; i < $("#crRegis-table .btn-success").length; i++) {
        promise.push(courseInfo($("#crRegis-table .btn-success")[i].id));
    }
    let [allFhb, crInfo] = await Promise.all([$.post("post/v1/listHybridDayInQuarter", { year: year, quarter: quarter }), Promise.all(promise)]);
    for (let i in allFhb) {
        let time = moment(allFhb[i].day);
        $(".cr" + time.day() + "-" + time.hour()).hide();
        $(".fhb" + time.day() + "-" + time.hour() + "-1").attr("id", allFhb[i].hybridID + "(M)");
        $(".fhb" + time.day() + "-" + time.hour() + "-2").attr("id", allFhb[i].hybridID + "(P)");
    }
    for (let i in crInfo) {
        let time = moment(crInfo[i].day);
        $(".cr" + time.day() + "-" + time.hour()).html(crInfo[i].courseName + (crInfo[i].tutor[0] == "99000" ? "(HB)" : "")).show();
        $(".fhb" + time.day() + "-" + time.hour() + "-1").hide();
        $(".fhb" + time.day() + "-" + time.hour() + "-2").hide();
        $(".fhb" + time.day() + "-" + time.hour()).hide();
        // sk table
        $(".skl" + time.day() + "-" + time.hour() + "-1").hide();
        $(".skl" + time.day() + "-" + time.hour() + "-2").hide();
    }
}

// add event when click fhb-select
$(".hb-select").click(function () {
    $(this).toggleClass("btn-success btn-light");
    if ($(this).hasClass("btn-success")) {
        $(this).siblings().addClass("btn-light").removeClass("btn-success");
    }
});

// gen skill select menu func
async function genSkSelect() {
    $("#skRegis .hb").hide();
    $("#submit-table .hb").hide();
    $("#submit-table .sk").hide();
    for (let i = 0; i < $("#fhbRegis-table .btn-success").length; i++) {
        let str = $("#fhbRegis-table .btn-success")[i].className;
        str = str.slice(str.indexOf("fhb"));
        str = str.slice(0, str.indexOf(" "));
        str = str.slice(0, str.lastIndexOf("-"));
        $("." + str).html($("#fhbRegis-table .btn-success")[i].innerHTML).show();
        str = str.slice(3);
        $(".skl" + str + "-1").hide();
        $(".skl" + str + "-2").hide();
        $(".sk" + str).hide();
    }
}

// add event when click sk-select
$(".sk-select").click(async function () {
    if ($(this).hasClass("btn-light")) {
        $("#skillTime").empty();
        var str = this.className
        str = str.slice(str.indexOf("skl"));
        str = str.slice(0, str.indexOf(" "));
        let skDay = str.slice(3, 4);
        let skHour = str.slice(5, str.lastIndexOf("-"));
        let allSk = await $.post("post/v1/listSkillDayInQuarter", { year: year, quarter: quarter });
        for (let i in allSk) {
            let time = moment(allSk[i].day);
            let bool = (time.hour() == skHour || time.hour() == parseInt(skHour) + 1) && time.day() == skDay;
            if (bool) {
                $("#skillTime").append("<button class='btn btn-primary col' id=" + allSk[i].skillID + " onclick='toggleThat(\"" + str + "\",this)'>" + time.format("HH:mm") + "</button>");
            }
        }
        $("#skillModal").modal('show');
    } else {
        $(this).toggleClass("btn-light btn-success");
    }

});
function toggleThat(butt, mod) {
    if (butt.slice(-1) == "1") {
        $("." + butt).html("SKILL:M " + mod.innerHTML).toggleClass("btn-light btn-success");
    } else {
        $("." + butt).html("SKILL:E " + mod.innerHTML).toggleClass("btn-light btn-success");
    }
    $("." + butt).attr("id", mod.id);
    if ($("." + butt).hasClass("btn-success")) {
        $("." + butt).siblings().removeClass("btn-success").addClass("btn-light");
    }
    $("#skillModal").modal('hide');
}

// gen data for submit function
function genSubmitData() {
    $("#submit-table .sk").hide();
    for (let i = 0; i < $("#skRegis .btn-success").length; i++) {
        let str = $("#skRegis .btn-success")[i].className;
        str = str.slice(str.indexOf("skl"));
        str = str.slice(0, str.indexOf(" "));
        str = str.slice(0, str.lastIndexOf("-"));
        $(".sk" + str.slice(3)).html($("#skRegis .btn-success")[i].innerHTML).show();
    }
}

// submit data func
async function submitData() {
    $("#loadingModal").modal("show");
    let crPromise = [];
    for (let i = 0; i < $("#crRegis-table .btn-success").length; i++) {
        crPromise.push($("#crRegis-table .btn-success")[i].id);
    }
    let fhbPromise = [];
    for (let i = 0; i < $("#fhbRegis-table .btn-success").length; i++) {
        let str = $("#fhbRegis-table .btn-success")[i].id
        fhbPromise.push(addHybridStudent(str.slice(0, -3), ID, str.slice(-2, -1)));
    }
    let skPromise = [];
    for (let i = 0; i < $("#skRegis .btn-success").length; i++) {
        let skId = $("#skRegis .btn-success")[i].id;
        let skSubj = $("#skRegis .btn-success")[i].innerHTML.slice(6, 7);
        skPromise.push(addSkillStudent(skId, ID, skSubj));
    }
    let crRes = await addStudentCourse(ID, crPromise);
    let fhbRes = await Promise.all(fhbPromise);
    let skRes = await Promise.all(skPromise);
    // let [crRes, fhbRes, skRes] = await Promise.all(addStudentCourse(ID, crPromise), Promise.all(fhbPromise), Promise.all(skPromise));
    log("cr=>");
    log(crRes);
    log("fhb=>");
    log(fhbRes);
    log("sk=>");
    log(skRes);
    await changeRegistrationState(ID, "untransferred", { year: year, quarter: quarter });
    self.location = "/registrationReceipt";
}