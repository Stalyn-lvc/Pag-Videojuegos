import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../servicios/auth-service';
import { CarritoService, CartItem } from '../../servicios/carrito-servicio';
import { NgIf, AsyncPipe, NgFor } from '@angular/common';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { ContadorTokenComponent } from "../../ContadorTokenComponent";

// Interfaces para el carrito
interface Game {
  id: number;
  title: string;
  price: number;
  genre?: string;
  rating?: number;
  image?: string;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [NgIf, AsyncPipe, NgFor, RouterModule, ContadorTokenComponent],
  templateUrl: './menu.html',
  styleUrls: ['./menu.css']
})
export class MenuComponent implements OnInit, OnDestroy {
  isLoggedIn$!: Observable<boolean>;
  tipoUsuario: string = '';
  private tipoUsuarioSub?: Subscription;

  // Gestión de carrito
  cart: CartItem[] = [];
  cartTotal: number = 0;
  cartItemCount: number = 0;
  showCartModal: boolean = false;
  private cartSub?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private carritoService: CarritoService
  ) {
    this.isLoggedIn$ = this.authService.authStatus();
  }

  ngOnInit(): void {
    // Nos suscribimos para mantener actualizado el tipoUsuario
    this.tipoUsuarioSub = this.authService.getTipoUsuario().subscribe(tipo => {
      this.tipoUsuario = tipo;
      console.log('Tipo de usuario actualizado:', tipo);
    });

    this.cartSub = this.carritoService.cart$.subscribe(cart => {
      this.cart = cart;
      this.cartTotal = this.carritoService.getCartTotal();
      this.cartItemCount = this.carritoService.getCartItemCount();
    });
  }

  ngOnDestroy(): void {
    // Importante limpiar la suscripción para evitar memory leaks
    this.cartSub?.unsubscribe();
    this.tipoUsuarioSub?.unsubscribe();
  }

  get username(): string {
    return this.authService.getUsername();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ===== GESTIÓN DEL CARRITO =====
  addToCart(game: Game): void {
    this.carritoService.addToCart({
      ...game,
      quantity: 1
    });
  }

  // Función de prueba para agregar un juego de ejemplo
  addTestGame(): void {
    const testGame = {
      id: 1,
      title: "The Witcher 3: Wild Hunt",
      price: 29.99,
      genre: "RPG",
      rating: 4.9,
      image: "assets/witcher3.jpg",
      quantity: 1
    };
    this.addToCart(testGame);
  }

  removeFromCart(gameId: number): void {
    this.carritoService.removeFromCart(gameId);
  }

  clearCart(): void {
    this.carritoService.clearCart();
  }

  toggleCart(): void {
    this.showCartModal = !this.showCartModal;
    
    if (this.showCartModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  checkout(): void {
    if (this.cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const confirmPurchase = confirm(`¿Confirmar compra por $${this.cartTotal.toFixed(2)}?`);

    if (confirmPurchase) {
      alert('¡Compra realizada con éxito!');
      this.clearCart();
      this.toggleCart();
    } else {
      alert('Compra cancelada');
    }
  }
}