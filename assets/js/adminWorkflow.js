$("#bodyPane").hide();
let uniqueTask = [];
getData();
async function getData() {
    let allTutor = await $.post('post/v1/listTutor');
    let promise = [];
    for (let i in allTutor) {
        promise.push($.post('v2/workflow/listNode', { id: allTutor[i].tutorID }));
    }
    let allTask = await Promise.all(promise);
    for (let i in allTask) {
        uniqueTask = _.union(uniqueTask, allTask[i].nodes);
        uniqueTask = _.remove(uniqueTask, (e) => { return e.canDelete });
    }
    getTutorName();
}
async function getTutorName() {
    let promise = [];
    for (let i in uniqueTask) {
        promise.push(name(uniqueTask[i].owner));
    }
    let ownerName = await Promise.all(promise);
    for (let i in uniqueTask) {
        uniqueTask[i].owner = ownerName[i].nicknameEn;
    }
    genTable(1);
}
function genTable(type) {
    let task = uniqueTask;
    switch (type) {
        case 2:
            task = _.orderBy(task, 'title', 'asc');
            break;
        case 3:
            task = _.orderBy(task, 'childOwnerName', 'asc');
            break;
        case 4:
            task = _.orderBy(task, 'duedate', 'asc');
            break;
        case 5:
            task = _.orderBy(task, 'status', 'asc');
            break;
        default:
            break;
    }
    let table = $("#tableBody");
    table.empty();
    for (let i in task) {
        let t;
        if (task[i].duedate !== null) {
            t = moment(task[i].duedate).format('DD/MM/YY');
        } else {
            t = 'None';
        }
        let state = ''
        switch (task[i].status.toLowerCase()) {
            case 'assign':
                state = 'bg-warning'
                break;
            case 'complete':
                state = 'bg-success text-white'
                break;
            default:
                break;
        }
        table.append(
            "<tr class='" + state + "'>" +
            "<td class='text-center'>" + task[i].title + "</td>" +
            "<td class='text-center'>" + task[i].owner + "</td>" +
            "<td class='text-center'>" + task[i].status + "</td>" +
            "<td class='text-center'>" + task[i].childOwnerName + "</td>" +
            "<td class='text-center'>" + t + "</td>" +
            "</tr>"
        )
    }
    $("#loaddingPane").hide();
    $("#bodyPane").show();
}

$("#filterSelect").change(function () {
    genTable(parseInt(this.value));
});