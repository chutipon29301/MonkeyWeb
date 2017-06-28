let app = angular.module("tableRoom", ['rx']);

let tableGenerator = ($scope, $http, time) => {
    // $.post("/post/courseInfo",{
    //     courseID: "5937b91a5201290940356275"
    // }).then((data)=>{
    //     log(data)
    // });
    // $http({
    //     method: "POST",
    //     url: "/post/courseInfo",
    //     data: {
    //         courseID: "5937b91a5201290940356275"
    //     }
    // }).then(function (success) {
    //     log(success)
    // }, function (error) {
    //     log(error)
    // });
    $http.post("/post/courseInfo", {
        courseID: "5937b91a5201290940356275"
    }, {
        "Content-Type": "Content-Type:application"
    })
        .then(
            function (response) {
                log(response.data);
            },
            function (response) {
                log(response);
            }
        );

    $scope.roomDayList = [{
        room: 1,
        courseName: "CHS123z",
        noStudent: 10,
        full: 50,
        courseID: "5937b91a5201290940356275"
    }, {
        courseName: "PHS3a",
        room: 2,
        noStudent: 20,
        full: 50,
        courseID: "5937b9ce5201290940356279"
    }, {
        room: 3,
        courseName: "PHS4a",
        noStudent: 30,
        full: 50,
        courseID: "5937baa6520129094035627e"
    }, {
        room: 4,
        courseName: "PHS6x",
        noStudent: 30,
        full: 50,
        courseID: "5937bb085201290940356282"
    }];

    $scope.tableRowClick = (courseID) => {
        writeCookie("monkeyWebAdminAllcourseSelectedCourseID", courseID);
        self.location = "/adminCoursedescription";
    };

    // var source = Rx.Observable.range(1, 5);
    //
    // var subscription = source.subscribe(
    //     x => console.log('onNext: ' + x),
    //     e => console.log('onError: ' + e.message),
    //     () => console.log('onCompleted'));
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
    tableGenerator($scope, $http, 262800000);
});

app.controller("sun10", function ($scope, $http) {
    tableGenerator($scope, $http, 270000000);
});

app.controller("sun13", function ($scope, $http) {
    tableGenerator($scope, $http, 280800000);
});

app.controller("sun15", function ($scope, $http) {
    tableGenerator($scope, $http, 288000000);
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
