import { Component, OnInit, OnDestroy } from '@angular/core';
import { Juego } from '../../modelos/Juego';
import { JuegoServicio } from '../../servicios/juego-servicio';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { environment } from '../../../environment';
import { CarritoService } from '../../servicios/carrito-servicio';
import { Router } from '@angular/router';

@Component({
  selector: 'app-juegos',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './juegos.html',
  styleUrls: ['./juegos.css']
})
export class JuegosComponent implements OnInit, OnDestroy {
  juegos: Juego[] = [];
  juegosPaginados: Juego[] = [];
  currentPage = 0;
  itemsPerPage = 4;

  currentJuego: Juego | null = null;
  bannerIndex = 0;
  bannerInterval: any;

  public environment = environment;

  getImagenUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return this.environment.urlApi + '/imagenes/' + url;
  }

  constructor(
    private juegoServicio: JuegoServicio,
    private carritoService: CarritoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.juegoServicio.getJuegos().subscribe(data => {
      this.juegos = data;
      this.actualizarPaginacion();
    });
  }

  ngOnDestroy(): void {
    this.stopBanner();
  }

  verJuego(juego: Juego) {
    this.currentJuego = juego;
    this.bannerIndex = 0;
    this.startBanner();
  }

  cerrarDetalle() {
    this.stopBanner();
    this.currentJuego = null;
  }

  startBanner() {
    this.stopBanner();
    const imagenes = this.currentJuego?.juegoImagens;
    if (imagenes && imagenes.length > 1) {
      this.bannerInterval = setInterval(() => {
        this.bannerIndex = (this.bannerIndex + 1) % imagenes.length;
      }, 3000);
    }
  }

  stopBanner() {
    if (this.bannerInterval) {
      clearInterval(this.bannerInterval);
      this.bannerInterval = null;
    }
  }

  actualizarPaginacion() {
    const start = this.currentPage * this.itemsPerPage;
    this.juegosPaginados = this.juegos.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.juegos.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.actualizarPaginacion();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.actualizarPaginacion();
    }
  }

  goToPage(index: number) {
    if (index >= 0 && index < this.totalPages) {
      this.currentPage = index;
      this.actualizarPaginacion();
    }
  }

  agregarAlCarrito(juego: Juego) {
    this.carritoService.addToCart({
      id: juego.secuencial,
      title: juego.nombre,
      price: juego.precio,
      quantity: 1,
      genre: juego.genero,
      rating: juego.ranquin,
      image: juego.juegoImagens?.[0]?.url
    });
    // Abrir el modal del carrito o mostrar feedback
  }
}
