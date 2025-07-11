import { Component, OnInit } from '@angular/core';
import { Noticia } from '../../modelos/Noticias';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NoticiaServicio } from '../../servicios/noticia-servicio';
import * as bootstrap from 'bootstrap';

@Component({
  standalone: true,
  selector: 'app-noticia-component',
  templateUrl: './noticia-component.html',
  styleUrls: ['./noticia-component.css'],
  imports: [CommonModule, FormsModule,ReactiveFormsModule],
  
})
export class NoticiaComponent implements OnInit {
  noticias: any[] = [];
  formNoticia!: FormGroup;

  imagenesPreview: string[] = [];  // Muestra en preview (base64 + URLs)
  imagenesBase64: string[] = [];   // Solo base64 (archivos)
  imagenesUrl: string[] = [];      // Solo URLs agregadas manualmente

  nuevaUrl: string = '';           // Para input URL

  modalVisible = false;

  constructor(private fb: FormBuilder, private noticiaService: NoticiaServicio) {}

  ngOnInit(): void {
    this.formNoticia = this.fb.group({
      secuencial: [null],
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      estadoNoticia: [1],
    });

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
    this.noticiaService.getNoticias().subscribe((data) => (this.noticias = data));
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
}