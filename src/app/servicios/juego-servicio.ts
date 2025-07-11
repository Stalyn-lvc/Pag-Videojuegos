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
} 