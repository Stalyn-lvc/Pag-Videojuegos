import { Component, OnInit } from '@angular/core';
import { Juego } from '../../modelos/Juego';
import { JuegoServicio } from '../../servicios/juego-servicio';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, SlicePipe, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-juego-component',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SlicePipe, CurrencyPipe],
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
} 