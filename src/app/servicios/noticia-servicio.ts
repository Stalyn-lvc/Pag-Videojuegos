import { Injectable } from '@angular/core';
import { Noticia } from '../modelos/Noticias';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class NoticiaServicio {
  private urlApi = `${environment.urlApi}/noticia`;

  constructor(private http: HttpClient) {}

  getNoticias(): Observable<Noticia[]> {
    return this.http.get<Noticia[]>(this.urlApi);
  }

  getNoticiaPorId(id: number): Observable<Noticia> {
    return this.http.get<Noticia>(`${this.urlApi}/${id}`);
  }

 
  crearNoticia(data: FormData): Observable<any> {
    return this.http.post(this.urlApi, data);
  }


  actualizarNoticia(id: number, noticia: Noticia): Observable<any> {
    return this.http.put(`${this.urlApi}/${id}`, noticia);
  }


  eliminarNoticia(id: number): Observable<any> {
    return this.http.delete(`${this.urlApi}/${id}`);
  }
}
