import { TipoUsuario } from "./TipoUsuario";

export interface Usuario{
    secuencial:number;
    nombre:string;
    apellido:string;
    telefono:string;
    username:string;
    password:string;
    estaActivo:number;
    tipoUsuario:TipoUsuario;
}