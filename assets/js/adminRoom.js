// let app = angular.module('tableRoom', ['rx', 'ngMaterial']);
// var quarter = [
//     {
//         year: 2017,
//         quarter: 3,
//         name: 'CR60Q3'
//     }, {
//         year: 2017,
//         quarter: 12,
//         name: 'CR60OCT'
//     }, {
//         year: 2017,
//         quarter: 4,
//         name: 'CR60Q4 '
//     }
// ];
// var selectQuarterObject = null

// app.config(function ($httpProvider) {
//     $httpProvider.defaults.transformRequest = function (data) {
//         if (data === undefined) {
//             return data;
//         }
//         return $.param(data);
//     }
// });

// app.config(function ($mdThemingProvider) {
//     $mdThemingProvider.theme('default')
// });

// var subjectColor = {
//     'M': 'Orange-200',
//     'P': 'Purple-100',
//     'C': 'Grey-400',
//     'S': 'Red-100',
//     'E': 'Blue-100',
// }


// let tableGenerator = ($scope, $http, roomPostObject) => {
//     $scope.roomDayList = [];

//     var transform = function (data) {
//         return $.param(data);
//     };

//     console.log(roomPostObject);
//     let roomInfo = Rx.Observable.fromPromise($http.post('post/roomInfo',
//         roomPostObject
//         , {
//             headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
//             transformRequest: transform
//         })
//     );

//     let courseInfo = (courseID) => Rx.Observable.fromPromise($http.post('post/courseInfo', {
//         courseID: courseID
//     }, {
//             headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
//             transformRequest: transform
//         })
//     );

//     let tutorName = (userID) => Rx.Observable.fromPromise($http.post('post/name', {
//         userID: userID
//     }, {
//             headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
//             transformRequest: transform
//         })
//     );

//     let index = 0;
//     roomInfo.subscribe((res) => {
//         if (indexOfObjectInArray($scope.roomDayList, 'Hybrid') === -1) {
//             $scope.roomDayList.push({
//                 room: 'Hybrid',
//                 courseName: 'Hybrid',
//                 noStudent: (res.data.fullHybrid.length === 0) ? 0 : (res.data.fullHybrid[0].studentID.length + res.data.fullHybrid[1].studentID.length),
//                 full: res.data.maxHybridSeat,
//                 courseID: 'Hybrid',
//                 property: 'nonExpandable',
//                 isHidden: false,
//                 bgColor: 'Grey-200'
//             });
//             $scope.roomDayList.push({
//                 courseID: 'Hybrid',
//                 courseName: 'Full Hybrid Math',
//                 noStudent: (res.data.fullHybrid.length === 0) ? 0 : (res.data.fullHybrid[0].studentID.length),
//                 property: 'expandable',
//                 isHidden: true,
//                 bgColor: 'Orange-200'
//             });
//             $scope.roomDayList.push({
//                 courseID: 'Hybrid',
//                 courseName: 'Full Hybrid Physics',
//                 noStudent: (res.data.fullHybrid.length === 0) ? 0 : (res.data.fullHybrid[1].studentID.length),
//                 property: 'expandable',
//                 isHidden: true,
//                 bgColor: 'Purple-100'
//             });
//         }
//         for (let i = 0; i < res.data.courseHybrid.length; i++) {
//             $scope.roomDayList.push({
//                 courseID: res.data.courseHybrid[i],
//                 property: 'expandable',
//                 isHidden: true
//             });
//         }

//         for (let i = 0; i < res.data.course.length; i++) {
//             if (res.data.course[i] === null) continue;
//             $scope.roomDayList.push({
//                 room: i,
//                 full: res.data.course[i].maxSeat,
//                 courseID: res.data.course[i].courseID,
//                 property: 'nonExpandable',
//                 isHidden: false
//             });
//         }

//         for (let i = 0; i < $scope.roomDayList.length; i++) {
//             if ($scope.roomDayList[i].courseID !== 'Hybrid') {
//                 courseInfo($scope.roomDayList[i].courseID).subscribe(res => {
//                     $scope.roomDayList[i].courseName = res.data.courseName;
//                     $scope.roomDayList[i].noStudent = res.data.student.length;
//                     $scope.roomDayList[i].bgColor = subjectColor[res.data.courseName.charAt(0)];
//                     tutorName(res.data.tutor[0]).subscribe(response => {
//                         $scope.roomDayList[i].courseName += ' (' + response.data.nicknameEn + ')';
//                     });
//                 });
//             } else {
//                 for (let j = 0; j < res.data.courseHybrid.length; j++) {
//                     if ($scope.roomDayList[i].property === 'expandable') continue;
//                     courseInfo(res.data.courseHybrid[j]).subscribe(response => {
//                         $scope.roomDayList[i].noStudent += response.data.student.length;
//                         $scope.roomDayList[i].bgColor = subjectColor[res.data.courseName.charAt(0)];;
//                     })
//                 }
//             }
//         }
//     });

//     $scope.tableRowClick = (room) => {
//         if (room.courseID !== 'Hybrid') {
//             writeCookie('monkeyWebAdminAllcourseSelectedCourseID', room.courseID);
//             self.location = '/adminCoursedescription';
//         } else {
//             if (room.property !== 'expandable') {
//                 for (let i = 0; i < $scope.roomDayList.length; i++) {
//                     if ($scope.roomDayList[i].property === 'expandable') {
//                         $scope.roomDayList[i].isHidden = !$scope.roomDayList[i].isHidden
//                     }
//                 }
//             }
//         }
//     };

// };

// app.controller('tue', function ($scope, $http) {
//     tableGenerator($scope, $http, {
//         day: -136800000,
//         quarter: 3,
//         year: 2017
//     });
// });

// app.controller('thu', function ($scope, $http) {
//     tableGenerator($scope, $http, {
//         day: 36000000,
//         quarter: 3,
//         year: 2017
//     });
// });

// app.controller('sat8', function ($scope, $http) {
//     tableGenerator($scope, $http, {
//         day: 176400000,
//         quarter: 3,
//         year: 2017
//     });
// });

// app.controller('sat10', function ($scope, $http) {
//     tableGenerator($scope, $http, {
//         day: 183600000,
//         quarter: 3,
//         year: 2017
//     });
// });

// app.controller('sat13', function ($scope, $http) {
//     tableGenerator($scope, $http, {
//         day: 194400000,
//         quarter: 3,
//         year: 2017
//     });
// });

// app.controller('sat15', function ($scope, $http) {
//     tableGenerator($scope, $http, {
//         day: 201600000,
//         quarter: 3,
//         year: 2017
//     });
// });

// app.controller('sun8', function ($scope, $http) {
//     var promise = new Promise((res, rej) => {
//         tableGenerator($scope, $http, {
//             day: -342000000,
//             quarter: 3,
//             year: 2017
//         });
//         res();
//     });
//     promise.then(() => {
//         tableGenerator($scope, $http, {
//             day: 262800000,
//             quarter: 3,
//             year: 2017
//         });
//     });
// });

// app.controller('sun10', function ($scope, $http) {
//     var promise = new Promise((res, rej) => {
//         tableGenerator($scope, $http, {
//             day: -334800000,
//             quarter: 3,
//             year: 2017
//         });
//         res();
//     });
//     promise.then(() => {
//         tableGenerator($scope, $http, {
//             day: 270000000,
//             quarter: 3,
//             year: 2017
//         });
//     });
// });

// app.controller('sun13', function ($scope, $http) {
//     var promise = new Promise((res, rej) => {
//         tableGenerator($scope, $http, {
//             day: -324000000,
//             quarter: 3,
//             year: 2017
//         });
//         res();
//     });
//     promise.then(() => {
//         tableGenerator($scope, $http, {
//             day: 280800000,
//             quarter: 3,
//             year: 2017
//         });
//     });
// });

// app.controller('sun15', function ($scope, $http) {
//     var promise = new Promise((res, rej) => {
//         tableGenerator($scope, $http, {
//             day: -316800000,
//             quarter: 3,
//             year: 2017
//         });
//         res();
//     });
//     promise.then(() => {
//         tableGenerator($scope, $http, {
//             day: 288000000,
//             quarter: 3,
//             year: 2017
//         });
//     });
// });

// app.controller('mon8', function ($scope, $http) {
//     tableGenerator($scope, $http, {
//         day: -255600000,
//         quarter: 12,
//         year: 2017
//     });
// });

// app.controller('mon10', function ($scope, $http) {
//     tableGenerator($scope, $http, {
//         day: -248400000,
//         quarter: 12,
//         year: 2017
//     });
// });

// app.controller('mon13', function ($scope, $http) {
//     tableGenerator($scope, $http, {
//         day: -237600000,
//         quarter: 12,
//         year: 2017
//     });
// });

// app.controller('selectQuarter', function ($scope, $http) {
//     $scope.quarter = quarter;
//     $scope.items = [1, 2, 3, 4, 5, 6, 7];
//     $scope.selectedItem;
//     $scope.getSelectedText = function () {
//         if ($scope.selectedItem !== undefined) {
//             return $scope.selectedItem.name;
//         } else {
//             return "Select display quarter";
//         }
//     };
// });

// function indexOfObjectInArray(array, key) {
//     for (let i = 0; i < array.length; i++) {
//         if (array[i].room === key) {
//             return i;
//         }
//     }
//     return -1;
// }

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