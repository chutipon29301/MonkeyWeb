let studentForSearch = [];

/**
 * Convert number grade to string grade
 * @param grade in form for number
 * @returns {string} grade letter
 */
const getLetterGrade = (grade) => {
    if (grade <= 6) {
        return "P" + grade;
    } else {
        return "S" + (grade - 6);
    }
};

/**
 * Get short name of day
 * @param date int day 0 - 6
 * @returns {string} name of day
 */
const getDateName = (date) => {
    let dateName = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return dateName[date];
};
$(function () {
    log($(document).width());
    if ($(document).width() > 767) {
        $("#filterPanel").addClass("position-fixed");
    }
    getAllStudentContent();
});

function quarterChange() {
    const quarter = document.getElementById("quarter");
    writeCookie("monkeyWebSelectedQuarter", quarter.options[quarter.selectedIndex].value);
    getAllStudentContent();
}

function registrationStateChange() {
    const stage = document.getElementById("stage");
    writeCookie("monkeyWebSelectedStage", stage.value);
    getAllStudentContent();
}


/**
 * Get data for generating table by calling function generateStudentHtmlTable
 */
function getAllStudentContent() {
    getConfig().then(config => {
        document.getElementById("currentStudentLabel").innerHTML = "Current Student: " + (config.nextStudentID - 1);
        loadSelectedMenu(config);
        studentForSearch = [];
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
                const $typeahead = $('.typeahead');
                $typeahead.typeahead({
                    source: studentForSearch,
                    autoSelect: true
                });
                $typeahead.change(function () {
                    let current = $typeahead.typeahead("getActive");
                    if (current) {
                        writeCookie("monkeyWebAdminAllstudentSelectedUser", current.id);
                        self.location = "/adminStudentprofileQ4";
                    }
                });

                // for generate table data
                position(getCookieDict().monkeyWebUser).then(quarterData => {
                    let quaterStatus = "public";
                    switch (quarterData.position) {
                        case "tutor":
                        case "admin":
                            quaterStatus = "protected";
                            break;
                        case "dev":
                            quaterStatus = "private";
                            break;
                    }
                    listQuarter(quaterStatus).then(quarterList => {
                        generateStudentHtmlTable(filterData(data.student, quarterList, config));
                    });
                });
            }
        })
    });
}

function loadSelectedMenu(config) {
    const stage = document.getElementById("stage");
    let cookie = getCookieDict();
    let stageList = [{
        value: "all",
        text: "No filter"
    }, {
        value: "allStage",
        text: "All Stage"
    }, {
        value: "unregistered",
        text: "Unregistered"
    }, {
        value: "untransferred",
        text: "Untransferred"
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

    const quarter = document.getElementById("quarter");
    quarter.innerHTML = "";
    let quaterStatus = "";
    position(cookie.monkeyWebUser).then(data => {
        switch (data.position) {
            case "tutor":
            case "admin":
                quaterStatus = "protected";
                break;
            case "dev":
                quaterStatus = "private";
                break;
        }
        listQuarter(quaterStatus).then(data => {
            for (let i = 0; i < data.quarter.length; i++) {
                quarter.innerHTML += "<option value = '" + data.quarter[i].year + "-" + data.quarter[i].quarter + "'>" + data.quarter[i].name + "</option>";
            }
            if (cookie.monkeyWebSelectedQuarter === undefined) {
                quarter.value = config.defaultQuarter.quarter.year + "-" + config.defaultQuarter.quarter.quarter;
            } else {
                quarter.value = cookie.monkeyWebSelectedQuarter;
            }
        })
    });
}


/**
 * Filter data from selected option
 * @param data array of student info
 * @param quarterList
 * @param config
 * @returns {*} array of student to display in table
 */
function filterData(data, quarterList, config) {
    let quarter = document.getElementById("quarter");
    let status = document.getElementById("status");
    let stage = document.getElementById("stage");
    let grade = document.getElementById("grade");
    let course = document.getElementById("course");
    let cookie = getCookieDict();

    if (cookie.monkeyWebSelectedQuarter === undefined) {
        cookie.monkeyWebSelectedQuarter = config.defaultQuarter.quarter.year + "-" + config.defaultQuarter.quarter.quarter;
    }

    let selectedYear = parseInt(cookie.monkeyWebSelectedQuarter.substring(0, cookie.monkeyWebSelectedQuarter.indexOf("-")));
    let selectedQuarter = parseInt(cookie.monkeyWebSelectedQuarter.substring(cookie.monkeyWebSelectedQuarter.indexOf("-") + 1));
    data = data.filter(data => {
        if (stage.options[stage.selectedIndex].value !== "all") {
            let registrationState = "unregistered";
            for (let i = 0; i < data.quarter.length; i++) {
                if (selectedYear = data.quarter[i].year && selectedQuarter === data.quarter[i].quarter) {
                    registrationState = data.quarter[i].registrationState;
                }
            }
            if (stage.options[stage.selectedIndex].value === "allStage" && registrationState !== "unregistered") {
                return true;
            }
            return stage.options[stage.selectedIndex].value === registrationState;
        }
        return true;
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
                row.setAttribute("class", "table-danger");
                break;
            case 'dropped':
                row.setAttribute("class", "table-warning");
                break;
            case 'inactive':
                row.setAttribute("class", "table-info");
                break;
        }
        if (stage === "finished") {
            row.setAttribute("class", "table-success");
        }
        let cell0 = row.insertCell(0);
        let cell1 = row.insertCell(1);
        let cell2 = row.insertCell(2);
        let cell3 = row.insertCell(3);
        let cell4 = row.insertCell(4);
        let cell5 = row.insertCell(5);
        let cell6 = row.insertCell(6);
        // let cell7 = row.insertCell(7);
        // let cell8 = row.insertCell(8);
        cell0.innerHTML = "<td>" + (i + 1) + "</td>";
        cell1.innerHTML = "<td>" + student[i].studentID + "</td>";
        cell2.innerHTML = "<td>" + getLetterGrade(student[i].grade) + "</td>";
        cell3.innerHTML = "<td>" + student[i].nickname + "</td>";
        cell4.innerHTML = "<td>" + student[i].firstname + "</td>";
        cell5.innerHTML = "<td>" + student[i].lastname + "</td>";
        cell6.innerHTML = "<td>" + student[i].level + "</td>";
        // cell7.innerHTML = "<td>" + ((student[i].inCourse) ? "✔" : "✖") + "</td>";
        // cell8.innerHTML = "<td>" + ((student[i].inHybrid) ? "✔" : "✖") + "</td>";

        let clickHandler = (row) => () => {
            //noinspection SpellCheckingInspection
            writeCookie("monkeyWebAdminAllstudentSelectedUser", row.getElementsByTagName("td")[1].innerHTML);
            //noinspection SpellCheckingInspection
            self.location = "/adminStudentprofileQ4";
        };
        row.onclick = clickHandler(row);
    }
}

function scanStudentBarcode() {
    let inputBox = document.getElementById("studentID");
    writeCookie("monkeyWebAdminAllstudentSelectedUser", inputBox.value.substring(0, inputBox.value.length - 1));
    self.location = "/adminStudentprofileQ4";
}

function createNewStudent() {
    $.post("/post/addBlankStudent", {
        number: 1
    }).then(data => {
        log(data);
        document.getElementById("newStudentUsername").innerHTML = "Username: " + data.student[0].studentID;
        document.getElementById("newStudentPassword").innerHTML = "Password: " + data.student[0].password;
        $("#newStudentDialog").modal({
            backdrop: 'static',
            keyboard: false
        });
    });
}

function closeNewStudentDialog() {
    $("#newStudentDialog").modal("hide");
    location.reload();
}