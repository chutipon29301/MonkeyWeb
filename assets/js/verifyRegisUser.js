async function verify(id,pwd){
    let v = await $.post('post/v1/verifyRegisUser',{
        id:id,
        pwd:CryptoJS.SHA3(pwd)
    })
    if(!v.verified) alert('Authorize failed')
    else {
        writeCookie('vid',id)
        writeCookie('vpw',pwd)
        location.reload()
    }
}

$(documen).ready(function(){
    $('#btn').click(function(){
        verify(parseInt($('#id').val() , $('#pwd').val()))
    })
})