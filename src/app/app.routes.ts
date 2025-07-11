import { Routes } from '@angular/router';
import { Inicio } from './paginas/inicio/inicio';
import { Noticias } from './paginas/noticias/noticias';
import { Contactos } from './paginas/contactos/contactos';
import { LoginComponent } from './login/login-component/login-component';
import { DashboardComponent } from './admin/dashboard-component/dashboard-component';

import { AuthGuard } from './admin/auth.module';
import { EmpresaComponent } from './admin/empresa-component/empresa-component';
import { NoticiaComponent } from './admin/noticia-component/noticia-component';
import { UsuarioComponent } from './admin/usuario-component/usuario-component';
import { JuegosComponent } from './paginas/juegos/juegos';
import { JuegoComponent } from './admin/juego-component/juego-component';

export const routes: Routes = [
    {path:'', component:Inicio},
    {path:'noticias',component:Noticias},
    {path:'juegos',component:JuegosComponent},
    {path:'contactos',component:Contactos},
    {path:'login',component:LoginComponent},
    {
    path: 'admin',
    component: DashboardComponent,
    canActivate: [AuthGuard], // proteger con AuthGuard
    children: [
      { path: 'empresa', component: EmpresaComponent },
      { path: 'usuario', component: UsuarioComponent },
      { path: 'noticia', component: NoticiaComponent },
      { path: 'juego', component: JuegoComponent }
    ]
  }
];
