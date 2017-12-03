let cookie = getCookieDict();
let ID = "";
if (cookie.monkeyWebUser == undefined) {
    self.location = "/login";
} else {
    ID = cookie.monkeyWebUser;
}
let path = '';
genHeader();
genCost();

$("#file-1").change(function () {
    uploadImg();
});

$("#submit").click(function () {
    if ($("#preview").attr("src") == "images/noImage.svg") {
        alert("กรุณา Upload ใบโอน");
    } else {
        changeRegistrationState(ID, "transferred", { year: year, quarter: quarter });
        self.location = "/studentProfile";
    }
});

async function genHeader() {
    let [config, allQ] = await Promise.all([getConfig(), listQuarter("public")]);
    for (let i in allQ.quarter) {
        if (allQ.quarter[i].year == year && allQ.quarter[i].quarter == quarter) {
            $("#receiptHead").html("รายละเอียดการโอนเงินคอร์ส " + allQ.quarter[i].name);
            path = config.receiptPath.slice(config.receiptPath.search("MonkeyWebData") + 14) + allQ.quarter[i].name + "/" + ID;
        }
    }
    loadPreview();
}
async function genCost() {
    let stdInfo = await studentProfile(ID);
    let promise = [];
    for (let i in stdInfo.courseID) {
        promise.push(courseInfo(stdInfo.courseID[i]));
    }
    let crInfo = await Promise.all(promise);
    let crCount = 0;
    for (let i in crInfo) {
        if (crInfo[i].year == year && crInfo[i].quarter == quarter) {
            crCount += 1;
        }
    }
    if (stdInfo.level.slice(0, 2) == 12) {
        $(".money").html("ชำระเงินจำนวน " + (crCount * extraFee) + " บาท");
    } else $(".money").html("ชำระเงินจำนวน " + (crCount * fee) + " บาท");
}

function uploadImg() {
    let imgUrl = '';
    let ufile = $('#file-1');
    let ext = ufile.val().split('.').pop().toLowerCase();
    if ($.inArray(ext, ['png', 'jpg', 'jpeg']) === -1) {
        alert('กรุณาอัพไฟล์ .jpg, .jpeg หรือ .png เท่านั้น');
    } else {
        let files = ufile.get(0).files;
        let formData = new FormData();
        let file = files[0];
        formData.append('file[]', file, file.name);
        imgUrl = 'post/submitReceipt'
        formData.append('studentID', ID);
        formData.append('year', year);
        formData.append('quarter', quarter);
        $.ajax({
            url: imgUrl,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                loadPreview();
            }
        });
    }
}

async function loadPreview() {
    $.get(path + ".jpg").done(() => {
        $("#preview").attr("src", path + ".jpg");
    }).fail(() => {
        $.get(path + ".png").done(() => {
            $("#preview").attr("src", path + ".png");
        }).fail(() => {
            $.get(path + ".jpeg").done(() => {
                $("#preview").attr("src", path + ".jpeg");
            }).fail(() => {
                log("can't find picture");
                $("#preview").attr("src", "images/noImage.svg");
            });
        });
    });
}