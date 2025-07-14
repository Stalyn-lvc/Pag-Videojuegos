import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Usuario } from '../../modelos/Usuario';
import { UsuarioService } from '../../servicios/usuario-service';

@Component({
  selector: 'app-usuario-component',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuario-component.html',
  styleUrl: './usuario-component.css'
})
export class UsuarioComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuarioSeleccionado: Usuario = this.getUsuarioVacio();
  editando: boolean = false;
  modalVisible: boolean = false;
  formUsuario!: FormGroup;
  
  tiposUsuario = [
    { secuencial: 1, nombre: 'admin' },
    { secuencial: 2, nombre: 'usuario' }
  ];

  constructor(
    private usuarioService: UsuarioService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    console.log('🚀 UsuarioComponent inicializado');
    console.log('🔍 Verificando autenticación...');
    
    // Verificar token
    const token = localStorage.getItem('token');
    console.log('🔑 Token disponible:', !!token);
    if (token) {
      console.log('🔑 Token (primeros 50 caracteres):', token.substring(0, 50) + '...');
      // Decodificar el token para ver el payload
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔑 Payload del token:', payload);
      } catch (e) {
        console.log('🔑 Error al decodificar token:', e);
      }
    }
    
    this.inicializarFormulario();
    console.log('📋 Formulario inicializado');
    this.cargarUsuarios();
  }

  inicializarFormulario(): void {
    console.log('📝 Inicializando formulario reactivo...');
    this.formUsuario = this.fb.group({
      secuencial: [0],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: [''],
      username: ['', Validators.required],
      password: ['', Validators.required],
      estaActivo: [1],
      tipoUsuario: [null, Validators.required]
    });
    console.log('✅ Formulario creado:', this.formUsuario);
  }

  cargarUsuarios(): void {
    console.log('🔄 Cargando usuarios...');
    
    // Verificar si hay token
    const token = localStorage.getItem('token');
    console.log('🔑 Token disponible:', !!token);
    if (token) {
      console.log('🔑 Token (primeros 50 caracteres):', token.substring(0, 50) + '...');
    }
    
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        console.log('✅ Usuarios cargados:', data);
        console.log('📊 Cantidad de usuarios:', data.length);
        this.usuarios = data;
      },
      error: (error) => {
        console.error('❌ Error al cargar usuarios:', error);
        console.error('🔍 Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        
        // Si es error 403, verificar autenticación
        if (error.status === 403) {
          console.error('🚨 Error 403: Problema de autenticación/autorización');
          console.error('🔑 Token en localStorage:', localStorage.getItem('token'));
        }
      }
    });
  }

  abrirModal(usuario?: Usuario): void {
    console.log('🚀 Abriendo modal...', usuario ? 'Editar usuario' : 'Crear usuario');
    this.editando = !!usuario;
    if (usuario) {
      console.log('📝 Editando usuario:', usuario);
      this.formUsuario.patchValue(usuario);
    } else {
      console.log('➕ Creando nuevo usuario');
      this.formUsuario.reset({
        secuencial: 0,
        estaActivo: 1
      });
    }
    this.modalVisible = true;
    console.log('✅ Modal visible:', this.modalVisible);
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.editando = false;
    this.formUsuario.reset({
      secuencial: 0,
      estaActivo: 1
    });
  }

  guardarUsuario(): void {
    console.log('💾 Guardando usuario...');
    console.log('📋 Formulario válido:', this.formUsuario.valid);
    console.log('📋 Errores del formulario:', this.formUsuario.errors);
    console.log('📋 Estado del formulario:', this.formUsuario.status);
    
    // Verificar cada campo individualmente
    console.log('📋 Nombre válido:', this.formUsuario.get('nombre')?.valid);
    console.log('📋 Apellido válido:', this.formUsuario.get('apellido')?.valid);
    console.log('📋 Username válido:', this.formUsuario.get('username')?.valid);
    console.log('📋 Password válido:', this.formUsuario.get('password')?.valid);
    console.log('📋 TipoUsuario válido:', this.formUsuario.get('tipoUsuario')?.valid);
    
    if (this.formUsuario.invalid) {
      console.log('❌ Formulario inválido, marcando campos como tocados');
      this.formUsuario.markAllAsTouched();
      
      // Mostrar errores específicos
      Object.keys(this.formUsuario.controls).forEach(key => {
        const control = this.formUsuario.get(key);
        if (control?.invalid) {
          console.log(`❌ Error en ${key}:`, control.errors);
        }
      });
      return;
    }

    const usuarioData = this.formUsuario.value;
    console.log('📤 Datos del usuario a enviar:', usuarioData);
    console.log('📤 Tipo de operación:', this.editando ? 'Actualizar' : 'Crear');

    if (this.editando) {
      console.log('🔄 Actualizando usuario existente...');
      this.usuarioService.actualizarUsuario(usuarioData).subscribe({
        next: (response) => {
          console.log('✅ Usuario actualizado exitosamente:', response);
          this.cargarUsuarios();
          this.cerrarModal();
        },
        error: (err) => {
          console.error('❌ Error al actualizar usuario:', err);
          console.error('🔍 Detalles del error:', {
            status: err.status,
            statusText: err.statusText,
            message: err.message,
            url: err.url
          });
        }
      });
    } else {
      console.log('➕ Creando nuevo usuario...');
      this.usuarioService.crearUsuario(usuarioData).subscribe({
        next: (response) => {
          console.log('✅ Usuario creado exitosamente:', response);
          this.cargarUsuarios();
          this.cerrarModal();
        },
        error: (err) => {
          console.error('❌ Error al crear usuario:', err);
          console.error('🔍 Detalles del error:', {
            status: err.status,
            statusText: err.statusText,
            message: err.message,
            url: err.url
          });
        }
      });
    }
  }

  eliminarUsuario(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
      this.usuarioService.eliminarUsuario(id).subscribe({
        next: () => {
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error('Error al eliminar usuario:', err);
        }
      });
    }
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
