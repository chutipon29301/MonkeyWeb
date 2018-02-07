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
	- *req* `{year, quarter}`
	- *return* `{courseID, courseName, day, tutorName, studentCount, room, grade}`

#### Quarter
- `post/v1/listQuarter` get all quarter.
	- *req* `{status[option]}` "public", "private", "protect"
	- *return* `[{year, quarter, name, quarterID, status, maxSeat, week}]`

#### QR
- `post/v1/requestQR` get String for generate QR code.
	- *req* `{subject, ageGroup, level, difficulty, number, rev, subRev, alternative[option], supplement[option]}`
	- *return* `{hw, skill, test, hot}`

### Phase I
~~Under creating.~~
## TODO
~~Under creating.~~
