import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../modelos/Usuario';
import { TipoUsuario } from '../../modelos/TipoUsuario';
import { UsuarioService } from '../../servicios/usuario-service';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-component',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard-component.html',
  styleUrls: ['./dashboard-component.css']
})
export class DashboardComponent implements OnInit {
  usuarios: Usuario[] = [];
  tiposUsuario: TipoUsuario[] = [];
  mostrarModalUsuario = false;
  nuevoUsuario: any = {};

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarTiposUsuario();
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe(data => {
      this.usuarios = data;
    });
  }

  cargarTiposUsuario() {
    this.usuarioService.getTiposUsuario().subscribe(data => {
      this.tiposUsuario = data;
    });
  }

  abrirModalUsuario() {
    this.nuevoUsuario = {};
    this.mostrarModalUsuario = true;
  }

  cerrarModalUsuario() {
    this.mostrarModalUsuario = false;
  }

  crearUsuario() {
    if (!this.nuevoUsuario || !this.nuevoUsuario.tipoUsuario) return;
    this.usuarioService.crearUsuario(this.nuevoUsuario).subscribe(() => {
      this.usuarioCreado();
    });
  }

  usuarioCreado() {
    this.cerrarModalUsuario();
    this.cargarUsuarios();
  }
}
