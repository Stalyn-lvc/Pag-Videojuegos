import { Component } from '@angular/core';
import { Empresa } from '../../modelos/Empresa';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environment';

@Component({
  selector: 'app-banner',
  imports: [CommonModule],
  templateUrl: './banner.html',
  styleUrl: './banner.css'
})
export class Banner {
    empresa?: Empresa;
    slideIndex: number = 0;
    intervalId: any;
    public environment = environment;

    get bannersActivos() {
      return this.empresa?.banners?.filter(b => b.estaBanner === 1) || [];
    }

    getImagenUrl(url: string): string {
      // Si la URL ya es completa (empieza con http), la devuelve tal como está
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        return url;
      }
      // Si es una ruta relativa, construye la URL completa
      return url ? this.environment.urlApi + '/assets/' + url : '';
    }

    ngOnInit() {
      const empresaJson = localStorage.getItem('empresa');
      if (empresaJson) {
        this.empresa = JSON.parse(empresaJson);
      }
      this.startSlider();
    }

    startSlider(): void {
      this.intervalId = setInterval(() => {
        if (this.bannersActivos.length) {
          this.slideIndex = (this.slideIndex + 1) % this.bannersActivos.length;
        }
      }, 3000);
    }

    ngOnDestroy(): void {
      clearInterval(this.intervalId);
    }
}
