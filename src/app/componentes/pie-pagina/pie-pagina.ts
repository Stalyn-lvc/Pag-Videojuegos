import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Empresa } from '../../modelos/Empresa';
import { EmpresaServicio } from '../../servicios/empresa-servicio';

@Component({
  selector: 'app-pie-pagina',
  imports: [CommonModule],
  templateUrl: './pie-pagina.html',
  styleUrl: './pie-pagina.css'
})
export class PiePagina implements OnInit {
  empresa?: Empresa;
  currentYear: number = new Date().getFullYear();
  redes: any[] = [];

  constructor(private empresaServicio: EmpresaServicio) {}

  ngOnInit() {
    this.empresaServicio.getEmpresa().subscribe({
      next: (empresa) => {
        this.empresa = empresa;
        this.redes = empresa.redesSociales || [];
      },
      error: (err) => {
        console.error('Error obteniendo empresa', err);
      }
    });
  }

  // Método para verificar si hay información suficiente
  tieneInformacionBasica(): boolean {
    return !!(this.empresa?.nombre || this.empresa?.anio || this.empresa?.realizadopor);
  }
}