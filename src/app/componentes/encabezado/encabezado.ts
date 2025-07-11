import { Component, OnInit } from '@angular/core';
import { Empresa } from '../../modelos/Empresa';
import { EmpresaServicio } from '../../servicios/empresa-servicio';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-encabezado',
  imports: [CommonModule],
  templateUrl: './encabezado.html',
  styleUrl: './encabezado.css'
})
export class Encabezado implements OnInit {
  empresa?: Empresa;

  constructor(
    private empresaServicio: EmpresaServicio,
    private router: Router
  ) { }

  goToHome() {
    this.router.navigate(['/']);
  }

  ngOnInit() {
    this.cargarEmpresa();
  }

  cargarEmpresa() {
    this.empresaServicio.getEmpresa().subscribe({
      next: (data) => {
        this.empresa = data;
        // Guardar en localStorage para uso posterior si es necesario
        localStorage.setItem('empresa', JSON.stringify(data));
      },
      error: (error) => {
        console.error('Error al cargar la empresa:', error);
        // Intentar cargar desde localStorage como fallback
        const empresaJson = localStorage.getItem('empresa');
        if (empresaJson) {
          this.empresa = JSON.parse(empresaJson);
        }
      }
    });
  }
}
