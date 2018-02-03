async function verify(id,pwd){
    let v = await $.post('post/v1/verifyRegisUser',{
        id:id,
        pwd:CryptoJS.SHA3(pwd)
    })
    if(!v.verified) alert('Authorize failed')
    else location.reload()
}

$(documen).ready(function(){
    $('#btn').click(function(){
        verify(parseInt($('#id').val() , $('#pwd').val()))
    })
})