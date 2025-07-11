import { Component, OnInit } from '@angular/core';
import { Empresa } from '../../modelos/Empresa';

@Component({
  selector: 'app-pie-pagina',
  imports: [],
  templateUrl: './pie-pagina.html',
  styleUrl: './pie-pagina.css'
})
export class PiePagina  implements OnInit {
  empresa?: Empresa;

  ngOnInit() {
    const empresaJson = localStorage.getItem('empresa');
    if (empresaJson) {
      this.empresa = JSON.parse(empresaJson);
    }
  }
}
