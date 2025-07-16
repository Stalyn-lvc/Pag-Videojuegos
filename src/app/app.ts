import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Empresa } from './modelos/Empresa';
import { HttpClientModule } from '@angular/common/http';
import { MenuComponent  } from './componentes/menu/menu';
import { Encabezado } from './componentes/encabezado/encabezado';
import { EmpresaServicio } from './servicios/empresa-servicio';
import { Banner } from './componentes/banner/banner';
import { PiePagina } from './componentes/pie-pagina/pie-pagina';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HttpClientModule,
    MenuComponent,
    Encabezado,
    Banner,
    PiePagina
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  protected title = 'GameVortex';
  constructor(private empresaServicio: EmpresaServicio){}
    empresa?: Empresa;
   
    ngOnInit(): void {
        this.empresaServicio.getEmpresa().subscribe(data=>{
            this.empresa=data;
            localStorage.setItem('empresa', JSON.stringify(data));
        });
        
    }
}
