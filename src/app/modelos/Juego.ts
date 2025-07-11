export interface Juego {
    secuencial: number;
    nombre: string;
    descripcion: string;
    genero: string;
    precio: number;
    ranquin: number;
    estadoJuego: number;
    juegoImagens: { url: string }[];
    sliderIndex?: number;
} 