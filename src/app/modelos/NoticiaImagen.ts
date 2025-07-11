import { Noticia } from "./Noticias";

export interface NoticiaImagen{
    secuencial:number;
    url:string;
    estadoImagen:number;
    noticia:Noticia;
}