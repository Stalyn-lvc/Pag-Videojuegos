import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-busqueda-barra',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './busqueda-barra.html',
  styleUrls: ['./busqueda-barra.css']
})
export class BusquedaBarraComponent {
  @Input() tipo: 'juegos' | 'noticias' = 'juegos';
  // Juegos
  @Input() generos: string[] = [];
  @Input() rangosPrecio: any[] = [];
  @Input() rangosRanking: any[] = [];
  // Noticias
  @Input() tags: string[] = [];

  // Estado de búsqueda
  busquedaTipo: string = 'nombre'; // juegos: nombre/genero/precio/ranquin | noticias: titulo/juego
  busquedaTexto: string = '';
  busquedaOpcion: string | null = null;
  // Noticias
  busquedaTag: string | null = null;
  busquedaJuego: string = '';
  opcionesTag: any[] = [];

  // Sugerencias
  @Input() nombreSugerencias: string[] = [];
  @Input() mostrarSugerenciasNombre: boolean = false;
  @Input() tituloSugerencias: string[] = [];
  @Input() mostrarSugerenciasTitulo: boolean = false;
  @Input() juegoSugerencias: string[] = [];
  @Input() mostrarSugerenciasJuego: boolean = false;

  // --- Búsqueda combinada para noticias ---
  sugerenciasCombinadas: { tipo: 'titulo' | 'juego', valor: string }[] = [];
  mostrarSugerenciasCombinadas: boolean = false;

  @Input() set sugerenciasCombinadasInput(val: { tipo: 'titulo' | 'juego', valor: string }[]) {
    this.sugerenciasCombinadas = val;
    this.mostrarSugerenciasCombinadas = !!val && val.length > 0;
  }

  @Output() buscar = new EventEmitter<{tipo: string, texto: string, opcion: string|null}>();
  @Output() limpiar = new EventEmitter<void>();
  @Output() autocompletar = new EventEmitter<{tipo: string, texto: string}>();
  @Output() seleccionarSugerencia = new EventEmitter<{tipo: string, valor: string}>();
  @Output() cambioTipo = new EventEmitter<string>();

  tiposBusquedaJuegos = [
    { value: 'genero', label: 'Género' },
    { value: 'precio', label: 'Precio' },
    { value: 'ranquin', label: 'Ranquin' }
  ];
  tiposBusquedaNoticias = [
    { value: 'tag', label: 'Etiqueta Noticia' }
  ];

  get opcionesSelector() {
    if (this.tipo === 'juegos') {
      if (this.busquedaTipo === 'genero') return this.generos;
      if (this.busquedaTipo === 'precio') return this.rangosPrecio;
      if (this.busquedaTipo === 'ranquin') return this.rangosRanking;
      return [];
    } else {
      if (this.busquedaTipo === 'tag') return this.tags;
      return [];
    }
  }

  onBuscar() {
    // Si hay texto en el input de nombre, buscar por nombre
    if (this.tipo === 'juegos') {
      if (this.busquedaTexto && this.busquedaTexto.trim().length > 0) {
        this.buscar.emit({ tipo: 'nombre', texto: this.busquedaTexto, opcion: null });
        return;
      }
      // Si hay filtro seleccionado
      if (this.busquedaTipo && this.busquedaOpcion) {
        this.buscar.emit({ tipo: this.busquedaTipo, texto: '', opcion: this.busquedaOpcion });
        return;
      }
      // Si no hay nada, buscar todo
      this.buscar.emit({ tipo: 'todos', texto: '', opcion: null });
      return;
    }
    // Para noticias, mantener la lógica existente
    this.buscar.emit({ tipo: this.busquedaTipo, texto: this.busquedaTexto, opcion: this.busquedaOpcion });
  }
  onLimpiar() {
    this.busquedaTexto = '';
    this.busquedaOpcion = null;
    this.busquedaTipo = this.tipo === 'juegos' ? 'nombre' : 'titulo';
    this.limpiar.emit();
  }
  onTipoChange(tipo: string) {
    this.busquedaTipo = tipo;
    this.busquedaOpcion = null;
    this.cambioTipo.emit(tipo);
  }
  onOpcionChange(opcion: string) {
    this.busquedaOpcion = opcion;
  }
  onAutocompletar(event: any) {
    this.busquedaTexto = event.target.value;
    this.mostrarSugerenciasNombre = !!this.busquedaTexto && this.busquedaTexto.length > 0 && this.tipo === 'juegos';
    this.autocompletar.emit({ tipo: this.busquedaTipo, texto: this.busquedaTexto });
  }
  onSeleccionarSugerencia(valor: string) {
    this.busquedaTexto = valor;
    this.seleccionarSugerencia.emit({ tipo: this.busquedaTipo, valor });
  }
  onBuscarNombre() {
    this.buscar.emit({ tipo: 'nombre', texto: this.busquedaTexto, opcion: null });
  }
  onBuscarFiltro() {
    if (this.busquedaTipo && this.busquedaOpcion) {
      this.buscar.emit({ tipo: this.busquedaTipo, texto: '', opcion: this.busquedaOpcion });
    }
  }

  // --- Noticias: Métodos específicos ---
  onAutocompletarNoticia(event: any) {
    this.busquedaTexto = event.target.value;
    this.autocompletar.emit({ tipo: 'titulo', texto: this.busquedaTexto });
  }

  onBuscarTitulo() {
    this.buscar.emit({ tipo: 'titulo', texto: this.busquedaTexto, opcion: null });
  }

  onLimpiarNoticia() {
    this.busquedaTexto = '';
    this.busquedaTag = null;
    this.limpiar.emit();
  }

  onSeleccionarSugerenciaNoticia(valor: string) {
    this.busquedaTexto = valor;
    this.seleccionarSugerencia.emit({ tipo: 'titulo', valor });
  }

  onTagChange(tag: string) {
    this.busquedaTag = tag;
  }

  onBuscarTag() {
    if (this.busquedaTag) {
      this.buscar.emit({ tipo: 'tag', texto: '', opcion: this.busquedaTag });
    }
  }

  onAutocompletarJuego(event: any) {
    this.busquedaJuego = event.target.value;
    this.autocompletar.emit({ tipo: 'juego', texto: this.busquedaJuego });
  }

  onSeleccionarSugerenciaJuego(valor: string) {
    this.busquedaJuego = valor;
    this.seleccionarSugerencia.emit({ tipo: 'juego', valor });
  }

  onBuscarJuego() {
    this.buscar.emit({ tipo: 'juego', texto: this.busquedaJuego, opcion: null });
  }

  onAutocompletarCombinado(event: any) {
    this.busquedaTexto = event.target.value;
    this.autocompletar.emit({ tipo: 'combinado', texto: this.busquedaTexto });
  }

  onSeleccionarSugerenciaCombinada(sugerencia: { tipo: 'titulo' | 'juego', valor: string }) {
    this.busquedaTexto = sugerencia.valor;
    this.seleccionarSugerencia.emit({ tipo: sugerencia.tipo, valor: sugerencia.valor });
    this.mostrarSugerenciasCombinadas = false;
  }

  onBuscarCombinado() {
    this.buscar.emit({ tipo: 'combinado', texto: this.busquedaTexto, opcion: null });
  }
} 