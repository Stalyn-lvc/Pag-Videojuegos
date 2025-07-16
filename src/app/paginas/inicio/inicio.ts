import { Component, OnDestroy, OnInit } from '@angular/core';
import { EmpresaServicio } from '../../servicios/empresa-servicio';
import { Empresa } from '../../modelos/Empresa';
import { CommonModule } from '@angular/common';
import { PiePagina } from '../../componentes/pie-pagina/pie-pagina';
import { Juego } from '../../modelos/Juego';
import { JuegoServicio } from '../../servicios/juego-servicio';
import { Noticia } from '../../modelos/Noticias';
import { NoticiaServicio } from '../../servicios/noticia-servicio';
import { Router } from '@angular/router';
import { CarritoService } from '../../servicios/carrito-servicio';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit,OnDestroy{
  constructor(
    private empresaServicio: EmpresaServicio,
    private juegoServicio: JuegoServicio,
    private noticiaServicio: NoticiaServicio,
    private router: Router,
    private carritoService: CarritoService
  ){}
  empresa?: Empresa;
  slideIndex: number = 0;
  intervalId: any;

  juegosOferta: Juego[] = [];
  noticiasRecientes: Noticia[] = [];

  ngOnInit(): void {
      this.empresaServicio.getEmpresa().subscribe(data=>{
          this.empresa=data;
          localStorage.setItem('empresa', JSON.stringify(data));
      });
      this.juegoServicio.getJuegos().subscribe(juegos => {
        // Tomar los 2 juegos más baratos como "ofertas especiales"
        this.juegosOferta = [...juegos]
          .sort((a, b) => a.precio - b.precio)
          .slice(0, 2);
      });
      this.noticiaServicio.getNoticias().subscribe(noticias => {
        // Tomar solo la noticia más reciente
        this.noticiasRecientes = [...noticias]
          .sort((a, b) => b.secuencial - a.secuencial)
          .slice(0, 1);
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
  verJuego(juego: Juego) {
    this.router.navigate(['/juegos'], { queryParams: { id: juego.secuencial } });
  }
  verNoticia(noticia: Noticia) {
    this.router.navigate(['/noticias'], { queryParams: { id: noticia.secuencial } });
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
    // Aquí podrías abrir el modal del carrito o mostrar feedback
  }
  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

}
