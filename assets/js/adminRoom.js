var allQuarter = () => $.post('post/v1/listQuarter');

var allRoom = (quarterID) => $.post('post/v1/allRoom', {
    quarterID: quarterID
});

function getPageContent() {

    getConfig().then(config => {
        allQuarter().then(data => {
            var selectQuarter = document.getElementById('quarterSelect');
            selectQuarter.innerHTML = '';
            for (let i = 0; i < data.length; i++) {
                selectQuarter.innerHTML += '<option value="' + data[i].quarterID + '">' + data[i].name + '</option>';
            }
            selectQuarter.value = '' + config.defaultQuarter.quarter.year + ((('' + config.defaultQuarter.quarter.quarter).length === 1) ? '0' : '') + config.defaultQuarter.quarter.quarter;
            getTableContent();
        });
    })
}

function getTableContent() {
    var selectQuarter = document.getElementById('quarterSelect');
    var tabs = document.getElementById('tabs');
    var content = document.getElementById('content');
    var dayList = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    var roomName = {
        'room0': 'Hybird',
        'room1': 'Room 1',
        'room2': 'Room 2',
        'room3': 'Room 3',
        'room4': 'Room 4',
        'room5': 'Room 5'
    }
    tabs.innerHTML = '';
    content.innerHTML = '';
    allRoom(selectQuarter.options[selectQuarter.selectedIndex].value).then(data => {
        var keys = [];
        for (var key in data) {
            keys.push(key);
        }
        keys.sort((arg1, arg2) => {
            var hour1 = parseInt(arg1.substring(3, arg1.length));
            var hour2 = parseInt(arg2.substring(3, arg2.length));
            hour1 += dayList.indexOf(arg1.substring(0, 3)) * 100;
            hour2 += dayList.indexOf(arg2.substring(0, 3)) * 100;
            return hour1 - hour2;
        });
        for (let i = 0; i < keys.length; i++) {
            tabs.innerHTML += '<li ' + ((i === 0) ? 'class="active"' : '') + '><a data-toggle="tab" href="#' + keys[i] + '">' + keys[i] + '</a></li>';
            content.innerHTML += '<div id="' + keys[i] + '" class = "fade collapse container' + ((i === 0) ? ' active in' : '') + '">' +
                '<table class = "table table-hover table-bordered">' +
                '<thead>' +
                '<tr>' +
                '<th>Room</th>' +
                '<th>Course</th>' +
                '<th>No.</th>' +
                '</tr>' +
                '</thead>' +
                '<tbody id = "' + keys[i] + '">' +
                '</tbody>' +
                '</table>' +
                '</div>';
            var rooms = []
            for (var room in data[keys[i]]) {
                rooms.push(room);
            }
            rooms.sort((arg1, arg2) => {
                return parseInt(arg1.charAt(arg1.length - 1)) - parseInt(arg2.charAt(arg2.length - 1))
            });
            var table = document.getElementById(keys[i]);
            var tbody = table.getElementsByTagName('tbody')[0];
            for (let j = 0; j < rooms.length; j++) {
                var row = tbody.insertRow(j);
                let cell0 = row.insertCell(0);
                let cell1 = row.insertCell(1);
                let cell2 = row.insertCell(2);

                if (rooms[j] !== 'room0' && data[keys[i]][rooms[j]].course !== undefined) {
                    log(data[keys[i]][rooms[j]].course[0]);
                    cell1.innerHTML = '<td>' + data[keys[i]][rooms[j]].course[0].courseName + '</td>';
                } else {
                    cell1.innerHTML = '<td>Hybrid</td>';
                }
                cell0.innerHTML = '<td>' + roomName[rooms[j]] + '</td>';
                cell2.innerHTML = '<td>' + data[keys[i]][rooms[j]].studentCount + '</td>';
            }
        }

    });
}