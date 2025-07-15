import { Component, OnInit } from '@angular/core';
import { Noticia } from '../../modelos/Noticias';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NoticiaServicio } from '../../servicios/noticia-servicio';
import { environment } from '../../../environment';
import * as bootstrap from 'bootstrap';
import { JuegoServicio } from '../../servicios/juego-servicio';
import { Juego } from '../../modelos/Juego';
import { BusquedaBarraComponent } from '../../componentes/busqueda-barra/busqueda-barra';

@Component({
  standalone: true,
  selector: 'app-noticia-component',
  templateUrl: './noticia-component.html',
  styleUrls: ['./noticia-component.css'],
  imports: [CommonModule, FormsModule,ReactiveFormsModule, BusquedaBarraComponent],
  
})
export class NoticiaComponent implements OnInit {
  noticias: any[] = [];
  formNoticia!: FormGroup;

  imagenesPreview: string[] = [];  // Muestra en preview (base64 + URLs)
  imagenesBase64: string[] = [];   // Solo base64 (archivos)
  imagenesUrl: string[] = [];      // Solo URLs agregadas manualmente

  nuevaUrl: string = '';           // Para input URL

  modalVisible = false;

  // Filtros y autocompletado
  tags: string[] = ['Trailer', 'DLC', 'Actualización', 'Lanzamiento', 'Evento', 'Anuncio'];
  tagSeleccionado: string = '';
  tituloBusqueda: string = '';
  tituloSugerencias: string[] = [];
  juegoBusqueda: string = '';
  juegoSugerencias: string[] = [];
  mostrarSugerenciasTitulo: boolean = false;
  mostrarSugerenciasJuego: boolean = false;

  constructor(private fb: FormBuilder, private noticiaService: NoticiaServicio, private juegoService: JuegoServicio) {}

  ngOnInit(): void {
    console.log('🚀 NoticiaComponent inicializado');
    console.log('🔍 Verificando autenticación...');
    
    this.formNoticia = this.fb.group({
      secuencial: [null],
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      estadoNoticia: [1],
    });

    console.log('📋 Formulario inicializado');
    this.cargarNoticias();
  }
  cambiarImagen(noticia: any, direccion: number) {
    if (!noticia.sliderIndex && noticia.sliderIndex !== 0) {
      noticia.sliderIndex = 0;
    }
    const nuevaIndex = noticia.sliderIndex + direccion;
    if (nuevaIndex >= 0 && nuevaIndex < noticia.noticiaImagens.length) {
      noticia.sliderIndex = nuevaIndex;
    }
  }
  cargarNoticias() {
    console.log('🔄 Cargando noticias...');
    console.log('🌐 URL del API:', `${environment.urlApi}/noticia`);
    
    this.noticiaService.getNoticias().subscribe({
      next: (data) => {
        console.log('✅ Noticias cargadas:', data);
        console.log('📊 Cantidad de noticias:', data.length);
        this.noticias = data;
      },
      error: (error) => {
        console.error('❌ Error al cargar noticias:', error);
        console.error('🔍 Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
      }
    });
  }

  abrirModal(noticia?: Noticia) {
    this.formNoticia.reset({ estadoNoticia: 1 });
    this.imagenesPreview = [];
    this.imagenesBase64 = [];
    this.imagenesUrl = [];

    if (noticia) {
      this.formNoticia.patchValue(noticia);

      // Separar URLs y base64 en arrays diferentes para control
      noticia.noticiaImagens.forEach(i => {
        if (i.url.startsWith('data:image/')) {
          this.imagenesBase64.push(i.url);
          this.imagenesPreview.push(i.url);
        } else {
          this.imagenesUrl.push(i.url);
          this.imagenesPreview.push(i.url);
        }
      });
    }

    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
  }
  onInput(event: any) {
    console.log('input event:', event.target.value);
    console.log('nuevaUrl binding:', this.nuevaUrl);
  }
  agregarUrl() {
    const url = this.nuevaUrl.trim();
    console.log(url);
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      this.imagenesUrl.push(url);
      this.imagenesPreview.push(url);
      this.nuevaUrl = '';
    } else {
      alert('Por favor ingresa una URL válida que comience con http:// o https://');
    }
  }

  eliminarImagen(index: number) {
    const img = this.imagenesPreview[index];

    this.imagenesPreview.splice(index, 1);

    const base64Index = this.imagenesBase64.indexOf(img);
    if (base64Index !== -1) {
      this.imagenesBase64.splice(base64Index, 1);
    } else {
      const urlIndex = this.imagenesUrl.indexOf(img);
      if (urlIndex !== -1) {
        this.imagenesUrl.splice(urlIndex, 1);
      }
    }
  }

  onFileChange(event: any) {
    const files: FileList = event.target.files;

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = (e: any) => {
          this.imagenesBase64.push(e.target.result);
          this.imagenesPreview.push(e.target.result);
        };

        reader.readAsDataURL(file);
      }
    }
  }

  guardarNoticia() {
    if (this.formNoticia.invalid) {
      this.formNoticia.markAllAsTouched();
      return;
    }

    const noticiaData = this.formNoticia.value;

    noticiaData.noticiaImagens = [
      ...this.imagenesBase64.map(base64 => ({
        secuencial: 0,
        url: base64,
        estadoImagen: 1,
      })),
      ...this.imagenesUrl.map(url => ({
        secuencial: 0,
        url: url,
        estadoImagen: 1,
      })),
    ];

    console.log("Noticia a enviar:", this.cleanCircularReferences(noticiaData));

    // Si `secuencial` existe, actualizamos
    if (noticiaData.secuencial) {
      this.noticiaService.actualizarNoticia(noticiaData.secuencial, this.cleanCircularReferences(noticiaData)).subscribe({
        next: () => {
          this.modalVisible = false;
          this.cargarNoticias();
        },
        error: err => {
          console.error("Error al actualizar la noticia:", err);
        }
      });
    } else {
      // Caso contrario, es una creación
      this.noticiaService.crearNoticia(this.cleanCircularReferences(noticiaData)).subscribe({
        next: () => {
          this.modalVisible = false;
          this.cargarNoticias();
        },
        error: err => {
          console.error("Error al guardar la noticia:", err);
        }
      });
    }
  }

  cleanCircularReferences(obj: any) {
    const seen = new WeakSet();
    return JSON.parse(JSON.stringify(obj, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return;
        seen.add(value);
      }
      return value;
    }));
  }

  eliminarNoticia(id: number) {
    this.noticiaService.eliminarNoticia(id).subscribe(() => this.cargarNoticias());
  }

  buscarPorTag() {
    if (this.tagSeleccionado) {
      this.noticiaService.buscarPorTag(this.tagSeleccionado).subscribe(noticias => {
        this.noticias = noticias;
      });
    } else {
      this.cargarNoticias();
    }
  }

  buscarPorTitulo() {
    if (this.tituloBusqueda) {
      this.noticiaService.buscarPorTitulo(this.tituloBusqueda).subscribe(noticias => {
        this.noticias = noticias;
      });
    } else {
      this.cargarNoticias();
    }
  }

  buscarPorJuego() {
    if (this.juegoBusqueda) {
      this.noticiaService.buscarPorJuego(this.juegoBusqueda).subscribe(noticias => {
        this.noticias = noticias;
      });
    } else {
      this.cargarNoticias();
    }
  }

  // Sugerencias de título (autocompletado)
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

  seleccionarSugerenciaTitulo(titulo: string) {
    this.tituloBusqueda = titulo;
    this.mostrarSugerenciasTitulo = false;
    this.buscarPorTitulo();
  }

  // Sugerencias de nombre de juego (autocompletado)
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

  seleccionarSugerenciaJuego(nombre: string) {
    this.juegoBusqueda = nombre;
    this.mostrarSugerenciasJuego = false;
    this.buscarPorJuego();
  }

  // Buscar combinando filtros (opcional, para búsquedas avanzadas)
  buscarNoticiasFiltradas() {
    if (this.tagSeleccionado) {
      this.buscarPorTag();
    } else if (this.tituloBusqueda) {
      this.buscarPorTitulo();
    } else if (this.juegoBusqueda) {
      this.buscarPorJuego();
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
          this.buscarPorTag();
        }
        break;
      default:
        this.limpiarFiltros();
    }
  }
  onAutocompletarBarra(event: {tipo: string, texto: string}) {
    if (event.tipo === 'titulo') this.obtenerSugerenciasTitulo({target: {value: event.texto}});
    if (event.tipo === 'juego') this.obtenerSugerenciasJuego({target: {value: event.texto}});
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
    this.cargarNoticias();
  }
}