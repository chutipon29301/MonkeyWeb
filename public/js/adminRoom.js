let app = angular.module("tableRoom", ['rx']);

app.config(function ($httpProvider) {
    $httpProvider.defaults.transformRequest = function (data) {
        if (data === undefined) {
            return data;
        }
        return $.param(data);
    }
});

let tableGenerator = ($scope, $http, time) => {
    $scope.roomDayList = [];

    var transform = function (data) {
        return $.param(data);
    }

    let roomInfo = Rx.Observable.fromPromise($http.post("post/roomInfo", {
        day: time
    }, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            transformRequest: transform
        })
    );

    let courseInfo = (courseID) => Rx.Observable.fromPromise($http.post("post/courseInfo", {
        courseID: courseID
    }, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            transformRequest: transform
        })
    );

    let tutorName = (userID) => Rx.Observable.fromPromise($http.post("post/name", {
        userID: userID
    }, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            transformRequest: transform
        })
    );

    let index = 0;
    roomInfo.subscribe((res) => {
        $scope.a = res.data;
        $scope.roomDayList.push({
            room: "Hybrid",
            courseName: "Hybrid",
            noStudent: res.data.fullHybrid[0].studentID.length + res.data.fullHybrid[1].studentID.length,
            full: res.data.maxHybridSeat,
            courseID: "Hybrid"
        });
        for (let i = 0; i < res.data.course.length; i++) {
            if (res.data.course[i] === null) continue;
            $scope.roomDayList.push({
                room: i,
                full: res.data.course[i].maxSeat,
                courseID: res.data.course[i].courseID
            });
        }
        for (let i = 0; i < $scope.roomDayList.length; i++) {
            if ($scope.roomDayList[i].courseID !== "Hybrid") {
                courseInfo($scope.roomDayList[i].courseID).subscribe(res => {
                    $scope.roomDayList[i].courseName = res.data.courseName;
                    $scope.roomDayList[i].noStudent = res.data.student.length;
                    tutorName(res.data.tutor[0]).subscribe(response => {
                        $scope.roomDayList[i].courseName += " (" + response.data.nicknameEn + ")";
                    });
                });
            } else {
                for (let j = 0; j < res.data.courseHybrid.length; j++) {
                    courseInfo(res.data.courseHybrid[j]).subscribe(response => {
                        $scope.roomDayList[i].noStudent += response.data.student.length;
                    })
                }
            }
        }
    });

    $scope.tableRowClick = (courseID) => {
        if (courseID !== "Hybrid") {
            writeCookie("monkeyWebAdminAllcourseSelectedCourseID", courseID);
            self.location = "/adminCoursedescription";
        }
    };
};

app.controller("tue", function ($scope, $http) {
    tableGenerator($scope, $http, -136800000);
});

app.controller("thu", function ($scope, $http) {
    tableGenerator($scope, $http, 36000000);
});

app.controller("sat8", function ($scope, $http) {
    tableGenerator($scope, $http, 176400000);
});

app.controller("sat10", function ($scope, $http) {
    tableGenerator($scope, $http, 183600000);
});

app.controller("sat13", function ($scope, $http) {
    tableGenerator($scope, $http, 194400000);
});

app.controller("sat15", function ($scope, $http) {
    tableGenerator($scope, $http, 201600000);
});

app.controller("sun8", function ($scope, $http) {
    tableGenerator($scope, $http, -342000000);
});

app.controller("sun10", function ($scope, $http) {
    tableGenerator($scope, $http, -334800000);
});

app.controller("sun13", function ($scope, $http) {
    tableGenerator($scope, $http, -324000000);
});

app.controller("sun15", function ($scope, $http) {
    tableGenerator($scope, $http, -316800000);
});

function showRoom(evt, cityName) {
    // Declare all variables
    let i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}
