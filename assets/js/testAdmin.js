// Navigation control function
const containClass = (element) => {
    if (element.className.indexOf("userNav") > -1) {
        return "user";
    } else if (element.className.indexOf("stdNav") > -1) {
        return "std";
    } else if (element.className.indexOf("crNav") > -1) {
        return "cr";
    } else if (element.className.indexOf("configNav") > -1) {
        return "config";
    } else if (element.className.indexOf("etcNav") > -1) {
        return "etc";
    }
};
$(".myContent").hide();
$(".navigationIcon").hide();
$(".myNav").click(function () {
    $("#navigation").slideUp();
    $(".navigationIcon").slideDown();
    $("." + containClass(this) + "Content").slideDown();
});
$("#globalBack").click(function(){
    $("#navigation").slideDown();
    $(".navigationIcon").slideUp();
    $(".myContent").slideUp();
});