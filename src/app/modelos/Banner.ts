import { Empresa } from "./Empresa";

export interface Banner{
    secuencial:number;
    url:string;
    descripcion:string;
    estaBanner:number;
    empresa:Empresa;
}