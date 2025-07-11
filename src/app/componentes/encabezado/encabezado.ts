import { Component, OnInit } from '@angular/core';
import { Empresa } from '../../modelos/Empresa';

@Component({
  selector: 'app-encabezado',
  imports: [],
  templateUrl: './encabezado.html',
  styleUrl: './encabezado.css'
})
export class Encabezado implements OnInit {
  empresa?: Empresa;

  ngOnInit() {
    const empresaJson = localStorage.getItem('empresa');
    if (empresaJson) {
      this.empresa = JSON.parse(empresaJson);
    }
  }
}
