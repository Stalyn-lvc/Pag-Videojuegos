import { CommonModule } from '@angular/common';
import { Component, HostBinding, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-contador-token',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="token-chip" [class.expiring]="timeLeft <= 30">
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
      transition: background-color 0.3s ease, color 0.3s ease;
      margin-left: 20px;
    }

    .icon-clock {
      margin-right: 6px;
      font-size: 1.1rem;
    }

    .countdown {
      min-width: 2.5em;
      text-align: center;
      font-variant-numeric: tabular-nums;
    }

    .expired-text {
      color: #d32f2f;
      font-size: 0.9rem;
    }

    /* Pulso suave cuando quedan ≤30 s */
    .token-chip.expiring {
      animation: pulse 1s infinite alternate;
    }

    @keyframes pulse {
      from { background-color: #e8f0fe; color: #1967d2; }
      to   { background-color: #fdecea; color: #d32f2f; }
    }
  `]
})
export class ContadorTokenComponent implements OnInit, OnDestroy {
  @HostBinding('class') hostClass = 'app-contador-token';
  timeLeft = 0;
  private intervalId: any;

  get minutes(): string {
    return String(Math.floor(this.timeLeft / 60)).padStart(2, '0');
  }
  get seconds(): string {
    return String(this.timeLeft % 60).padStart(2, '0');
  }

  ngOnInit(): void {
    console.log('ContadorTokenComponent: ngOnInit disparado');  // <— siempre sale

    const expStr = localStorage.getItem('exp');
    console.log('Valor raw de localStorage.getItem("exp"):', expStr);  // <— qué lees

    if (!expStr) {
      console.warn('⚠️ No hay clave "exp" en localStorage.');  
      return;
    }

    // Parseo y detección de segundos vs ms
    const raw = parseInt(expStr, 10);
    console.log('raw (parseInt):', raw);

    const expirationMs = raw < 1e12 ? raw * 1000 : raw;
    console.log('expirationMs (en ms):', expirationMs);

    // Tiempo restante en segundos
    this.timeLeft = Math.max(0, Math.floor((expirationMs - Date.now()) / 1000));
    console.log('timeLeft inicial (s):', this.timeLeft);

    if (this.timeLeft > 0) {
      console.log('✅ Iniciando contador…');
      this.intervalId = setInterval(() => {
        this.timeLeft = Math.max(0, this.timeLeft - 1);
        // si quieres ver cada tick:
        // console.log('tick timeLeft:', this.timeLeft);
        if (this.timeLeft === 0) {
          console.log('⏱️ Token expiró.');
          clearInterval(this.intervalId);
          localStorage.removeItem('token');
          localStorage.removeItem('exp');
          location.reload();
        }
      }, 1000);
    } else {
      console.warn('❗ El token ya está vencido al iniciar.');
    }
  }


  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
