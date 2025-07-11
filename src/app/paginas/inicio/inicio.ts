import { Component, OnDestroy, OnInit } from '@angular/core';
import { EmpresaServicio } from '../../servicios/empresa-servicio';
import { Empresa } from '../../modelos/Empresa';
import { CommonModule } from '@angular/common';
import { PiePagina } from '../../componentes/pie-pagina/pie-pagina';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit,OnDestroy{
  constructor(private empresaServicio: EmpresaServicio){}
  empresa?: Empresa;
  slideIndex: number = 0;
  intervalId: any;
  ngOnInit(): void {
      this.empresaServicio.getEmpresa().subscribe(data=>{
          this.empresa=data;
          localStorage.setItem('empresa', JSON.stringify(data));
      });
      this.startSlider();
  }
  startSlider(): void {
    this.intervalId = setInterval(() => {
      if (this.empresa?.banners?.length) {
        this.slideIndex = (this.slideIndex + 1) % this.empresa.banners.length;
      }
    }, 3000);
  }
  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

}
