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
  constructor(private router:Router){}
  logOut(){
    localStorage.removeItem('token')
    localStorage.clear();
    this.router.navigate(['/logIn'])
  }
  verMaestros() {
    this.router.navigate(['/dashBoard']);
  }

  verMaestrosActivos() {
    this.router.navigate(['/ObtenerMaestrosActivos']);
  }

  verHistoricoMaestros() {
    this.router.navigate(['/ver-historico-maestros']);
  }

  generarInforme() {
    this.router.navigate(['/generar-informe']);
  }

}
