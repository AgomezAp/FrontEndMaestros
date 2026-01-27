import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(private router: Router) {}
  
  logOut() {
    localStorage.removeItem('token');
    localStorage.clear();
    this.router.navigate(['/logIn']);
  }
  
  irInventario() {
    this.router.navigate(['/inventario']);
  }

  agregarDispositivo() {
    this.router.navigate(['/agregar-dispositivo']);
  }

  crearActa() {
    this.router.navigate(['/crear-acta']);
  }

  verActas() {
    this.router.navigate(['/actas']);
  }

  registrarDevolucion() {
    this.router.navigate(['/acta-devolucion']);
  }
}
