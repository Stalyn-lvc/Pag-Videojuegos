import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Empresa } from '../../modelos/Empresa';

@Component({
  selector: 'app-pie-pagina',
  imports: [CommonModule],
  templateUrl: './pie-pagina.html',
  styleUrl: './pie-pagina.css'
})
export class PiePagina implements OnInit {
  empresa?: Empresa;
  currentYear: number = new Date().getFullYear();

  redesSociales = {
    facebook: "https://facebook.com/miempresa",
    twitter: "https://twitter.com/miempresa",
    instagram: "https://instagram.com/miempresa",
    linkedin: "https://linkedin.com/company/miempresa",
    youtube: "https://youtube.com/@miempresa",
    whatsapp: "593987654321"
  };

  ngOnInit() {
    this.cargarEmpresa();
  }

  private cargarEmpresa() {
    const empresaJson = localStorage.getItem('empresa');
    if (empresaJson) {
      try {
        this.empresa = JSON.parse(empresaJson);
        console.log('Empresa cargada en pie de página:', this.empresa);
      } catch (error) {
        console.error('Error al cargar empresa en pie de página:', error);
        this.empresa = undefined;
      }
    } else {
      console.log('No hay datos de empresa en localStorage');
      this.empresa = undefined;
    }
  }

  // Método para recargar información si es necesario
  recargarEmpresa(): void {
    this.cargarEmpresa();
  }

  // Método para verificar si hay información suficiente
  tieneInformacionBasica(): boolean {
    return !!(this.empresa?.nombre || this.empresa?.anio || this.empresa?.realizadopor);
  }
}