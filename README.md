# MONKEY WEB
This site is for using in [Monkey](https://monkey-monkey.com)
## Getting Started
### Prerequisite
1. MongoDB
2. Node.js

**Note:** This web using Pug/Jade.
### Installing
After clone or pull from [My GitHub](https://github.com/monkey-monkey/MonkeyWeb). You must run this before
```
npm install
```
And run this on your directory
```
mongod
node .
```
## Add new web page
For generate page from add this code at web flow.
```
app.get(URL,[option],function(req,res){
	func...
	return res.status(xxx).render(Page,[option]);
});
```
## Post method
### Phase II (V1)
#### Course
- `post/v1/allCourse` get course data.
*req* `{year, quarter}`
*return* `{courseID, courseName, day, tutorName, studentCount, room, grade}`
#### Quarter
- `post/v1/listQuarter` get all quarter.
*req* `{status[option]}` "public", "private", "protect"
*return* `[{year, quarter, name, quarterID, status, maxSeat, week}]`
#### QR
- `post/v1/requestQR` get String for generate QR code.
*req* `{subject, ageGroup, level, difficulty, number, rev, subRev, alternative[option], supplement[option]}`
*return* `{hw, skill, test, hot}`
### Phase I
- `post/password` verify user.
*req* `{userID:Int, password:String}`
*return* `{verified:bool}`
- `post/name` get user name.
*req* `{userID:Int}`
*return* `{firstname:String, lastname:String, nickname:String, firstnameEn:String, lastnameEn:String, nicknameEn:String}`
- `post/position` get user position.
*req* `{userID:Int}`
*return* `{position:String}`
- `post/status` get user status.
*req* `{userID:Int}`
*return* `{status:String}`
- `post/changeStatus` change user status.
*req* `{userID:Int, status:String}`
*return* `{}`
~~- `post/allStudent` get all student data.
*req* `{}`
*return*`{studentID:String, firstname:String, lastname:String, nickname:String, grade:Int, quarter:Int, status:String, level:String, remark:String, inCourse:bool, inHybrid:bool}`~~
- `post/studentProfile` get a student data.
*req* `{studentID:Int}`
*return*`{firstname:String, lastname:String, nickname:String, firstnameEn:String, lastnameEn:String, nicknameEn:String, email:String, phone:String, courseID:[String], hybridDay:[Int]}`
- `post/registrationState` get a student registration state.
*req* `{studentID:Int}`
*return* `{registrationState:String, year:Int, quarter:Int}`
~~- `post/changeRegistrationState` change a student registration state.
*req* `{year:Int, quarter:Int, studentID:Int, registrationState:String}`
*return* `{}`~~
- `post/addStudentCourse` add course to student.
*req* `{studentID:Int, courseID:String}`
*return* `{}`
- `post/removeStudentCourse` remove course to student.
*req* `{studentID:Int, courseID:String}`
*return* `{}`
~~- `post/addSkillDay` add skill to student.
*req* `{studentID:Int, day:String, subject:String}`
*return* `{}`~~
~~- `post/removeSkillDay` remove student skill.
*req* `{studentID:Int, day:String}`
*return* `{}`~~

**Some one please help to add**
## TODO
~~Under creating.~~
