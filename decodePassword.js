const CryptoJS = require('crypto-js')

for(let i = 1000 ; i <10000 ; i++){
	if(CryptoJS.SHA3(''+i).toString() == "a518259d2590be2477f79945c4bd4ad3af23a7ab6453cced0f3caae032b66bb7b7f78c59441a25e06bcf95440806e9bff14c7a9aa3f6a3666e3a149b57195f1d"){
		console.log(i)
	}
}