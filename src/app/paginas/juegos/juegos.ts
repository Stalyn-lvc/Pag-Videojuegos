import { Component, OnInit, OnDestroy } from '@angular/core';
import { Juego } from '../../modelos/Juego';
import { JuegoServicio } from '../../servicios/juego-servicio';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { environment } from '../../../environment';
import { CarritoService } from '../../servicios/carrito-servicio';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BusquedaBarraComponent } from '../../componentes/busqueda-barra/busqueda-barra';

@Component({
  selector: 'app-juegos',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule, BusquedaBarraComponent],
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

  // Filtros y autocompletado
  generos: string[] = ['Acción', 'RPG', 'Sandbox', 'Deportes', 'Aventura', 'Battle Royale', 'Estrategia', 'Simulación', 'Puzzle', 'Horror'];
  generoSeleccionado: string = '';
  rangosPrecio = [
    { label: 'Todos', min: null, max: null },
    { label: 'Gratuito', min: 0, max: 0 },
    { label: 'Económico', min: 0.01, max: 25 },
    { label: 'Moderado', min: 25.01, max: 45 },
    { label: 'Premium', min: 45.01, max: 65 },
    { label: 'Deluxe', min: 65.01, max: null }
  ];
  rangoPrecioSeleccionado = this.rangosPrecio[0];
  rangosRanking = [
    { label: 'Todos', min: null, max: null },
    { label: 'Básico', min: 3.0, max: 3.5 },
    { label: 'Bueno', min: 3.6, max: 4.0 },
    { label: 'Muy Bueno', min: 4.1, max: 4.5 },
    { label: 'Excelente', min: 4.6, max: 5.0 }
  ];
  rangoRankingSeleccionado = this.rangosRanking[0];
  nombreBusqueda: string = '';
  nombreSugerencias: string[] = [];
  mostrarSugerenciasNombre: boolean = false;

  constructor(
    private juegoServicio: JuegoServicio,
    private carritoService: CarritoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarJuegos();
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

  // Reemplazar los métodos de filtro y autocompletado para que respondan a los eventos del componente hijo
  onCambioCampo(event: {campo: string, valor: any}) {
    (this as any)[event.campo] = event.valor;
  }
  onAutocompletar(event: {campo: string, valor: string}) {
    if (event.campo === 'nombreBusqueda') this.obtenerSugerenciasNombre({target: {value: event.valor}});
  }
  onSeleccionarSugerencia(event: {campo: string, valor: string}) {
    (this as any)[event.campo] = event.valor;
    if (event.campo === 'nombreBusqueda') this.buscarPorNombre();
  }

  cargarJuegos() {
    this.juegoServicio.getJuegos().subscribe(data => {
      this.juegos = data;
      this.currentPage = 0;
      this.actualizarPaginacion();
    });
  }

  limpiarFiltros() {
    this.generoSeleccionado = '';
    this.rangoPrecioSeleccionado = this.rangosPrecio[0];
    this.rangoRankingSeleccionado = this.rangosRanking[0];
    this.nombreBusqueda = '';
    this.nombreSugerencias = [];
    this.mostrarSugerenciasNombre = false;
    this.cargarJuegos();
  }

  // Método para buscar combinando filtros (igual que antes)
  buscarJuegosFiltrados() {
    if (this.generoSeleccionado) {
      this.juegoServicio.buscarPorGenero(this.generoSeleccionado).subscribe(juegos => {
        this.juegos = juegos;
        this.currentPage = 0;
        this.actualizarPaginacion();
      });
    } else if (this.rangoPrecioSeleccionado.min !== null && this.rangoPrecioSeleccionado.max !== null) {
      this.juegoServicio.buscarPorPrecio(this.rangoPrecioSeleccionado.min, this.rangoPrecioSeleccionado.max).subscribe(juegos => {
        this.juegos = juegos;
        this.currentPage = 0;
        this.actualizarPaginacion();
      });
    } else if (this.rangoRankingSeleccionado.min !== null && this.rangoRankingSeleccionado.max !== null) {
      this.juegoServicio.buscarPorRanking(this.rangoRankingSeleccionado.min, this.rangoRankingSeleccionado.max).subscribe(juegos => {
        this.juegos = juegos;
        this.currentPage = 0;
        this.actualizarPaginacion();
      });
    } else if (this.nombreBusqueda) {
      this.buscarPorNombre();
    } else {
      this.cargarJuegos();
    }
  }

  // Método para autocompletar nombre de juego
  obtenerSugerenciasNombre(event: any) {
    const texto = event.target.value;
    this.nombreBusqueda = texto;
    if (texto.length > 1) {
      this.juegoServicio.sugerenciasNombre(texto).subscribe(juegos => {
        this.nombreSugerencias = juegos.map((j: Juego) => j.nombre);
        this.mostrarSugerenciasNombre = true;
      });
    } else {
      this.nombreSugerencias = [];
      this.mostrarSugerenciasNombre = false;
    }
  }

  // Método para buscar por nombre exacto
  buscarPorNombre(texto?: string) {
    const nombre = texto !== undefined ? texto : this.nombreBusqueda;
    if (nombre) {
      this.juegoServicio.buscarPorNombre(nombre).subscribe(juegos => {
        this.juegos = juegos;
        this.currentPage = 0;
        this.actualizarPaginacion();
      });
    } else {
      this.cargarJuegos();
    }
  }

  onBusquedaBarra(event: {tipo: string, texto: string, opcion: string|null}) {
    if (event.tipo === 'nombre') {
      this.nombreBusqueda = event.texto;
      this.buscarPorNombre(event.texto);
    } else if (event.tipo === 'genero' && event.opcion) {
      this.generoSeleccionado = event.opcion;
      this.juegoServicio.buscarPorGenero(this.generoSeleccionado).subscribe(juegos => {
        this.juegos = juegos;
        this.currentPage = 0;
        this.actualizarPaginacion();
      });
    } else if (event.tipo === 'precio' && event.opcion) {
      // Si es string, buscar el objeto correspondiente
      let opcionPrecio = typeof event.opcion === 'string'
        ? this.rangosPrecio.find(r => r.label === event.opcion) || this.rangosPrecio[0]
        : event.opcion;
      this.rangoPrecioSeleccionado = opcionPrecio;
      this.juegoServicio.buscarPorPrecio(
        opcionPrecio.min !== null && opcionPrecio.min !== undefined ? opcionPrecio.min : 0,
        opcionPrecio.max !== null && opcionPrecio.max !== undefined ? opcionPrecio.max : 9999
      ).subscribe(juegos => {
        this.juegos = juegos;
        this.currentPage = 0;
        this.actualizarPaginacion();
      });
    } else if (event.tipo === 'ranquin' && event.opcion) {
      // Si es string, buscar el objeto correspondiente
      let opcionRanking = typeof event.opcion === 'string'
        ? this.rangosRanking.find(r => r.label === event.opcion) || this.rangosRanking[0]
        : event.opcion;
      this.rangoRankingSeleccionado = opcionRanking;
      this.juegoServicio.buscarPorRanking(
        opcionRanking.min !== null && opcionRanking.min !== undefined ? opcionRanking.min : 0,
        opcionRanking.max !== null && opcionRanking.max !== undefined ? opcionRanking.max : 5
      ).subscribe(juegos => {
        this.juegos = juegos;
        this.currentPage = 0;
        this.actualizarPaginacion();
      });
    } else if (event.tipo === 'todos') {
      this.cargarJuegos();
    }
  }

  onAutocompletarBarra(event: {tipo: string, texto: string}) {
    if (event.tipo === 'nombre') {
      this.obtenerSugerenciasNombre({ target: { value: event.texto } });
    }
  }

  onSeleccionarSugerenciaBarra(event: {tipo: string, valor: string}) {
    if (event.tipo === 'nombre') {
      this.nombreBusqueda = event.valor;
      this.buscarPorNombre();
    }
  }
}
