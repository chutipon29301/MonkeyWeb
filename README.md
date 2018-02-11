# MONKEY WEB
This site is for using in [Monkey](https://monkey-monkey.com)

## Getting Started
### Prerequisite
1. MongoDB
2. Node.js
3. npm

**Note:**
This website use:
- `express` as the request handeler
- `mongo` as database
- `pug` for templating


### Installing
1. Clone project
2. Run `npm install` to download library ising in this project
3. Start project using `npm start` (require `nodemon` install globaly in node environment)

## Add new web page
To add new page add the following code in `webflow.js` or the corresponding file.
```javascript
app.get('/yourLink', [middleWareOptions], function(req, res) {
	// TODO:do some magic here
	
	// For rendering pug page use the following code
	return res.status(200).render('YourPageName', {
		renderingOptions
	});
});
```
**Note:** For more response type please visit [Express](https://expressjs.com/en/4x/api.html)

## Post method
---
### Phase II (V1) current version

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

#### Quota
- The following function use to modify and view quota of the student who absent

- addQuota
	
	This function is use to add the modifier to student either plus or minus
	- request path `/post/v1/addQuota`
	- request body
		```javascript
		req.body = {
			studentID: 15999,
			subject: 'M',
			value: 1,
			quarterID: 201701 /* Optional quarter id to specify quarter to add quota */
		}
		```
	- response body
		```javascript
		res.body = {
			msg: 'OK'
		}
		```
- deleteQuota

	This function is use to delete quota transaction

	**Note:** This is destruction function and should not be use. This function will delete the history of adding quota
	- request path `/post/v1/deleteQuota`
	- request body
		```javascript
		req.body = {
			quotaID: 'w4y7napqv5w4founvc35q4d'
		}
		```
	- response body
		```javascript
		res.body = {
			msg: 'OK'
		}
		```
- listQuota

	This function is use to list specific quota
	- request path `/post/v1/listQuota`
	- request body
		```javascript
		req.body = {
			studentID: 15999,
			quarterID: 201701 /* Optional quarter id to specify quarter to add quota */
		}
		```
	- response body
		```javascript
		res.body = {
			quotaCount: [
				{
					_id: 'M', /* Subject code */
					value: 1
				}, ...
			]
		}
		```

### Phase I
~~Under creating.~~
## TODO
~~Under creating.~~
