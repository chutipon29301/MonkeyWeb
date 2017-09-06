/**
 * Get short name of day
 * @param date int day 0 - 6
 * @returns {string} name of day
 */
var studentForSearch = [];
const getDateName = (date) => {
    let dateName = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return dateName[date];
};

function quarterChange() {
    var quarter = document.getElementById("quarter");
    writeCookie("monkeyWebSelectedQuarter", quarter.value);
    getAllStudentContent();
}

function registrationStateChange() {
    var stage = document.getElementById("stage");
    writeCookie("monkeyWebSelectedStage", stage.value);
    getAllStudentContent();
}


/**
 * Get data for generating table by calling function generateStudentHtmlTable
 */
function getAllStudentContent() {
    "use strict";
    loadSelectedMenu();
    allStudent().then((data) => {
        if (data.err) {
            log("[getAllStudentContent()] : post/allStudent => " + data.err);
        } else {
            log("[getAllStudentContent()] : post/allStudent => ");
            log(data);

            // for typeahead predict
            for (let i = 0; i < data.student.length; i++) {
                studentForSearch.push({
                    name: data.student[i].nickname + " " + data.student[i].firstname,
                    id: data.student[i].studentID,
                })
            }
            log(studentForSearch);
            $('.typeahead').typeahead({
                source: studentForSearch,
                autoSelect: true
            });
            $('.typeahead').change(function () {
                let current = $('.typeahead').typeahead("getActive");
                if (current) {
                    log(current)
                    writeCookie("monkeyWebAdminAllstudentSelectedUser", current.id);
                    self.location = "/adminStudentprofile";
                }
            });

            // for generate table data
            generateStudentHtmlTable(filterData(data.student));
        }
    })
}

function loadSelectedMenu() {
    var stage = document.getElementById("stage");
    var cookie = getCookieDict();
    var stageList = [{
        value: "all",
        text: "All Stage"
    }, {
        value: "unregistered",
        text: "Unregistered"
    }, {
        value: "untransfered",
        text: "Untransfered"
    }, {
        value: "transferred",
        text: "Transferred"
    }, {
        value: "approved",
        text: "Approved"
    }, {
        value: "rejected",
        text: "Rejected"
    }, {
        value: "pending",
        text: "Pending"
    }, {
        value: "registered",
        text: "Registered"
    }, {
        value: "finished",
        text: "Finished"
    }];

    stage.innerHTML = "";
    for (let i = 0; i < stageList.length; i++) {
        stage.innerHTML += "<option value = '" + stageList[i].value + "'>" + stageList[i].text + "</option>";
    }

    if (cookie.monkeyWebSelectedStage === undefined) {
        stage.value = "all";
    } else {
        stage.value = cookie.monkeyWebSelectedStage;
    }

    var quarter = document.getElementById("quarter");
    var quarterList = [{
        value: "2017-3",
        text: "CR60Q3"
    }, {
        value: "2017-12",
        text: "CR60OCT"
    }, {
        value: "2017-4",
        text: "CR60Q4"
    }]
    quarter.innerHTML = "";
    for (let i = 0; i < quarterList.length; i++) {
        quarter.innerHTML += "<option value = '" + quarterList[i].value + "'>" + quarterList[i].text + "</option>";
    }

    getConfig().then(data => {
        if (cookie.monkeyWebSelectedQuarter === undefined) {
            quarter.value = data.defaultQuarter.quarter.year + "-" + data.defaultQuarter.quarter.quarter;
        } else {
            quarter.value = cookie.monkeyWebSelectedQuarter;
        }
    });

}


/**
 * Filter data from selected option
 * @param data array of student info
 * @returns {*} array of student to display in table
 */
function filterData(data) {
    let quarter = document.getElementById("quarter");
    let status = document.getElementById("status");
    let stage = document.getElementById("stage");
    let grade = document.getElementById("grade");
    let course = document.getElementById("course");

    data = data.filter(data => {
        let registrationState = true;
        for (let i = 0; i < data.quarter.length; i++) {
            if (stage.options[stage.selectedIndex].value !== "all") {
                registrationState = data.quarter[i].registrationState === stage.options[stage.selectedIndex].value;
            }
            let selectedQuarter = quarter.options[quarter.selectedIndex].value;
            if (data.quarter[i].year === parseInt(selectedQuarter.substring(0, selectedQuarter.indexOf("-"))) &&
                data.quarter[i].quarter === parseInt(selectedQuarter.substring(selectedQuarter.indexOf("-") + 1)) &&
                registrationState)
                return true;
        }
        return false;
    });
    if (status.options[status.selectedIndex].value !== "all") {
        data = data.filter(data => {
            return data.status === status.options[status.selectedIndex].value
        }
        );
    }
    if (grade.options[grade.selectedIndex].value !== "all") {
        data = data.filter(data => data.grade === parseInt(grade.options[grade.selectedIndex].value));
    }
    if (course.options[course.selectedIndex].value !== "all") {
        data = data.filter(data => {
            switch (course.options[course.selectedIndex].value) {
                case "hb":
                    return data.inHybrid;
                case "cr":
                    return data.inCourse;
                default:
                    break;
            }
        })
    }
    return data;
}

/**
 * Generate Html element from data
 * @param student information to fill in table
 */
function generateStudentHtmlTable(student) {
    let table = document.getElementById("allStudentTable");
    table.innerHTML = "";
    for (let i = 0; i < student.length; i++) {
        let row = table.insertRow(i);
        let status = student[i].status;
        let stage = student[i].registrationState;
        switch (status) {
            case 'terminated':
                row.setAttribute("class", "danger");
                break;
            case 'dropped':
                row.setAttribute("class", "warning");
                break;
            case 'inactive':
                row.setAttribute("class", "info");
                break;
        }
        if (stage === "finished") {
            row.setAttribute("class", "success");
        }
        let cell0 = row.insertCell(0);
        let cell1 = row.insertCell(1);
        let cell2 = row.insertCell(2);
        let cell3 = row.insertCell(3);
        let cell4 = row.insertCell(4);
        let cell5 = row.insertCell(5);
        let cell6 = row.insertCell(6);
        cell0.innerHTML = "<td>" + (i + 1) + "</td>";
        cell1.innerHTML = "<td>" + student[i].studentID + "</td>";
        cell2.innerHTML = "<td>" + student[i].nickname + "</td>";
        cell3.innerHTML = "<td>" + student[i].firstname + "</td>";
        cell4.innerHTML = "<td>" + student[i].lastname + "</td>";
        cell5.innerHTML = "<td>" + ((student[i].inCourse) ? "✔" : "✖") + "</td>";
        cell6.innerHTML = "<td>" + ((student[i].inHybrid) ? "✔" : "✖") + "</td>";

        let clickHandler = (row) => () => {
            //noinspection SpellCheckingInspection
            writeCookie("monkeyWebAdminAllstudentSelectedUser", row.getElementsByTagName("td")[1].innerHTML);
            //noinspection SpellCheckingInspection
            self.location = "/adminStudentprofile";
        };
        row.onclick = clickHandler(row);
    }
}

function scanStudentBarcode() {
    let inputBox = document.getElementById("studentID")
    writeCookie("monkeyWebAdminAllstudentSelectedUser", inputBox.value.substring(0, inputBox.value.length - 1));
    self.location = "/adminStudentprofile";
}