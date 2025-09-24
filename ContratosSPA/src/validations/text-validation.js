const textValidation = (value) => {

    if (value.trim().length < 6) {
        return "Mínimo de 6 caracteres";
    }
    else if (value.trim().length > 150){
        return "Máximo de 150 caracteres";
    }

    return true;

}

export default textValidation;