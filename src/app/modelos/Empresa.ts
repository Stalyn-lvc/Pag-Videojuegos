import { Banner } from "./Banner";

export interface Empresa{
    secuencial:number;
    nombre:string;
    logo:string;
    mision:string;
    vision:string;
    anio:string;
    realizadopor:string;
    banners?:Banner[];
}