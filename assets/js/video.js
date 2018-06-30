$("#submitBtn").click(function () {
    let stdID = $("#stdIdInput").val();
    if (stdID.length != 6) {
        alert("Wrong ID!");
    } else {
        $.post("post/v1/getStudentVdoList", {
            studentCode: stdID
        }).then((cb) => {
            genBtn(cb.files);
        });
    }
});

function genBtn(files) {
    for (let i in files) {
        $("#btn-container").append(
            "<button class='btn btn-outline-secondary col-3 mx-2' style='height:20vh;'>" + files[i].slice(0, -4) + "</button>"
        )
    }
}

$("#btn-container").on('click', '.btn', function () {
    let filename = this.innerHTML;
    $.post("post/v1/encryptRequest", {
        // body: filename + '.mp4'
        body: "{\"studentCode\":" + $("#stdIdInput").val() + ",\"videoName\":\"" + filename + ".mp4\"}",
    }).then((cb) => {
        window.location.assign("https://monkey-monkey.com/get/v1/video?v=" + cb.path);
    });

});