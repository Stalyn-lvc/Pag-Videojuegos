import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Noticia } from '../../modelos/Noticias';
import { NoticiaServicio } from '../../servicios/noticia-servicio';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JuegoServicio } from '../../servicios/juego-servicio';
import { Juego } from '../../modelos/Juego';
import { BusquedaBarraComponent } from '../../componentes/busqueda-barra/busqueda-barra';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({  
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule, FormsModule, BusquedaBarraComponent],
  templateUrl: './noticias.html',
  styleUrls: ['./noticias.css']  // corregí el nombre a plural styleUrls
})
export class Noticias implements OnInit, OnDestroy, AfterViewChecked {
  noticias: Noticia[] = [];
  currentPage = 0;
  itemsPerPage = 4;
  noticiasPaginadas: Noticia[] = [];
  currentNoticia: Noticia | null = null;

  bannerIndex = 0;
  bannerInterval: any;

  // Filtros y autocompletado
  tags: string[] = ['Trailer', 'DLC', 'Actualización', 'Lanzamiento', 'Evento', 'Anuncio'];
  tagSeleccionado: string = '';
  tituloBusqueda: string = '';
  tituloSugerencias: string[] = [];
  juegoBusqueda: string = '';
  juegoSugerencias: string[] = [];
  mostrarSugerenciasTitulo: boolean = false;
  mostrarSugerenciasJuego: boolean = false;
  // Para sugerencias combinadas
  sugerenciasCombinadas: { tipo: 'titulo' | 'juego', valor: string }[] = [];
  mostrarSugerenciasCombinadas: boolean = false;

  @ViewChild('mainVideo') mainVideoRef!: ElementRef<HTMLVideoElement>;
  private lastBannerIndex: number = -1;
  videoError = false;
  videoLoading = false;

  onVideoLoadStart() {
    this.videoError = false;
    this.videoLoading = true;
  }

  onVideoError(event: Event) {
    this.videoError = true;
    console.error('Error al cargar el video:', event, this.currentNoticia?.noticiaImagens[this.bannerIndex].url);
  }

  cambiarBanner(index: number) {
    if (
      this.currentNoticia &&
      this.currentNoticia.noticiaImagens &&
      index >= 0 &&
      index < this.currentNoticia.noticiaImagens.length
    ) {
      this.bannerIndex = index;
      this.videoError = false;
      this.videoLoading = false;
      this.startBanner();
    }
  }

  constructor(private noticiaService: NoticiaServicio, private juegoService: JuegoServicio, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.noticiaService.getNoticias().subscribe(data => {
      this.noticias = data;
      this.actualizarPaginacion();
    });
  }

  ngOnDestroy(): void {
    this.stopBanner();
  }

  ngAfterViewChecked() {
    // Solo intenta reproducir si el banner cambió, hay video y NO es YouTube
    if (
      this.mainVideoRef &&
      this.mainVideoRef.nativeElement &&
      this.bannerIndex !== this.lastBannerIndex &&
      this.currentNoticia &&
      this.currentNoticia.noticiaImagens &&
      !this.isYouTube(this.currentNoticia.noticiaImagens[this.bannerIndex].url)
    ) {
      const video = this.mainVideoRef.nativeElement;
      video.load(); // Fuerza recarga
      video.muted = true;
      video.play().then(() => {
        console.log('Video reproduciéndose:', video.src);
      }).catch((err) => {
        console.error('No se pudo reproducir el video:', err);
      });
      this.lastBannerIndex = this.bannerIndex;
      this.videoError = false;
    }
  }

  // Llama esta función cuando asignas currentNoticia para reiniciar el banner
  iniciarDetalle(noticia: Noticia) {
    this.currentNoticia = noticia;
    this.bannerIndex = 0;
    this.videoError = false;
    this.videoLoading = false;
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

  goToPage(index: number) {
    if (index >= 0 && index < this.totalPages) {
      this.currentPage = index;
      this.actualizarPaginacion();
    }
  }

  // Reemplazar los métodos de filtro y autocompletado para que respondan a los eventos del componente hijo
  onCambioCampo(event: {campo: string, valor: any}) {
    (this as any)[event.campo] = event.valor;
  }
  onAutocompletar(event: {campo: string, valor: string}) {
    if (event.campo === 'tituloBusqueda') this.obtenerSugerenciasTitulo({target: {value: event.valor}});
    if (event.campo === 'juegoBusqueda') this.obtenerSugerenciasJuego({target: {value: event.valor}});
  }
  onSeleccionarSugerencia(event: {campo: string, valor: string}) {
    (this as any)[event.campo] = event.valor;
    if (event.campo === 'tituloBusqueda') this.buscarPorTitulo();
    if (event.campo === 'juegoBusqueda') this.buscarPorJuego();
  }

  onAutocompletarBarra(event: {tipo: string, texto: string}) {
    if (event.tipo === 'combinado') {
      this.obtenerSugerenciasTitulo({target: {value: event.texto}});
      this.obtenerSugerenciasJuego({target: {value: event.texto}});
      // Combinar sugerencias después de un pequeño delay para esperar ambas respuestas
      setTimeout(() => {
        this.sugerenciasCombinadas = [
          ...this.tituloSugerencias.map(t => ({ tipo: 'titulo' as const, valor: t })),
          ...this.juegoSugerencias.map(j => ({ tipo: 'juego' as const, valor: j }))
        ];
        this.mostrarSugerenciasCombinadas = this.sugerenciasCombinadas.length > 0;
      }, 200);
    } else {
      if (event.tipo === 'titulo') this.obtenerSugerenciasTitulo({target: {value: event.texto}});
      if (event.tipo === 'juego') this.obtenerSugerenciasJuego({target: {value: event.texto}});
    }
  }
  onSeleccionarSugerenciaBarra(event: {tipo: string, valor: string}) {
    if (event.tipo === 'titulo') {
      this.tituloBusqueda = event.valor;
      this.buscarPorTitulo();
    }
    if (event.tipo === 'juego') {
      this.juegoBusqueda = event.valor;
      this.buscarPorJuego();
    }
  }

  limpiarFiltros() {
    this.tagSeleccionado = '';
    this.tituloBusqueda = '';
    this.juegoBusqueda = '';
    this.tituloSugerencias = [];
    this.juegoSugerencias = [];
    this.mostrarSugerenciasTitulo = false;
    this.mostrarSugerenciasJuego = false;
    // Recargar todas las noticias desde el backend
    this.noticiaService.getNoticias().subscribe(data => {
      this.noticias = data;
      this.actualizarPaginacion();
    });
  }

  // Método para buscar combinando filtros (igual que antes)
  buscarNoticiasFiltradas() {
    if (this.tagSeleccionado) {
      this.noticiaService.buscarPorTag(this.tagSeleccionado).subscribe(noticias => {
        this.noticias = noticias;
        this.actualizarPaginacion();
      });
    } else if (this.tituloBusqueda) {
      this.buscarPorTitulo();
    } else if (this.juegoBusqueda) {
      this.buscarPorJuego();
    } else {
      this.cargarNoticias();
    }
  }

  // Método para autocompletar título de noticia
  obtenerSugerenciasTitulo(event: any) {
    const texto = event.target.value;
    this.tituloBusqueda = texto;
    if (texto.length > 1) {
      this.noticiaService.sugerenciasTitulo(texto).subscribe(noticias => {
        this.tituloSugerencias = noticias.map(n => n.titulo);
        this.mostrarSugerenciasTitulo = true;
      });
    } else {
      this.tituloSugerencias = [];
      this.mostrarSugerenciasTitulo = false;
    }
  }

  // Método para autocompletar nombre de juego en noticias
  obtenerSugerenciasJuego(event: any) {
    const texto = event.target.value;
    this.juegoBusqueda = texto;
    if (texto.length > 1) {
      this.juegoService.sugerenciasNombre(texto).subscribe((juegos: Juego[]) => {
        this.juegoSugerencias = juegos.map((j: Juego) => j.nombre);
        this.mostrarSugerenciasJuego = true;
      });
    } else {
      this.juegoSugerencias = [];
      this.mostrarSugerenciasJuego = false;
    }
  }

  // Método para buscar por título exacto
  buscarPorTitulo() {
    if (this.tituloBusqueda) {
      this.noticiaService.buscarPorTitulo(this.tituloBusqueda).subscribe(noticias => {
        this.noticias = noticias;
        this.actualizarPaginacion();
      });
    } else {
      this.cargarNoticias();
    }
  }

  // Método para buscar por nombre de juego exacto
  buscarPorJuego() {
    if (this.juegoBusqueda) {
      this.noticiaService.buscarPorJuego(this.juegoBusqueda).subscribe(noticias => {
        this.noticias = noticias;
        this.actualizarPaginacion();
      });
    } else {
      this.cargarNoticias();
    }
  }

  onBusquedaBarra(event: {tipo: string, texto: string, opcion: string|null}) {
    switch (event.tipo) {
      case 'titulo':
        this.tituloBusqueda = event.texto;
        this.buscarPorTitulo();
        break;
      case 'juego':
        this.juegoBusqueda = event.texto;
        this.buscarPorJuego();
        break;
      case 'tag':
        if (event.opcion) {
          this.tagSeleccionado = event.opcion;
          this.buscarNoticiasFiltradas();
        }
        break;
      default:
        this.limpiarFiltros();
    }
  }

  isVideo(url: string): boolean {
    return /\.(mp4|webm|ogg)$/i.test(url);
  }

  isYouTube(url: string): boolean {
    return /youtube\.com\/watch\?v=|youtu\.be\//.test(url);
  }
  getYouTubeEmbedUrl(url: string): SafeResourceUrl {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    const embed = match ? `https://www.youtube.com/embed/${match[1]}` : url;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embed);
  }

  getYouTubeThumbnail(url: string): string {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : '';
  }

  get tieneImagenes(): boolean {
    return !!(this.currentNoticia && Array.isArray(this.currentNoticia.noticiaImagens) && this.currentNoticia.noticiaImagens.length > 0);
  }
}
