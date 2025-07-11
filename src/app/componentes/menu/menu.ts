import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../servicios/auth-service';
import { NgIf, AsyncPipe } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { ContadorTokenComponent } from "../../ContadorTokenComponent";

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [NgIf, AsyncPipe, RouterModule, ContadorTokenComponent],
  templateUrl: './menu.html',
  styleUrls: ['./menu.css']
})
export class MenuComponent implements OnInit {
  isLoggedIn$!: Observable<boolean>;
  tipoUsuario: string = '';
  private tipoUsuarioSub?: Subscription;

  constructor(private authService: AuthService, private router: Router) {
    this.isLoggedIn$ = this.authService.authStatus();
  }

  ngOnInit(): void {
    // Nos suscribimos para mantener actualizado el tipoUsuario
    this.tipoUsuarioSub = this.authService.getTipoUsuario().subscribe(tipo => {
      this.tipoUsuario = tipo;
      console.log('Tipo de usuario actualizado:', tipo);
    });
  }

  ngOnDestroy(): void {
    // Importante limpiar la suscripción para evitar memory leaks
    this.tipoUsuarioSub?.unsubscribe();
  }

  get username(): string {
    return this.authService.getUsername();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
