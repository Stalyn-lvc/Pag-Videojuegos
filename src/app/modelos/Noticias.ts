import { NoticiaImagen } from "./NoticiaImagen";

export interface Noticia{
    secuencial:number;
    titulo:string;
    descripcion:string;
    estadoNoticia:number; 
    noticiaImagens: { url: string }[];
    sliderIndex?: number;
}