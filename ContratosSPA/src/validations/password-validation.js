const passwordValidation = (value) => {

    if (value.trim().length < 8){
        return 'Por favor, informe no mínimo 8 caracteres.';
    }
    else if (value.trim().length > 20) {
        return 'Por favor, informe no máximo 20 caracteres';
    }
    else if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s)(?=.*[!@H$*])/.test(value.trim())) {
        return 'Por favor, informe pelo menos 1 letra minúscula, 1 letra maiúscula, 1 número e 1 caracter especial.';
    }

    return true;

}

export default passwordValidation;