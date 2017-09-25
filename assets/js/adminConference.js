var listConferenceObj = []
$(document).ready(function(){
	deleteCookie('monkeyWebAdminAllstudentSelectedUser')
	$.post('post/listConference',{},(data)=>{
		let promise = []
		for(i in data){
			promise.push(reqListStudent(data[i].conferenceID))
		}
		Promise.all(promise).then(()=>{
			listConferenceObj.sort(function(a,b){return (a.name>b.name)?1:-1})
			console.log(listConferenceObj)
			updateTable('all')
		})
	})
})

function updateTable(option){
	let body = $('#tablebody')
	if(option == 'all'){
		let index = 1
		for(let i in listConferenceObj){
			let date = new Date(listConferenceObj[i].day)
			for(let j in listConferenceObj[i].accept){
				body.append('<tr name="'+listConferenceObj[i].accept[j].id+'">'+
					'<td>'+index+'</td>'+
					'<td>'+listConferenceObj[i].accept[j].firstname+' '+listConferenceObj[i].accept[j].lastname+'</td>'+
					'<td>'+listConferenceObj[i].accept[j].grade+'</td>'+
					'<td>'+listConferenceObj[i].name+'</td>'+
					'<td>'+date.toDateString().split(' ')[0]+'</td>'+
					'<td>'+date.toString().split(' ')[4]+'</td>'+
					'<td>Accept</td>'+
					'</tr>'
				)
				index++;
			}
			for(let j in listConferenceObj[i].reject){
				body.append('<tr class="active" name="'+listConferenceObj[i].reject[j].id+'"'+
					'<td>'+index+'</td>'+
					'<td>'+listConferenceObj[i].accept[j].firstname+' '+listConferenceObj[i].accept[j].lastname+'</td>'+
					'<td>'+listConferenceObj[i].accept[j].grade+'</td>'+
					'<td>'+listConferenceObj[i].name+'</td>'+
					'<td>'+date.toDateString().split(' ')[0]+'</td>'+
					'<td>'+date.toString().split(' ')[4]+'</td>'+
					'<td>Reject</td>'+
					'</tr>'
				)
				index++;
			}
		}
		$('tbody').children().click(function(){
			console.log($(this).attr('name'))
			writeCookie('monkeyWebAdminAllstudentSelectedUser',$(this).attr('name'))
			self.location = 'adminStudentProfile'
		})
	}
}

function reqListStudent(id){
	return new Promise(function(res,rej){
		$.post('post/listStudentInConference',{conferenceID:id},function(co){
			if(co.err) rej(co.err);
			let index = listConferenceObj.length
			listConferenceObj.push(co)
			let accept = []
			let reject = []
			for(let i in listConferenceObj[index].accept){
				accept.push(reqProfile(listConferenceObj[index].accept[i].studentID))
			}
			for(let i in listConferenceObj[index].reject){
				reject.push(reqProfile(listConferenceObj[index].reject[i].studentID))
			}
			Promise.all([accept,reject].map(Promise.all,Promise)).then(data=>{
				listConferenceObj[index].accept = data[0].sort(function(a,b){return (a.grade<b.grade)?-1:1})
				listConferenceObj[index].reject = data[1].sort(function(a,b){return (a.grade<b.grade)?-1:1})
				res()
			})
		})
	})
}

function reqProfile(id){
	return new Promise (function(resolve,reject){
		$.post('post/studentProfile',{studentID:id},function(data){
			if(data.err)reject(data.err);
			data['id'] = (""+id);
			resolve(data);
		})
	})
}