import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { MaestroService } from '../../services/maestro.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-ver-maestros-activos',
  imports: [NavbarComponent,CommonModule ],
  templateUrl: './ver-maestros-activos.component.html',
  styleUrl: './ver-maestros-activos.component.css'
})
export class VerMaestrosActivosComponent {
  maestrosActivos: any[] = [];

  constructor(private maestroService: MaestroService) {}

  ngOnInit(): void {
    this.obtenerMaestrosActivos();
  }

  obtenerMaestrosActivos(): void {
    this.maestroService.ObtenerMaestrosActivos().subscribe(
      (data: any) => {
        this.maestrosActivos = data;
      },
      (error) => {
        console.error('Error al obtener los maestros activos', error);
      }
    );
  }
}
