import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { MaestroService } from '../../services/maestro.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-ver-maestros-activos',
  imports: [NavbarComponent,CommonModule ],
  templateUrl: './ver-maestros-activos.component.html',
  styleUrl: './ver-maestros-activos.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('500ms', style({ opacity: 0 }))
      ])
    ])
  ],
})
export class VerMaestrosActivosComponent {
  maestrosActivos: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 6;
  loading: boolean = true;

  constructor(private maestroService: MaestroService) {}

  ngOnInit(): void {
    this.obtenerMaestrosActivos();
  }

  obtenerMaestrosActivos(): void {
    this.maestroService.ObtenerMaestrosActivos().subscribe(
      (data: any) => {
        this.maestrosActivos = data;
        this.loading = false;
      },
      (error) => {
        console.error('Error al obtener los maestros activos', error);
      }
    );
  }
  get paginatedMaestros(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.maestrosActivos.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.maestrosActivos.length) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
