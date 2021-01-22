class Validador{
    telefono(telefono){
        if(telefono.length == 7){
            return true
        }
        else{
            return false
        }
    }
}

exports.Validador = Validador