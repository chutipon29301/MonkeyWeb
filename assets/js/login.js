// const passwordCheck = (userID, pwd) => $.post("/post/password", {
//     userID: userID,
//     password: pwd
// });

// const positionCheck = (userID) => $.post("/post/position", {
//     userID: userID
// });

// const registrationStateCheck = (studentID) => $.post("post/registrationState", {
//     studentID: studentID,
//     year: 2017,
//     quarter: 4
// });


function loginSubmit() {
    "use strict";
    let user = document.getElementById("usr");
    let pwd = document.getElementById("pwd");
    if (user.value.length === 0) {
        document.getElementById("usrReq").style.visibility = "visible";
        document.getElementById("usrFromGroup").classList.add("has-error")
    }
    if (user.value.length !== 0) {
        document.getElementById("usrReq").style.visibility = "hidden";
        document.getElementById("usrFromGroup").className = "form-group"
    }
    if (pwd.value.length === 0) {
        document.getElementById("pwdReq").style.visibility = "visible";
        document.getElementById("pwdFromGroup").classList.add("has-error")
    }
    if (pwd.value.length !== 0) {
        document.getElementById("pwdReq").style.visibility = "hidden";
        document.getElementById("pwdFromGroup").className = "form-group"
    }
    if (pwd.value.length !== 0 && user.value.length !== 0) {
        login(parseInt(user.value), pwd.value)
    }
}

function login(user, pwd) {
    console.log(pwd)
    $.post('post/v1/login',{id:user,password:encrypt(""+pwd).toString()},data=>{
        if(data.err) {
            alert("ID or password is incorrect.")
            $('#pwd').val('')
            throw data.err
        }
        else{
            writeUserCookie(user, pwd)
            this.location = data.redirect;
        }
    })
}

// function redirectLocation(user) {
//     positionCheck(user).then((data) => {
//         if (data.err) {
//             log("[redirectLocation()] : post/position => " + data.err);
//         } else {
//             log("[redirectLocation()] : post/position => ");
//             log(data);
//             switch (data.position) {
//                 case "student":
//                     studentLogin(user);
//                     break;
//                 case "tutor":
//                     self.location = "/tutorCheck";
//                     break;
//                 case "admin":
//                 case "dev":
//                 case "mel":
//                     self.location = "/adminAllstudent";
//                     break;
//                 default:
//                     break
//             }
//         }
//     });
// }

// function studentLogin(studentID) {
//     registrationStateCheck(studentID).then((data) => {
//         if (data.err) {
//             log("[studentLogin()] : post/registrationState => " + data.err);
//         } else {
//             $.post("post/studentProfile",{studentID:studentID},function(studentProf){
//                 if(studentProf.status == "inactive"){
//                     self.location = "/registrationName"
//                 }else{
//                     log("[studentLogin()] : post/registrationState => ");
//                     log(data);
//                         //noinspection SpellCheckingInspection
//                     if (data.registrationState === "untransferred" || data.registrationState === "rejected") {
//                         self.location = "/registrationReceipt";
//                     } else {
//                         self.location = "/home";
//                     }
//                 }
//             })
//         }
//     });
// }

// function clearInput() {
//     "use strict";
//     let pwd = document.getElementById("pwd");
//     pwd.value = ""
// }

function encrypt(text) {
    "use strict";
    return CryptoJS.SHA3(text)
}

function writeUserCookie(user, pwd) {
    "use strict";
    writeCookie("monkeyWebUser", user);
    writeCookie("monkeyWebPassword", encrypt(pwd).toString())
}
