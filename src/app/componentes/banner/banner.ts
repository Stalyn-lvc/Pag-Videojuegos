import { Component } from '@angular/core';
import { Empresa } from '../../modelos/Empresa';
import { CommonModule } from '@angular/common';

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
      ngOnInit() {
        const empresaJson = localStorage.getItem('empresa');
        if (empresaJson) {
          this.empresa = JSON.parse(empresaJson);

        }
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
