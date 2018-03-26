$("#quarter-select").change(function () {
    writeCookie('monkeyWebSelectedQuarter', $("#quarter-select").val());
    location.reload();
});

function gotoSkillInfoPage(ID) {
    writeCookie('monkeySelectedSkill', ID);
    self.location = '/adminSkillInfo';
}