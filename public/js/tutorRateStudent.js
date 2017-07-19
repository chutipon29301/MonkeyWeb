$(document).ready(function () {
    var student = [];
    $.post("post/allStudent").then((data) => {
        for (let i = 0; i < data.student.length; i++) {
            if (data.student[i].status === "active") {
                student[i] = data.student[i].nickname + " " + data.student[i].firstname;
            }
        }
        var search = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.whitespace,
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: student
        });
        $('#search-box .typeahead').typeahead(
            {
                hint: false,
                highlight: true,
                minLength: 1
            },
            {
                name: 'student',
                source: search
            });
    });
});