import { CommonModule } from '@angular/common';
import { Component, HostBinding, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-contador-token',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isAuthenticated" class="token-chip" [class.expiring]="timeLeft <= 30" [title]="getTooltipText()">
      <span class="icon-clock"><i class="fa fa-clock-o"></i></span>
      <ng-container *ngIf="timeLeft > 0; else expired">
        <span class="countdown">{{ minutes }}:{{ seconds }}</span>
      </ng-container>
      <ng-template #expired>
        <span class="expired-text">Token expirado</span>
      </ng-template>
    </div>
  `,
  styles: [`
    .token-chip {
      display: inline-flex;
      align-items: center;
      background-color: #e8f0fe;
      color: #1967d2;
      font-weight: 600;
      font-size: 0.9rem;
      padding: 4px 10px;
      border-radius: 16px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      margin-left: 20px;
      cursor: help;
      position: relative;
    }

    .token-chip:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .icon-clock {
      margin-right: 6px;
      font-size: 1.1rem;
    }

    .countdown {
      min-width: 2.5em;
      text-align: center;
      font-variant-numeric: tabular-nums;
      font-family: 'Courier New', monospace;
    }

    .expired-text {
      color: #d32f2f;
      font-size: 0.9rem;
    }

    /* Pulso suave cuando quedan ≤30 s */
    .token-chip.expiring {
      animation: pulse 1s infinite alternate;
      background-color: #fdecea;
      color: #d32f2f;
    }

    @keyframes pulse {
      from { 
        background-color: #fdecea; 
        color: #d32f2f; 
        transform: scale(1);
      }
      to   { 
        background-color: #ffcdd2; 
        color: #b71c1c; 
        transform: scale(1.05);
      }
    }

    /* Tooltip personalizado */
    .token-chip::after {
      content: attr(title);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease;
      z-index: 1000;
    }

    .token-chip:hover::after {
      opacity: 1;
      visibility: visible;
    }
  `]
})
export class ContadorTokenComponent implements OnInit, OnDestroy {
  @HostBinding('class') hostClass = 'app-contador-token';
  timeLeft = 0;
  private intervalId: any;
  isAuthenticated = false;
  private lastTokenCheck = '';

  get minutes(): string {
    return String(Math.floor(this.timeLeft / 60)).padStart(2, '0');
  }
  get seconds(): string {
    return String(this.timeLeft % 60).padStart(2, '0');
  }

  ngOnInit(): void {
    console.log('ContadorTokenComponent: ngOnInit disparado');
    this.requestNotificationPermission();
    this.checkAuthenticationStatus();
    
    // Verificar el estado de autenticación cada 2 segundos para detectar login más rápido
    setInterval(() => {
      this.checkAuthenticationStatus();
    }, 2000);
  }

  private checkAuthenticationStatus(): void {
    const token = localStorage.getItem('token');
    const exp = localStorage.getItem('exp');
    
    const wasAuthenticated = this.isAuthenticated;
    this.isAuthenticated = !!(token && exp);
    
    // Detectar si es un nuevo login (token cambió)
    const currentTokenCheck = token || '';
    const isNewLogin = !wasAuthenticated && this.isAuthenticated && currentTokenCheck !== this.lastTokenCheck;
    
    if (isNewLogin) {
      console.log('🆕 Nuevo login detectado, creando token de 10 minutos...');
      this.createTenMinuteToken();
      this.lastTokenCheck = currentTokenCheck;
    } else if (this.isAuthenticated && !wasAuthenticated) {
      console.log('Usuario autenticado, iniciando contador...');
      this.startTokenTimer();
    } else if (!this.isAuthenticated && wasAuthenticated) {
      console.log('Usuario no autenticado, deteniendo contador...');
      this.stopTokenTimer();
      this.timeLeft = 0;
      this.lastTokenCheck = '';
    }
  }

  private createTenMinuteToken(): void {
    // Crear un token que expire en 10 minutos
    const expirationTime = Math.floor(Date.now() / 1000) + 600;   
    
    // Obtener el token actual del localStorage
    const currentToken = localStorage.getItem('token');
    
    if (currentToken) {
      try {
        // Decodificar el token actual para obtener el payload
        const tokenParts = currentToken.split('.');
        if (tokenParts.length === 3) {
          const header = tokenParts[0];
          const payload = JSON.parse(atob(tokenParts[1]));
          
          // Actualizar la expiración a 10 minutos
          payload.exp = expirationTime;
          
          // Recrear el token con la nueva expiración
          const newPayload = btoa(JSON.stringify(payload));
          const signature = tokenParts[2];
          const newToken = `${header}.${newPayload}.${signature}`;
          
          // Guardar el token actualizado
          localStorage.setItem('token', newToken);
          localStorage.setItem('exp', expirationTime.toString());
          
          console.log(' Token de 10 minutos creado, expira en:', new Date(expirationTime * 10000));
          
          // Iniciar el contador
          this.startTokenTimer();
        }
      } catch (error) {
        console.error('Error al actualizar el token:', error);
        // Fallback: crear un token simple de 10 minutos
        this.createSimpleToken(expirationTime);
      }
    } else {
      // Si no hay token, crear uno simple
      this.createSimpleToken(expirationTime);
    }
  }

  private createSimpleToken(expirationTime: number): void {
    // Crear un token JWT básico de 10 minutos
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      sub: 'user', 
      exp: expirationTime,
      tipoUsuario: 'User',
      iat: Math.floor(Date.now() / 1000)
    }));
    const signature = 'session-token';
    
    const newToken = `${header}.${payload}.${signature}`;
    
    // Guardar en localStorage
    localStorage.setItem('token', newToken);
    localStorage.setItem('exp', expirationTime.toString());
    
    console.log('✅ Token simple de 10 minutos creado, expira en:', new Date(expirationTime * 1000));
    
    // Iniciar el contador
    this.startTokenTimer();
  }

  private requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('✅ Permisos de notificación concedidos');
        } else {
          console.log('❌ Permisos de notificación denegados');
        }
      });
    }
  }

  getTooltipText(): string {
    if (this.timeLeft === 0) {
      return 'No hay token válido';
    } else if (this.timeLeft <= 30) {
      return `¡Atención! El token expira en ${this.timeLeft} segundos`;
    } else {
      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = this.timeLeft % 60;
      return `Token válido por ${minutes}m ${seconds}s`;
    }
  }

  private stopTokenTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private startTokenTimer(): void {
    // Detener cualquier contador existente
    this.stopTokenTimer();
    
    const token = localStorage.getItem('token');
    const expStr = localStorage.getItem('exp');
    
    console.log('Token presente:', !!token);
    console.log('Valor raw de localStorage.getItem("exp"):', expStr);

    if (!token || !expStr) {
      console.warn('⚠️ No hay token o clave "exp" en localStorage.');
      this.timeLeft = 0;
      return;
    }

    try {
      // Intentar decodificar el token JWT para obtener la expiración
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      console.log('Payload del token:', tokenPayload);
      
      // Usar la expiración del token JWT si está disponible
      let expirationMs: number;
      
      if (tokenPayload.exp) {
        // La expiración del JWT está en segundos desde epoch
        expirationMs = tokenPayload.exp * 1000;
        console.log('Usando exp del JWT:', tokenPayload.exp, '->', expirationMs);
      } else if (expStr) {
        // Usar el valor de localStorage como fallback
    const raw = parseInt(expStr, 10);
    console.log('raw (parseInt):', raw);

        // Determinar si es segundos o milisegundos
        if (raw < 1e12) {
          // Probablemente segundos
          expirationMs = raw * 1000;
        } else {
          // Probablemente milisegundos
          expirationMs = raw;
        }
        console.log('Usando exp de localStorage:', raw, '->', expirationMs);
      } else {
        console.warn('No se encontró información de expiración');
        this.timeLeft = 0;
        return;
      }

      // Calcular tiempo restante en segundos
      const now = Date.now();
      this.timeLeft = Math.max(0, Math.floor((expirationMs - now) / 1000));
      
      console.log('Tiempo actual (ms):', now);
      console.log('Expiración (ms):', expirationMs);
    console.log('timeLeft inicial (s):', this.timeLeft);

    if (this.timeLeft > 0) {
      console.log('✅ Iniciando contador…');
      this.intervalId = setInterval(() => {
        this.timeLeft = Math.max(0, this.timeLeft - 1);
          
          // Notificación cuando quedan 5 minutos
          if (this.timeLeft === 300) {
            this.showNotification('⚠️ Tu sesión expira en 5 minutos');
          }
          
          // Notificación cuando quedan 1 minuto
          if (this.timeLeft === 60) {
            this.showNotification('🚨 Tu sesión expira en 1 minuto');
          }
          
          // Notificación cuando quedan 30 segundos
          if (this.timeLeft === 30) {
            this.showNotification('🔥 ¡Tu sesión expira en 30 segundos!');
          }
          
        if (this.timeLeft === 0) {
          console.log('⏱️ Token expiró.');
            this.showNotification('⏰ Sesión expirada. Redirigiendo...');
          clearInterval(this.intervalId);
          localStorage.removeItem('token');
          localStorage.removeItem('exp');
            setTimeout(() => {
          location.reload();
            }, 2000);
        }
      }, 1000);
    } else {
      console.warn('❗ El token ya está vencido al iniciar.');
        this.timeLeft = 0;
      }
    } catch (error) {
      console.error('Error al procesar el token:', error);
      this.timeLeft = 0;
    }
  }

  private showNotification(message: string): void {
    // Crear notificación nativa del navegador si está disponible
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Sistema de Autenticación', {
        body: message,
        icon: '/favicon.ico'
      });
    }
    
    // También mostrar en consola
    console.log('🔔 Notificación:', message);
    
    // Mostrar alerta simple como fallback
    if (this.timeLeft <= 30) {
      alert(message);
    }
  }

  ngOnDestroy(): void {
    this.stopTokenTimer();
  }
}
