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
          const payload = JSON.parse(atob(res.token.split('.')[1]));
          localStorage.setItem('token', res.token);
          localStorage.setItem('exp', res.exp);
          localStorage.setItem('tipoUsuario', payload.tipoUsuario);
          this.tipoUsuario$.next(payload.tipoUsuario);
          this.loggedIn$.next(true); 
          observer.next(res);
          observer.complete();
        },
        err => {
          console.error('Error en login:', err); // <-- Aquí verás el detalle del error en la consola
          observer.error(err);
        }
      );
    });
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const exp = localStorage.getItem('exp');
    if (!token || !exp) return false;
    const now = Date.now();
    const expiration = parseInt(exp, 10);
    return now < expiration;
  }

  authStatus(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  getUsername(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || '';
  }

  logout() {
    localStorage.clear();
    this.loggedIn$.next(false);
    this.tipoUsuario$.next('');
  }
}

