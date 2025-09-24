const emailValidation=(value)=>{
    if (value.trim().length===0){
        return 'Por favor, informe o email.';
    }
    else if (!/^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/.test(value)){
        return 'Por favor, informe um endereço de email válido.'
    }
    return true;
}

export default emailValidation;