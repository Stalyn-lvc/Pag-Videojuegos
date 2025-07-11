import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-component',
   standalone: true,
  imports: [FormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  constructor(private authService: AuthService, private router: Router) {}
  iniciarSesion() {
    this.authService.login(this.username, this.password).subscribe(res => {
      const token = res.token;
      const decoded = decodeToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('exp', (decoded.exp * 1000).toString());
      localStorage.setItem('tipoUsuario', decoded.tipoUsuario);
      
      this.router.navigate(['/admin']);
    });
  }
  
}
function decodeToken(token: string): any {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
}