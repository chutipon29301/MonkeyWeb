getCheckInData();

// get check in data function
async function getCheckInData() {
    let [pendingCheckIn, finishCheck] = await Promise.all([$.post("post/v1/listPendingTutorCheckIn"), $.post("post/v1/listCheckInHistory", { date: moment().valueOf() })]);
    genTable(pendingCheckIn, finishCheck);
}
async function genTable(pending, finish) {
    $table = $("#tableBody");
    let tutorName = [];
    for (let i in pending) {
        tutorName.push(name(pending[i].tutorID));
    }
    for (let i in finish) {
        tutorName.push(name(finish[i].tutorID));
    }
    tutorName = await Promise.all(tutorName);
    let index = 0;
    for (let i in pending) {
        let day = moment(pending[i].checkIn);
        $table.append(
            "<tr class='table-primary'>" +
            "<td class='text-center'>" + tutorName[index].nickname + " " + tutorName[index].firstname + "</td>" +
            "<td class='text-center'>" + day.format("DD/MM/YYYY") + "</td>" +
            "<td class='text-center'>" + day.format("HH:mm:ss") + "</td>" +
            "<td class='text-center'>-</td>" +
            "</tr>"
        );
        index += 1;
    }
    for (let i in finish) {
        let inTime = moment(finish[i].checkIn);
        let outTime = moment(finish[i].checkOut);
        $table.append(
            "<tr>" +
            "<td class='text-center'>" + tutorName[index].nickname + " " + tutorName[index].firstname + "</td>" +
            "<td class='text-center'>" + inTime.format("DD/MM/YYYY") + "</td>" +
            "<td class='text-center'>" + inTime.format("HH:mm:ss") + "</td>" +
            "<td class='text-center'>" + outTime.format("HH:mm:ss") + "</td>" +
            "</tr>"
        );
        index += 1;
    }
}