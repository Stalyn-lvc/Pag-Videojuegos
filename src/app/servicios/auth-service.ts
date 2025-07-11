import { Injectable } from '@angular/core';
import { environment } from '../../environment';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.urlApi}/auth/login`;
  private tipoUsuario$ = new BehaviorSubject<string>(localStorage.getItem('tipoUsuario') || '');

  getTipoUsuario(): Observable<string> {
    return this.tipoUsuario$.asObservable();
  }

  getTipoUsuarioValor(): string {
    return this.tipoUsuario$.value;
  }
  private loggedIn$ = new BehaviorSubject<boolean>(this.isAuthenticated());
  constructor(private http: HttpClient) {}
  
  login(username: string, password: string): Observable<any> {
    return new Observable(observer => {
      this.http.post<any>(this.apiUrl, { username, password }).subscribe(
        res => {
          try {
            const payload = JSON.parse(atob(res.token.split('.')[1]));
            console.log('Token payload:', payload);
            
            localStorage.setItem('token', res.token);
            
            // Guardar la expiración del token JWT si está disponible
            if (payload.exp) {
              localStorage.setItem('exp', payload.exp.toString());
              console.log('Expiración guardada:', payload.exp);
            } else if (res.exp) {
              // Fallback al valor del servidor
              localStorage.setItem('exp', res.exp.toString());
              console.log('Expiración del servidor guardada:', res.exp);
            }
            
            localStorage.setItem('tipoUsuario', payload.tipoUsuario);
            this.tipoUsuario$.next(payload.tipoUsuario);
            this.loggedIn$.next(true); 
            observer.next(res);
            observer.complete();
          } catch (error) {
            console.error('Error al procesar el token:', error);
            observer.error(error);
          }
        },
        err => {
          console.error('Error en login:', err);
          observer.error(err);
        }
      );
    });
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const exp = localStorage.getItem('exp');
    
    if (!token || !exp) {
      console.log('No hay token o expiración');
      return false;
    }
    
    try {
      const now = Date.now();
      const expiration = parseInt(exp, 10);
      
      // Si la expiración está en segundos, convertir a milisegundos
      const expirationMs = expiration < 1e12 ? expiration * 1000 : expiration;
      
      const isValid = now < expirationMs;
      console.log('Verificación de autenticación:', {
        now,
        expiration,
        expirationMs,
        isValid
      });
      
      return isValid;
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      return false;
    }
  }

  authStatus(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  getUsername(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || '';
    } catch (error) {
      console.error('Error al obtener username:', error);
      return '';
    }
  }

  logout() {
    localStorage.clear();
    this.loggedIn$.next(false);
    this.tipoUsuario$.next('');
  }
}

