import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { Maestro } from '../../interfaces/maestro';
import { MaestroService } from '../../services/maestro.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-historico-maestros',
  imports: [NavbarComponent,CommonModule,FormsModule,FontAwesomeModule],
  templateUrl: './historico-maestros.component.html',
  styleUrl: './historico-maestros.component.css',
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
export class HistoricoMaestrosComponent implements OnInit {
  maestros: Maestro[] = [];
  loading: boolean = true;
  currentPage: number = 1;
  itemsPerPage: number = 5;
  filtroEstado: string = '';
  filtroPersona: string = '';
  filtroRegion: string = '';
  totalMaestrosFiltrados: number = 0;


  constructor(private maestroService: MaestroService,) {}

  ngOnInit(): void {
    this.obtenerHistoricoMaestros();
    this.actualizarTotalMaestrosFiltrados();
  }

  obtenerHistoricoMaestros(): void {
    this.maestroService.ObtenerHistoricoMaestros().subscribe(
      (data: any) => {
        console.log('Respuesta del servicio:', data);
        if (data && Array.isArray(data.maestros)) {
          this.maestros = data.maestros;
          this.totalMaestrosFiltrados = this.maestros.length; // Inicializar con el número total de maestros
          this.actualizarTotalMaestrosFiltrados(); // Actualizar el total de maestros filtrados
          this.maestros.forEach(maestro => {
            console.log('Maestro Estado:', maestro.estado);
            console.log('Maestro Region:', maestro.Uid);
            console.log('Persona a cargo:', maestro.usuarios);
          });
        } else {
          console.error('La respuesta no contiene un array de maestros', data);
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error al obtener los maestros', error);
        this.loading = false;
      }
    );
  }

  actualizarTotalMaestrosFiltrados(): void {
    this.totalMaestrosFiltrados = this.maestros.filter(maestro => {
      return (this.filtroEstado === '' || maestro.estado === this.filtroEstado) &&
             (this.filtroPersona === '' || `${maestro.usuarios.nombre} ${maestro.usuarios.apellido}`.toLowerCase().includes(this.filtroPersona.toLowerCase())) &&
             (this.filtroRegion === '' || maestro.region.toLowerCase().includes(this.filtroRegion.toLowerCase()));
    }).length;
    this.currentPage = 1; // Reset to first page when filters change
  }

  get paginatedMaestros(): Maestro[] {
    const filteredMaestros = this.maestros.filter(maestro => {
      return (this.filtroEstado === '' || maestro.estado === this.filtroEstado) &&
             (this.filtroPersona === '' || `${maestro.usuarios.nombre} ${maestro.usuarios.apellido}`.toLowerCase().includes(this.filtroPersona.toLowerCase())) &&
             (this.filtroRegion === '' || maestro.region.toLowerCase().includes(this.filtroRegion.toLowerCase()));
    });

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return filteredMaestros.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.totalMaestrosFiltrados) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
