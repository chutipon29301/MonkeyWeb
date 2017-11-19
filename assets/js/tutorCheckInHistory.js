let cookie = getCookieDict();
log(cookie.monkeyWebUser);
let start = moment(0).day(1).month(10).year(2017).hour(0);
logMoment(start);
$.post("post/v1/listInterval").then(data => {
    log(data)
})
function logMoment(moment) {
    log(moment.format("DD/MM/YYYY HH:mm:ss"));
}