const { pool } = require("./config");
const {
    insertUsuarioNatural, updateUsuarioNatural, deleteUsuarioNatural, readUsuario, readUsuarioLogin,
    insertPersonaContacto, updatePersonaContacto, deletePersonaContacto, readPersonaContacto,
    insertTelefono, readTelefono, updateTelefono, deleteTelefono, readCelular,
    insertTelefonoPersonaContacto, readTelefonoPersonaContacto, updateTelefonoPersonaContacto, deleteTelefonoPersonaContacto,
    readLugar
    } = require('./queries')

class Validador{
    telefono(telefono){
        if(telefono.length == 7){
            return true
        }
        else{
            return false
        }
    }
    prefijo(prefijo){
        if(prefijo.length == 4){
            return true
        }
        else{
            return false
        }
    }
    campoVacio(cadena){
        if(cadena.length > 0){
            return true
        }
        else{
            return false
        }
    }
    async existeRif(rif, tipo){
        let respuesta = new Promise((resolve, reject)=> {
            pool.query(
                'SELECT * FROM '+tipo+' WHERE rif = $1',
                [rif],
                (error, results) => {
                    if (error) {
                    reject(error)
                    }
                resolve(results.rowCount)
                }
            )
        })
        if(await respuesta == 1){
            return true
        }
        else if(await respuesta == 0){
            return false
        }
      }
    rif(rif){
        if(rif.length == 9){
            return true
        }
        else{
            return false
        }
    }
    async existeCorreo(correo, tipo){
        let respuesta = new Promise((resolve, reject)=> {
            pool.query(
                'SELECT * FROM '+tipo+' WHERE correo_electronico = $1',
                [correo],
                (error, results) => {
                  if (error) {
                    reject(error)
                    }
                resolve(results.rowCount)
                }
            )
        })
        if(await respuesta == 1){
            return true
        }
        else if(await respuesta == 0){
            return false
        }
    }
    correo(correo){
        if(correo.includes('@')){
            return true
        }
        else{
            return false
        }
    }
    tipo_cedula(tipo_cedula){
        if(tipo_cedula == 'V' || tipo_cedula == 'v' || tipo_cedula == 'E' || tipo_cedula == 'e'){
            return true
        }
        else{
            return false
        }
    }
    contrasena(contrasena){
        if(contrasena.length > 7 && contrasena.length < 10){
            return true
        }
        else{
            return false
        }
    }
    pagina_web(pagina_web){
        if(pagina_web.includes('.com')){
            return true
        }
        else{
            return false
        }
    }
    lugar(parroquia, municipio, estado){
        if(parroquia.length > 0 && municipio.length > 0 && estado.length > 0){
            return true
        }
        else{
            return false
        }
    }
    async existeLugar(lugar){
        return new Promise((resolve, reject)=> {
            pool.query('SELECT a.lugar_id FROM "LUGAR" a, "LUGAR" b, "LUGAR" c WHERE a.fk_lugar = b.lugar_id AND b.fk_lugar = c.lugar_id AND a.nombre = $1'+
                'AND b.nombre = $2 AND c.nombre = $3',
                [
                    lugar.parroquia,
                    lugar.municipio,
                    lugar.estado
                ],
                (error, results) => {
                    if (error) {
                        reject(error)
                    }
                  resolve(results.rowCount)
                }
            )
        })
    }
    async existeTelefono(telefono, prefijo, usuarioID, tipo){
        let respuesta = new Promise((resolve, reject)=>{
            pool.query('SELECT * FROM "TELEFONO" WHERE fk_'+tipo+'=$1 AND numero_telefonico=$2 AND prefijo=$3',
                [
                    usuarioID,
                    telefono,
                    prefijo
                ],
                (error, results) => {
                    if (error){
                        reject(error)
                    }
                resolve(results.rowCount)
                }
            )
        })
        if(await respuesta > 0){
            return true
        }
        else{
            return false
        }
    }
}

class ValidadorUsuario extends Validador{
    natural(usuarioNatural){
        switch(Object.keys(usuarioNatural).length){
            case 16:
                if(this.campoVacio(usuarioNatural.primer_nombre) && this.campoVacio(usuarioNatural.primer_apellido) && this.campoVacio(usuarioNatural.cedula) 
                && this.tipo_cedula(usuarioNatural.tipo_cedula) && this.contrasena(usuarioNatural.contrasena) 
                && this.correo(usuarioNatural.correo_electronico) && this.rif(usuarioNatural.rif)){
                    return true
                }
                else{
                    return false
                }
            case 14:
                if(this.campoVacio(usuarioNatural.primer_nombre) && this.campoVacio(usuarioNatural.primer_apellido) && this.contrasena(usuarioNatural.contrasena) 
                && this.correo(usuarioNatural.correo_electronico) && this.rif(usuarioNatural.rif)){
                    return true
                }
                else{
                    return false
                }
        }
    }
    Juridico(usuarioJuridico){
        if(this.campoVacio(usuarioJuridico.denominacion_comercial) && this.campoVacio(usuarioJuridico.razon_social) && 
        this.pagina_web(usuarioJuridico.pagina_web) && this.campoVacio(usuarioJuridico.capital_disponible) && this.contrasena(usuarioJuridico.contrasena)){
            return true
        }
        else{
            return false
        }
    }
    telefonos(usuarioTelefono){
        if(this.telefono(usuarioTelefono.telefono) && this.telefono(usuarioTelefono.celular) && 
        this.prefijo(usuarioTelefono.prefijo_celular) && this.prefijo(usuarioTelefono.prefijo_telefono)){
            return true
        }
        else{
            return false
        }
    }
    PersonaContacto(UsuarioPersonaContacto){
        let persona = {}
        persona['nombre'] = UsuarioPersonaContacto.persona_contacto_nombre
        persona['primer_apellido'] = UsuarioPersonaContacto.persona_contacto_primer_apellido
        persona['segundo_apellido'] = UsuarioPersonaContacto.persona_contacto_segundo_apellido
        persona['telefono'] = UsuarioPersonaContacto.persona_contacto_telefono
        persona['prefijo_telefono'] = UsuarioPersonaContacto.persona_contacto_prefijo_telefono
        persona['celular'] = UsuarioPersonaContacto.persona_contacto_celular
        persona['prefijo_celular'] = UsuarioPersonaContacto.persona_contacto_prefijo_celular
        if(this.telefonos(persona) && this.campoVacio(persona.nombre) && this.campoVacio(persona.primer_apellido)){
            return true
        }
        else{
            return false
        }
    }

}

validador = new Validador()

class Lugar{
    constructor(parroquia, municipio, estado){
        this.parroquia = parroquia
        this.municipio = municipio
        this.estado = estado
    }
    async buscarLugar(clave_lugar){
        let lugar = (await readLugar(clave_lugar))[0]
        if(Object.keys(lugar).length == 3){
            this.parroquia = lugar.parroquia
            this.municipio = lugar.municipio
            this.estado = lugar.estado
            return true
        }
        else
        {
            return false
        }
    }
}

class Login{
    constructor(correo, contrasena, tipo){
        this.correo = correo
        this.contrasena = contrasena
        this.tipo = tipo
    }
    async buscarUsuario(){
        return await readUsuario(this)
    }
}

class Telefono{
    constructor(telefono, prefijo_telefono, celular, prefijo_celular){
        this.telefono = telefono
        this.celular = celular
        this.prefijo_telefono = prefijo_telefono
        this.prefijo_celular = prefijo_celular
    }
    async buscarTelefono(usuarioID, tipo){
        let telefono = (await readTelefono(usuarioID, tipo))[0]
        if(Object.keys(telefono).length > 0){
            this.telefono = telefono.numero_telefonico
            this.prefijo_telefono = telefono.prefijo
            return true
        }
        else{
            return false
        }
    }
    async buscarCelular(usuarioID, tipo){
        let celular = (await readCelular(usuarioID, tipo))[0]
        if(Object.keys(celular).length > 0){
            this.celular = celular.numero_telefonico
            this.prefijo_celular = celular.prefijo
            return true
        }
        else{
            return false
        }
    }
    async insertarTelefono(usuarioID, tipo){
        if((await validador.existeTelefono(this.telefono, this.prefijo_telefono, usuarioID, tipo)) == 0){
            if(await insertTelefono(this.telefono, this.prefijo_telefono, usuarioID, tipo) == 1){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async insertarCelular(usuarioID, tipo){
        if((await validador.existeTelefono(this.celular, this.prefijo_celular, usuarioID, tipo)) == 0){
            if(await insertTelefono(this.celular, this.prefijo_celular, usuarioID, tipo) == 1){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async actualizarTelefono(usuarioID, tipo){
        let telefonoActual = (await readTelefono(usuarioID, tipo))[0]
        if(telefonoActual != undefined){
            if(await updateTelefono(this.telefono, this.prefijo_telefono, usuarioID, tipo, telefonoActual.prefijo) ==1){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async actualizarCelular(usuarioID, tipo){
        let celularActual = (await readCelular(usuarioID, tipo))[0]
        if(celularActual != undefined){
            if(await updateTelefono(this.celular, this.prefijo_celular, usuarioID, tipo, celularActual.prefijo) == 1){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async eliminarTelefono(usuarioID, tipo){
        if(await deleteTelefono(usuarioID, tipo) == 2){
            return true
        }
        else{
            return false
        }
    }
}

class Usuario{
    constructor(rif, correo_electronico, contrasena){
        this.rif = rif
        this.correo_electronico = correo_electronico
        this.contrasena = contrasena
    }
    async usuarioExiste(){
        return (await readUsuario(this.rif, this.tipo_usuario_tabla))[0]
    }
}

class Natural extends Usuario {
    constructor(rif, correo_electronico, contrasena, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, cedula, tipo_cedula){
        super(rif, correo_electronico, contrasena)
        this.primer_nombre = primer_nombre
        this.segundo_nombre = segundo_nombre
        this.primer_apellido = primer_apellido
        this.segundo_apellido = segundo_apellido
        this.cedula = cedula
        this.tipo_cedula = tipo_cedula
        this.tipo_usuario_tabla = '\"NATURAL\"'
        this.tipo_usuario = 'natural'
        this.lugar
        this.telefono
    }
    async usuarioExiste(){
        let usuario = await super.usuarioExiste()
        if(Object.keys(usuario).length == 10){
            this.primer_nombre = usuario.primer_nombre
            this.segundo_nombre = usuario.segundo_nombre
            this.primer_apellido = usuario.primer_apellido
            this.segundo_apellido = usuario.segundo_apellido
            this.cedula = usuario.cedula_identidad
            this.tipo_cedula = usuario.tipo_cedula
            this.correo_electronico = usuario.correo_electronico
            this.contrasena = usuario.contrasena
            this.lugar = new Lugar()
            this.telefono = new Telefono()
            if((await this.lugar.buscarLugar(usuario.fk_lugar)) && (await this.telefono.buscarTelefono(this.rif, this.tipo_usuario) &&
            (await this.telefono.buscarCelular(this.rif, this.tipo_usuario)))){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async insertarUsuario(){
        if (this != undefined && !(await validador.existeCorreo(this.correo_electronico, this.tipo_usuario_tabla)) && 
        !(await validador.existeRif(this.rif, this.tipo_usuario_tabla)) && (await validador.existeLugar(this.lugar)>0)){
            if(await insertUsuarioNatural(this) == 1){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async actualizarUsuario(){
        if (this != undefined && (await validador.existeRif(this.rif, this.tipo_usuario_tabla)) && (await validador.existeLugar(this.lugar) > 0)){
            let usuario = (await readUsuario(this.rif, this.tipo_usuario_tabla))[0]
            if(usuario.correo_electronico == this.correo_electronico){
                if(await updateUsuarioNatural(this) == 1){
                    return true
                }
                else{
                    return false
                }
            }
            else if (!(await validador.existeCorreo(this.correo_electronico, this.tipo_usuario_tabla))){
                if(await updateUsuarioNatural(this) == 1){
                    return true
                }
                else{
                    return false
                }
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async eliminarUsuario(){
        if (this != undefined && (await validador.existeRif(this.rif, this.tipo_usuario_tabla))){
            if(await deleteUsuarioNatural(this) == 1){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
}

class Juridico extends Usuario{
    constructor(rif, correo_electronico, contrasena, denominacion_comercial, razon_social, pagina_web, capital_disponible){
            super(rif, correo_electronico, contrasena)
            this.denominacion_comercial = denominacion_comercial
            this.razon_social = razon_social
            this.pagina_web = pagina_web
            this.capital_disponible = capital_disponible
            this.tipo_usuario_tabla = '\"JURIDICO\"'
            this.tipo_usuario = 'juridico'
            this.lugar
            this.telefono
            this.persona_contacto
    }

    async usuarioExiste(){
        let usuario = await super.usuarioExiste()
        if(Object.keys(usuario).length == 8){
            this.denominacion_comercial = usuario.denominacion_comercial
            this.correo_electronico = usuario.correo_electronico
            this.contrasena = usuario.contrasena
            this.razon_social = usuario.razon_social
            this.pagina_web = usuario.pagina_web
            this.capital_disponible = usuario.capital_disponible
            this.lugar = new Lugar()
            this.telefono = new Telefono()
            this.persona_contacto = new PersonaContacto()
            if((await this.lugar.buscarLugar(usuario.fk_lugar)) && (await this.telefono.buscarTelefono(this.rif, this.tipo_usuario) &&
            (await this.telefono.buscarCelular(this.rif, this.tipo_usuario)) && ( await this.persona_contacto.personaExiste(this.rif)))){
               return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
    async insertarUsuario(){
        if (this != undefined && !(await validador.existeCorreo(this.correo_electronico, this.tipo_usuario_tabla)) && 
        !(await validador.existeRif(this.rif, this.tipo_usuario_tabla)) && (await validador.existeLugar(this.lugar)>0)){

        }
    }
}

class PersonaContacto{
    constructor(nombre, primer_apellido,segundo_apellido){
            this.id
            this.nombre = nombre
            this.primer_apellido = primer_apellido
            this.segundo_apellido = segundo_apellido
            this.tipo_usuario = 'persona_contacto'
            this.telefono
        }
    async personaExiste(rif_juridico){
        let usuario = (await readPersonaContacto(rif_juridico))[0]
        if(Object.keys(usuario).length == 5){
            this.nombre = usuario.nombre
            this.primer_apellido = usuario.primer_apellido
            this.segundo_apellido = usuario.segundo_apellido
            this.id = usuario.persona_id
            this.telefono = new Telefono()
            if((await this.telefono.buscarTelefono(this.id, this.tipo_usuario)) && (await this.telefono.buscarCelular(this.id, this.tipo_usuario))){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }
}

class Empleado extends Natural{
    constructor(rif, correo_electronico, contrasena, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, cedula, tipo_cedula, fecha_ingreso, fecha_egreso){
        super(rif, correo_electronico, contrasena, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, cedula, tipo_cedula)
        this.fecha_ingreso = fecha_ingreso
        this.fecha_egreso = fecha_egreso
    }
}

exports.ValidadorUsuario = ValidadorUsuario
exports.Empleado = Empleado
exports.Natural = Natural
exports.Lugar = Lugar
exports.Telefono = Telefono
exports.Login = Login
exports.Juridico = Juridico