const { pool } = require("./config");
const {
    insertUsuarioNatural, updateUsuarioNatural, deleteUsuarioNatural, readUsuario, readUsuarioLogin,
    insertPersonaContacto, updatePersonaContacto, deletePersonaContacto, readPersonaContacto,
    insertUsuarioJuridico, updateUsuarioJuridico, deleteUsuarioJuridico,
    insertUsuarioEmpleado, updateUsuarioEmpleado, deleteUsuarioEmpleado,
    insertTelefono, readTelefono, updateTelefono, deleteTelefono, readCelular,
    insertEmpleadoHorario, deleteEmpleadoHorario, readEmpleadoHorario,
    readHorario, readHorarioSinId,
    readTarjeta, insertTarjeta, deleteTarjeta,
    insertProveedor, deleteProveedor,
    readLugar
    } = require('./queries')

class Validador{
    hora(horario){
        const rangoHora = /^([1][0-9]|[0][9]|2[0-1]):(00)$/
        if(horario.match(rangoHora) != undefined){
            return true
        }
        else{
            return false
        }
       }
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
                && this.correo(usuarioNatural.correo_Empleadonico) && this.rif(usuarioNatural.rif)){
                    return true
                }
                else{
                    return false
                }
        }
    }
    Empleado(usuarioEmpleado){
        switch(Object.keys(usuarioEmpleado).length){
            case 17:
                if(this.campoVacio(usuarioEmpleado.primer_nombre) && this.campoVacio(usuarioEmpleado.primer_apellido) && this.campoVacio(usuarioEmpleado.cedula) 
                && this.tipo_cedula(usuarioEmpleado.tipo_cedula) && this.contrasena(usuarioEmpleado.contrasena) 
                && this.correo(usuarioEmpleado.correo_electronico) && this.rif(usuarioEmpleado.rif)){
                    return true
                }
                else{
                    return false
                }
            case 15:
                if(this.campoVacio(usuarioEmpleado.primer_nombre) && this.campoVacio(usuarioEmpleado.primer_apellido) && this.contrasena(usuarioEmpleado.contrasena) 
                && this.correo(usuarioEmpleado.correo_electronico) && this.rif(usuarioEmpleado.rif)){
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

class Contenedor{
    constructor(rif){
        this.rif = rif
        this.contenedor = []
    }
    async buscarHorarioEmpleado(){
        let horario = await readEmpleadoHorario(this.rif)
        if(horario != null && horario != undefined && Object.keys(horario).length != 0){
            for(var i=0; i<Object.keys(horario).length; i++){
                this.contenedor.push(await (new Horario(horario[i].fk_horario)).buscarHorario())
            }
            return true
        }
        else{
            return false
        }
    }
    async ordenarHorario(horario){
        var obj = JSON.parse(horario)
        if(Object.keys(obj).length > 0){
            for(let i=0; i<Object.keys(obj).length; i++){
                if(validador.hora(obj[i].hora_inicio) && validador.hora(obj[i].hora_fin)){
                    this.contenedor.push(await (new Horario('', obj[i].dia, obj[i].hora_inicio, obj[i].hora_fin,)).buscarHorarioSinId())
                }
            }
            return true
        }
        else{
            return false
        }
    }
}

class Horario{
    constructor(id, dia, hora_inicio, hora_fin){
        this.id = id
        this.dia = dia
        this.hora_inicio = hora_inicio
        this.hora_fin = hora_fin
    }
    async buscarHorario(){
        let horaRegistrada = (await readHorario(this.id))[0]
        this.dia = horaRegistrada.dia
        this.hora_inicio = horaRegistrada.hora_inicio
        this.hora_fin = horaRegistrada.hora_fin
        return this
    }

    async buscarHorarioSinId(){
        let horaRegistrada = (await readHorarioSinId(this))[0]
        this.id = horaRegistrada.horario_id
        return this
    }

    async insertarEmpleadoHorario(rif, horarios){
        if(horarios.length > 0){
            var contador = 0
            for(var i=0; i<horarios.length;i++){
                contador+=(await insertEmpleadoHorario(rif, horarios[i].id))                  
            }
            if(contador == horarios.length){
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

    async actualizarHorario(rif, horarios){
        if((await readEmpleadoHorario(rif)).length > 0){
            if(this.eliminarHorario(rif)){
                if(this.insertarEmpleadoHorario(rif, horarios)){
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

    async eliminarHorario(rif){
        if(await deleteEmpleadoHorario(rif) > 0){
            return true
        }
        else{
            return false
        }
    }
}

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
            this.rubro
    }
    async usuarioExiste(){
        let usuario = await super.usuarioExiste()
        if(Object.keys(usuario).length == 9){
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
            if(await insertUsuarioJuridico(this) == 1){
                return true
            }
            else{
                return false
            }
        }
    }
    async actualizarUsuario(){
        if (this != undefined && (await validador.existeRif(this.rif, this.tipo_usuario_tabla)) && (await validador.existeLugar(this.lugar) > 0)){
            let usuario = (await readUsuario(this.rif, this.tipo_usuario_tabla))[0]
            if(usuario.correo_electronico == this.correo_electronico){
                if(await updateUsuarioJuridico(this) == 1){
                    return true
                }
                else{
                    return false
                }
            }
            else if (!(await validador.existeCorreo(this.correo_electronico, this.tipo_usuario_tabla))){
                if(await updateUsuarioJuridico(this) == 1){
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
            if(await deleteUsuarioJuridico(this) == 1){
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
    async insertarProveedor(){
        if(this.rubro != null && this.rubro != undefined && this.rubro != ''){
            if(await insertProveedor(this) == 1){
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
    async eliminarProveedor(){
        if(await deleteProveedor(this) == 1){
            return true
        }
        else{
            return false
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
    async idPersona(rif_juridico){
        this.id = (await readPersonaContacto(rif_juridico))[0].persona_id
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
    async insertarPersonaContacto(rif_juridico){
        let UsuarioPersonaContacto = (await readPersonaContacto(rif_juridico))[0]
        if(UsuarioPersonaContacto == undefined || UsuarioPersonaContacto == null){
            if(await insertPersonaContacto(this, rif_juridico) == 1){
                await this.idPersona(rif_juridico)
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
    async actualizarPersonaContacto(rif_juridico){
        if (this != undefined){
            let personaContacto = (await readPersonaContacto(rif_juridico))[0]
            if(Object.keys(personaContacto).length == 5){
                this.idPersona(rif_juridico)
                if(await updatePersonaContacto(this, rif_juridico) == 1){
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
    async eliminarPersonaContacto(rif_juridico){
        if (this != undefined){
            if(await deletePersonaContacto(rif_juridico) == 1){
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

class Empleado extends Usuario{
    constructor(rif, correo_electronico, contrasena, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, cedula, tipo_cedula){
        super(rif, correo_electronico, contrasena)
        this.primer_nombre = primer_nombre
        this.segundo_nombre = segundo_nombre
        this.primer_apellido = primer_apellido
        this.segundo_apellido = segundo_apellido
        this.cedula = cedula
        this.tipo_cedula = tipo_cedula
        this.fecha_ingreso
        this.fecha_egreso
        this.tipo_usuario = 'empleado'
        this.tipo_usuario_tabla = '\"EMPLEADO\"'
        this.lugar
        this.telefono
        this.horario
    }
    async usuarioExiste(){
        let usuario = await super.usuarioExiste()
        if(Object.keys(usuario).length == 13){
            this.primer_nombre = usuario.primer_nombre
            this.segundo_nombre = usuario.segundo_nombre
            this.primer_apellido = usuario.primer_apellido
            this.segundo_apellido = usuario.segundo_apellido
            this.cedula = usuario.cedula_identidad
            this.tipo_cedula = usuario.tipo_cedula
            this.correo_electronico = usuario.correo_electronico
            this.contrasena = usuario.contrasena
            this.fecha_ingreso = usuario.fecha_ingreso
            this.fecha_egreso = usuario.fecha_egreso
            this.lugar = new Lugar()
            this.telefono = new Telefono()
            this.horario = []
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
            if(await insertUsuarioEmpleado(this) == 1){
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
                if(await updateUsuarioEmpleado(this) == 1){
                    return true
                }
                else{
                    return false
                }
            }
            else if (!(await validador.existeCorreo(this.correo_electronico, this.tipo_usuario_tabla))){
                if(await updateUsuarioEmpleado(this) == 1){
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
            if(await deleteUsuarioEmpleado(this) == 1){
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

class TipoPago{
    constructor(fecha){
        this.fecha = fecha
    }
}

class Tarjeta extends TipoPago{
    constructor(fecha, numero_tarjeta, empresa, mes_caducidad, anho_caducidad, nombre_tarjeta, tipo){
        super(fecha)
        this.numero_tarjeta = numero_tarjeta
        this.empresa = empresa
        this.mes_caducidad = mes_caducidad
        this.anho_caducidad = anho_caducidad
        this.nombre_tarjeta = nombre_tarjeta
        this.tipo = tipo
    }
    async insertarTarjeta(rif, tipo){
        if(await insertTarjeta(this, rif, tipo) == 1){
            return true
        }
        else{
            return false
        }
    }
    async eliminarTarjeta(rif, tipo){
        if(await deleteTarjeta(rif, tipo) == 1){
            return true
        }
        else{
            return false
        }
    }
    async actualizarTarjeta(rif, tipo){
        if(await eliminarTarjeta(rif, tipo)){
            if(await this.insertarTarjeta(rif, tipo)){
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

class Cheque extends TipoPago{
    constructor(fecha, numero_confirmacion, nombre_banco){
        super(fecha)
        this.numero_confirmacion = numero_confirmacion
        this.nombre_banco = nombre_banco
    }
}

class Canje extends TipoPago{
    constructor(fecha, cantidad, cambio){
        super(fecha)
        this.cantidad = cantidad
        this.cambio = cambio
    }
}

class Moneda extends TipoPago{
    constructor(fecha, tipo, cambio){
        super(fecha)
        this.tipo = tipo
        this.cambio = cambio
    }
}

class Punto{
    constructor(cantidad){
        cantidad = cantidad
    }
}

class Operacion{
    constructor(condiciones, fecha_orden, monto_total, fecha_entrega){
        this.condiciones = condiciones
        this.fecha_orden = fecha_orden
        this.monto_total = monto_total
        this.fecha_entrega = fecha_entrega
    }
}

exports.ValidadorUsuario = ValidadorUsuario
exports.Empleado = Empleado
exports.Natural = Natural
exports.Lugar = Lugar
exports.Telefono = Telefono
exports.Login = Login
exports.Juridico = Juridico
exports.PersonaContacto = PersonaContacto
exports.Contenedor = Contenedor
exports.Horario = Horario