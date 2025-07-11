import { Component, OnInit, OnDestroy } from '@angular/core';
import { Noticia } from '../../modelos/Noticias';
import { NoticiaServicio } from '../../servicios/noticia-servicio';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({  
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './noticias.html',
  styleUrls: ['./noticias.css']  // corregí el nombre a plural styleUrls
})
export class Noticias implements OnInit, OnDestroy {
  noticias: Noticia[] = [];
  currentPage = 0;
  itemsPerPage = 4;
  noticiasPaginadas: Noticia[] = [];
  currentNoticia: Noticia | null = null;

  bannerIndex = 0;
  bannerInterval: any;

  constructor(private noticiaService: NoticiaServicio) {}

  ngOnInit(): void {
    this.noticiaService.getNoticias().subscribe(data => {
      this.noticias = data;
      this.actualizarPaginacion();
    });
  }

  ngOnDestroy(): void {
    this.stopBanner();
  }

  // Llama esta función cuando asignas currentNoticia para reiniciar el banner
  iniciarDetalle(noticia: Noticia) {
    this.currentNoticia = noticia;
    this.bannerIndex = 0;
    this.startBanner();
  }

  startBanner() {
    this.stopBanner();

    const imagenes = this.currentNoticia?.noticiaImagens;
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

  cargarNoticias() {
    this.actualizarPaginacion();
  }

  actualizarPaginacion() {
    const start = this.currentPage * this.itemsPerPage;
    this.noticiasPaginadas = this.noticias.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.noticias.length / this.itemsPerPage);
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

  verNoticia(noticia: Noticia) {
    this.iniciarDetalle(noticia);
  }

  cerrarDetalle() {
    this.stopBanner();
    this.currentNoticia = null;
  }
}
