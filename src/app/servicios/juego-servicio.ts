import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Juego } from '../modelos/Juego';
import { environment } from '../../environment';

@Injectable({ providedIn: 'root' })
export class JuegoServicio {
    private apiUrl = `${environment.urlApi}/juego`;

    constructor(private http: HttpClient) {}

    getJuegos(): Observable<Juego[]> {
        return this.http.get<Juego[]>(this.apiUrl);
    }

    getJuego(id: number): Observable<Juego> {
        return this.http.get<Juego>(`${this.apiUrl}/${id}`);
    }

    crearJuego(juego: Juego): Observable<Juego> {
        return this.http.post<Juego>(this.apiUrl, juego);
    }

    actualizarJuego(juego: Juego): Observable<Juego> {
        return this.http.put<Juego>(`${this.apiUrl}/${juego.secuencial}`, juego);
    }

    eliminarJuego(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    // Sugerencias de juegos por nombre (autocompletado)
    sugerenciasNombre(nombre: string): Observable<Juego[]> {
        return this.http.get<Juego[]>(`${this.apiUrl}/sugerencias`, { params: { nombre } });
    }

    // Buscar juegos por género
    buscarPorGenero(genero: string): Observable<Juego[]> {
        return this.http.get<Juego[]>(`${this.apiUrl}/buscar`, { params: { genero } });
    }

    // Buscar juegos por rango de precio
    buscarPorPrecio(min: number, max: number): Observable<Juego[]> {
        return this.http.get<Juego[]>(`${this.apiUrl}/buscar/precio`, { params: { min: min.toString(), max: max.toString() } });
    }

    // Buscar juegos por rango de ranking
    buscarPorRanking(min: number, max: number): Observable<Juego[]> {
        return this.http.get<Juego[]>(`${this.apiUrl}/buscar/ranquin`, { params: { min: min.toString(), max: max.toString() } });
    }

    // Buscar juegos por nombre exacto
    buscarPorNombre(nombre: string): Observable<Juego[]> {
        return this.http.get<Juego[]>(`${this.apiUrl}/buscar/juego`, { params: { nombre } });
    }
} 