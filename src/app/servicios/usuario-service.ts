import { Injectable } from '@angular/core';
import { environment } from '../../environment';
import { Observable } from 'rxjs';
import { Usuario } from '../modelos/Usuario';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TipoUsuario } from '../modelos/TipoUsuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.urlApi}/usuarios`;
  constructor(private http: HttpClient) {}
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('🔑 Token obtenido del localStorage:', !!token);
    if (token) {
      console.log('🔑 Token (primeros 50 caracteres):', token.substring(0, 50) + '...');
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    console.log('🔑 Headers creados:', headers);
    return headers;
  }
  getUsuarios(): Observable<Usuario[]> {
    const headers = this.getAuthHeaders();
    console.log('🌐 URL del API usuarios:', this.apiUrl);
    console.log('🔑 Headers de autorización:', headers);
    
    // Intentar primero con headers de autorización
    return this.http.get<Usuario[]>(this.apiUrl, { headers });
  }

  getUsuarioById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  crearUsuario(usuario: Usuario): Observable<Usuario> {
    const headers = this.getAuthHeaders();
    console.log('🌐 Creando usuario en URL:', this.apiUrl);
    console.log('📤 Datos a enviar:', usuario);
    console.log('🔑 Headers:', headers);
    return this.http.post<Usuario>(this.apiUrl, usuario, { headers });
  }

  actualizarUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${usuario.secuencial}`, usuario, { headers: this.getAuthHeaders() });
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  getTiposUsuario(): Observable<TipoUsuario[]> {
    return this.http.get<TipoUsuario[]>(`${environment.urlApi}/tiposUsuario`, { headers: this.getAuthHeaders() });
  }
}