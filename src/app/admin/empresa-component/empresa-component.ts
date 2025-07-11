import { Component, OnInit } from '@angular/core';
import { Empresa } from '../../modelos/Empresa';
import { EmpresaServicio } from '../../servicios/empresa-servicio';
import { Banner } from '../../modelos/Banner';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empresa-component',
  standalone: true,
  imports: [CommonModule, FormsModule], // SOLO estos módulos
  templateUrl: './empresa-component.html',
  styleUrls: ['./empresa-component.css']
})
export class EmpresaComponent implements OnInit {
  empresa: Empresa = {
    secuencial: 0,
    nombre: '',
    logo: '',
    mision: '',
    vision: '',
    anio:'',
    realizadopor:'',
    banners: []
  };

  constructor(private empresaService: EmpresaServicio) {}

  ngOnInit(): void {
    this.empresaService.getEmpresa().subscribe({
      next: (data) => {
        this.empresa = data;
        if (!this.empresa.banners) {
          this.empresa.banners = [];
        }
      },
      error: (err) => console.error(err)
    });
  }

  // Añadir un nuevo banner vacío para editar
  agregarBanner() {
    if (!this.empresa.banners) {
      this.empresa.banners = [];
    }
    const nuevoBanner: Banner = {
      secuencial: 0,
      url: '',
      descripcion: '',
      estaBanner: 0,
      empresa: this.empresa
    };
    this.empresa.banners.push(nuevoBanner);
  }

  quitarBanner(index: number) {
    if (this.empresa.banners) {
      this.empresa.banners.splice(index, 1);
    }
  }

  // Guardar cambios a la empresa
  guardarCambios(): void {
    const empresaLimpia: Empresa = {
      ...this.empresa,
          banners: this.empresa.banners?.map(b => ({
        ...b,
        empresa: undefined as unknown as Empresa  // forzamos el tipo
      })) || []
    };
    console.log(empresaLimpia)
    this.empresaService.updateEmpresa(empresaLimpia).subscribe({
      next: (resp) => {
        console.log('Empresa actualizada:', resp);
        alert('Datos guardados con éxito');
        localStorage.setItem('empresa', JSON.stringify(resp));
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        alert('Error al guardar los datos');
      }
    });
  }
}
