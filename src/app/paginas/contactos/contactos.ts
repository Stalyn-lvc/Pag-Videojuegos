import { Component } from '@angular/core';
import emailjs from '@emailjs/browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contactos',
  templateUrl: './contactos.html',
  styleUrl: './contactos.css',
  standalone: true,
  imports: [FormsModule, CommonModule],
})

export class Contactos {
  nombre = '';
  email = '';
  telefono = '';
  asunto = '';
  mensaje = '';
  estadoEnvio: string | null = null;
  colorEstado: string = 'black';
  enviando = false;
  mostrarModalExito = false;

  limpiarFormulario() {
    this.nombre = '';
    this.email = '';
    this.telefono = '';
    this.asunto = '';
    this.mensaje = '';
    this.estadoEnvio = null;
    this.colorEstado = 'black';
  }

  cerrarModal() {
    this.mostrarModalExito = false;
  }


  async enviarMensaje() {
    // Validar campos vacíos
    if (!this.nombre || !this.email || !this.telefono || !this.asunto || !this.mensaje) {
      this.estadoEnvio = 'Por favor, complete todos los campos';
      this.colorEstado = 'red';
      return;
    }

    // Validar formato de correo
    if (!/\S+@\S+\.\S+/.test(this.email)) {
      this.estadoEnvio = 'Correo electrónico no válido';
      this.colorEstado = 'red';
      return;
    }

    this.enviando = true;
    this.estadoEnvio = 'Enviando mensaje...';
    this.colorEstado = 'blue';

    const templateParams = {
      nombre: this.nombre,
      time: new Date().toLocaleString(),
      mensaje: this.mensaje,
      telefono: this.telefono,
      email: this.email,
      asunto: this.asunto,
      from_name: this.nombre,
    };

    try {
      await emailjs.send(
        'SVucacue',        // Reemplaza con tu Service ID real
        'template_Ip',     // Reemplaza con tu Template ID real
        templateParams,
        '6VKYyqKoULERxNBDA' // Reemplaza con tu Public Key real
      );

      // Mostrar modal de éxito
      this.estadoEnvio = null;
      this.colorEstado = 'green';
      this.mostrarModalExito = true;
      this.limpiarFormulario();
    } catch (error: any) {
      this.estadoEnvio = 'Error al enviar el mensaje: ' + (error.text || 'Desconocido');
      this.colorEstado = 'red';
    } finally {
      this.enviando = false;
    }
  }
}
