import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  genre?: string;
  rating?: number;
  image?: string;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private cart: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  private loadCart(): void {
    const savedCart = localStorage.getItem('gameStoreCart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
      this.cartSubject.next(this.cart);
    }
  }

  private saveCart(): void {
    localStorage.setItem('gameStoreCart', JSON.stringify(this.cart));
    this.cartSubject.next(this.cart);
  }

  getCart(): CartItem[] {
    return [...this.cart];
  }

  addToCart(item: CartItem): void {
    const existing = this.cart.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += item.quantity || 1;
    } else {
      this.cart.push({ ...item, quantity: item.quantity || 1 });
    }
    this.saveCart();
  }

  removeFromCart(id: number): void {
    this.cart = this.cart.filter(i => i.id !== id);
    this.saveCart();
  }

  clearCart(): void {
    this.cart = [];
    this.saveCart();
  }

  getCartTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getCartItemCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }
} 