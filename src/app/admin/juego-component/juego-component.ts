import { Component, OnInit } from '@angular/core';
import { Juego } from '../../modelos/Juego';
import { JuegoServicio } from '../../servicios/juego-servicio';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, SlicePipe, CurrencyPipe } from '@angular/common';
import { BusquedaBarraComponent } from '../../componentes/busqueda-barra/busqueda-barra';

@Component({
  selector: 'app-juego-component',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SlicePipe, CurrencyPipe, BusquedaBarraComponent],
  templateUrl: './juego-component.html',
  styleUrls: ['./juego-component.css']
})
export class JuegoComponent implements OnInit {
  juegos: Juego[] = [];
  modalVisible = false;
  formJuego: FormGroup;
  imagenesPreview: string[] = [];
  imagenesParaGuardar: { url: string }[] = [];
  nuevaUrl: string = '';
  sliderIndices: { [key: number]: number } = {};
  juegoEditando: Juego | null = null;

  // Filtros y autocompletado (igual que en juegos.ts)
  generos: string[] = ['Acción', 'RPG', 'Sandbox', 'Deportes', 'Aventura', 'Battle Royale', 'Estrategia', 'Simulación', 'Puzzle', 'Horro'];
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
    private fb: FormBuilder
  ) {
    this.formJuego = this.fb.group({
      secuencial: [null],
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      genero: [''],
      precio: [0],
      ranquin: [0],
      juegoImagens: [[]]
    });
  }

  ngOnInit() {
    this.cargarJuegos();
  }

  cargarJuegos() {
    console.log('🔄 Cargando juegos...');
    this.juegoServicio.getJuegos().subscribe({
      next: (juegos) => {
        console.log('✅ Juegos cargados:', juegos);
        this.juegos = juegos.map(j => ({ ...j, sliderIndex: 0 }));
      },
      error: (error) => {
        console.error('❌ Error al cargar juegos:', error);
      }
    });
  }

  abrirModal(juego?: Juego) {
    this.modalVisible = true;
    this.imagenesPreview = [];
    this.imagenesParaGuardar = [];
    this.nuevaUrl = '';
    if (juego) {
      this.formJuego.patchValue({ ...juego });
      this.formJuego.get('juegoImagens')?.setValue(juego.juegoImagens || []);
      this.imagenesPreview = (juego.juegoImagens || []).map(img => img.url);
      this.imagenesParaGuardar = [...(juego.juegoImagens || [])];
      this.juegoEditando = juego;
    } else {
      this.formJuego.reset({
        secuencial: null,
        nombre: '',
        descripcion: '',
        genero: '',
        precio: 0,
        ranquin: 0,
        juegoImagens: []
      });
      this.juegoEditando = null;
    }
  }

  cerrarModal() {
    this.modalVisible = false;
    this.formJuego.reset();
    this.imagenesPreview = [];
    this.imagenesParaGuardar = [];
    this.nuevaUrl = '';
    this.juegoEditando = null;
  }

  guardarJuego() {
    if (this.formJuego.invalid) return;
    const juego: Juego = {
      ...this.formJuego.value,
      juegoImagens: this.imagenesParaGuardar.map(img => ({ url: img.url }))
    };
    if (juego.secuencial) {
      this.juegoServicio.actualizarJuego(juego).subscribe(() => {
        this.cerrarModal();
        this.cargarJuegos();
      });
    } else {
      this.juegoServicio.crearJuego(juego).subscribe(() => {
        this.cerrarModal();
        this.cargarJuegos();
      });
    }
  }

  eliminarJuego(id: number) {
    if (confirm('¿Seguro que deseas eliminar este juego?')) {
      this.juegoServicio.eliminarJuego(id).subscribe(() => this.cargarJuegos());
    }
  }

  onFileChange(event: any) {
    const files: FileList = event.target.files;
    if (files && files.length) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagenesPreview.push(e.target.result);
          this.imagenesParaGuardar.push({ url: e.target.result });
        };
        reader.readAsDataURL(file);
      });
    }
  }

  agregarUrl() {
    if (this.nuevaUrl && this.nuevaUrl.startsWith('http')) {
      this.imagenesPreview.push(this.nuevaUrl);
      this.imagenesParaGuardar.push({ url: this.nuevaUrl });
      this.nuevaUrl = '';
    }
  }

  eliminarImagen(idx: number) {
    this.imagenesPreview.splice(idx, 1);
    this.imagenesParaGuardar.splice(idx, 1);
  }

  onInput(event: any) {
    this.nuevaUrl = event.target.value;
  }

  cambiarImagen(juego: Juego, dir: number) {
    if (juego.sliderIndex === undefined) juego.sliderIndex = 0;
    const max = (juego.juegoImagens?.length || 0) - 1;
    let idx = juego.sliderIndex + dir;
    if (idx < 0) idx = 0;
    if (idx > max) idx = max;
    juego.sliderIndex = idx;
  }

  buscarPorGenero() {
    if (this.generoSeleccionado) {
      this.juegoServicio.buscarPorGenero(this.generoSeleccionado).subscribe(juegos => {
        this.juegos = juegos.map(j => ({ ...j, sliderIndex: 0 }));
      });
    } else {
      this.cargarJuegos();
    }
  }

  buscarPorPrecio() {
    const { min, max } = this.rangoPrecioSeleccionado;
    if (min !== null && max !== null) {
      this.juegoServicio.buscarPorPrecio(min, max).subscribe(juegos => {
        this.juegos = juegos.map(j => ({ ...j, sliderIndex: 0 }));
      });
    } else {
      this.cargarJuegos();
    }
  }

  buscarPorRanking() {
    const { min, max } = this.rangoRankingSeleccionado;
    if (min !== null && max !== null) {
      this.juegoServicio.buscarPorRanking(min, max).subscribe(juegos => {
        this.juegos = juegos.map(j => ({ ...j, sliderIndex: 0 }));
      });
    } else {
      this.cargarJuegos();
    }
  }

  buscarPorNombre() {
    if (this.nombreBusqueda) {
      this.juegoServicio.buscarPorNombre(this.nombreBusqueda).subscribe(juegos => {
        this.juegos = juegos.map(j => ({ ...j, sliderIndex: 0 }));
      });
    } else {
      this.cargarJuegos();
    }
  }

  // Sugerencias de nombre (autocompletado)
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

  seleccionarSugerenciaNombre(nombre: string) {
    this.nombreBusqueda = nombre;
    this.mostrarSugerenciasNombre = false;
    this.buscarPorNombre();
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

  onBusquedaBarra(event: {tipo: string, texto: string, opcion: string|null}) {
    switch (event.tipo) {
      case 'nombre':
        this.nombreBusqueda = event.texto;
        this.buscarPorNombre();
        break;
      case 'genero':
        if (event.opcion) {
          this.generoSeleccionado = event.opcion;
          this.buscarPorGenero();
        }
        break;
      case 'precio':
        if (event.opcion) {
          this.rangoPrecioSeleccionado = typeof event.opcion === 'string'
            ? this.rangosPrecio.find(r => r.label === event.opcion) || this.rangosPrecio[0]
            : event.opcion;
          this.buscarPorPrecio();
        }
        break;
      case 'ranquin':
        if (event.opcion) {
          this.rangoRankingSeleccionado = typeof event.opcion === 'string'
            ? this.rangosRanking.find(r => r.label === event.opcion) || this.rangosRanking[0]
            : event.opcion;
          this.buscarPorRanking();
        }
        break;
      default:
        this.limpiarFiltros();
    }
  }

  onAutocompletar(event: {tipo: string, texto: string}) {
    if (event.tipo === 'nombre') this.obtenerSugerenciasNombre({target: {value: event.texto}});
  }
  onSeleccionarSugerencia(event: {tipo: string, valor: string}) {
    if (event.tipo === 'nombre') {
      this.nombreBusqueda = event.valor;
      this.buscarPorNombre();
    }
  }
} 