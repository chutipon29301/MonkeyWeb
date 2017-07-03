let app = angular.module("tableRoom", ['rx']);

let tableGenerator = ($scope, $http, time) => {
    $scope.roomDayList = [];

    let roomInfo = Rx.Observable.fromPromise($.post("post/roomInfo", {
        day: time
    }));

    let courseInfo = (courseID) => Rx.Observable.fromPromise($.post("post/roomInfo", {
        courseID: courseID
    }));

    let index = 0;
    roomInfo.subscribe((data) => {
        let courseID = Rx.Observable.fromArray(data.course);
        let res = courseID.flatMap(id => Rx.Observable.fromPromise($.post("post/courseInfo", {
            courseID: (id == null) ? "null" : id.courseID
        })));
        res.subscribe((data) => {
            // $scope.roomDayList.append({
            //     room: index,
            //     courseName: courseName,
            //     noStudent: data.student.length,
            //     full: 10,
            //     courseID : hairufewhfi
            // });
            console.log(index);
            console.log(data);
            index++;
        });
    });

    // $scope.roomDayList = [{
    //     room: 1,
    //     courseName: "CHS123z",
    //     noStudent: 10,
    //     full: 50,
    //     courseID: "5937b91a5201290940356275"
    // }, {
    //     courseName: "PHS3a",
    //     room: 2,
    //     noStudent: 20,
    //     full: 50,
    //     courseID: "5937b9ce5201290940356279"
    // }, {
    //     room: 3,
    //     courseName: "PHS4a",
    //     noStudent: 30,
    //     full: 50,
    //     courseID: "5937baa6520129094035627e"
    // }, {
    //     room: 4,
    //     courseName: "PHS6x",
    //     noStudent: 30,
    //     full: 50,
    //     courseID: "5937bb085201290940356282"
    // }];

    $scope.tableRowClick = (courseID) => {
        writeCookie("monkeyWebAdminAllcourseSelectedCourseID", courseID);
        self.location = "/adminCoursedescription";
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
