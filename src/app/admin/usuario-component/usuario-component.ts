import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Usuario } from '../../modelos/Usuario';
import { UsuarioService } from '../../servicios/usuario-service';

@Component({
  selector: 'app-usuario-component',
  imports: [CommonModule, FormsModule,ReactiveFormsModule],
  templateUrl: './usuario-component.html',
  styleUrl: './usuario-component.css'
})
export class UsuarioComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuarioSeleccionado: Usuario = this.getUsuarioVacio();
  editando: boolean = false;
  tiposUsuario = [
    { secuencial: 1, nombre: 'admin' },
    { secuencial: 2, nombre: 'usuario' }
  ];

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe(data => this.usuarios = data);
  }

  seleccionarUsuario(usuario: Usuario): void {
    this.usuarioSeleccionado = { ...usuario };
    this.editando = true;
  }

  guardarUsuario(): void {
    if (this.editando) {
      this.usuarioService.actualizarUsuario(this.usuarioSeleccionado).subscribe(() => {
        this.cargarUsuarios();
        this.resetFormulario();
      });
    } else {
      this.usuarioService.crearUsuario(this.usuarioSeleccionado).subscribe(() => {
        this.cargarUsuarios();
        this.resetFormulario();
      });
    }
  }

  resetFormulario(): void {
    this.usuarioSeleccionado = this.getUsuarioVacio();
    this.editando = false;
  }

  private getUsuarioVacio(): Usuario {
    return {
      secuencial: 0,
      nombre: '',
      apellido: '',
      telefono: '',
      username: '',
      password: '',
      estaActivo: 1,
      tipoUsuario: {
        secuencial: 0,
        nombre: ''
      }
    };
  }
}
