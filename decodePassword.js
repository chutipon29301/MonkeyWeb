const CryptoJS = require('crypto-js')

for(let i = 1000 ; i <10000 ; i++){
	if(CryptoJS.SHA3(''+i).toString() == "6530af54fec1dfa91a451017f127f8f8f4cd475e3b1f853695410276848f91b749d600260416c135113129fb72273522cc6c8e5c3b72909b9db56959de12f47b"){
		console.log(i)
	}
}