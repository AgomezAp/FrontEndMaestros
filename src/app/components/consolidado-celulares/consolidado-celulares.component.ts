import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { MaestroService } from '../../services/maestro.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-consolidado-celulares',
  imports: [NavbarComponent, CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './consolidado-celulares.component.html',
  styleUrl: './consolidado-celulares.component.css',
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
export class ConsolidadoCelularesComponent implements OnInit {
  celulares: any[] = [];
  celularesFiltrados: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  loading: boolean = true;
  
  // Filtros
  filtroEstado: string = 'todos';
  filtroAlmacen: string = 'todos';
  filtroMarca: string = 'todos';
  
  almacenes: string[] = [];
  marcas: string[] = [];
  estados: string[] = ['disponible', 'en_uso', 'dañado'];

  constructor(private maestroService: MaestroService, private router: Router) {}

  ngOnInit(): void {
    this.obtenerTodosCelulares();
  }

  agregarCelular(): void {
    this.router.navigate(['/agregarMaestro']);
  }

  obtenerTodosCelulares(): void {
    this.maestroService.ObtenerMaestrosActivos().subscribe(
      (data: any) => {
        this.celulares = data;
        this.extraerFiltros();
        this.aplicarFiltros();
        this.loading = false;
      },
      (error) => {
        console.error('Error al obtener los celulares', error);
        this.loading = false;
      }
    );
  }

  extraerFiltros(): void {
    // Extraer almacenes únicos
    this.almacenes = [...new Set(this.celulares.map(c => c.almacen))].filter(a => a);
    
    // Extraer marcas únicas
    this.marcas = [...new Set(this.celulares.map(c => c.marca))].filter(m => m);
  }

  aplicarFiltros(): void {
    this.celularesFiltrados = this.celulares.filter(celular => {
      const cumpleEstado = this.filtroEstado === 'todos' || celular.estado === this.filtroEstado;
      const cumpleAlmacen = this.filtroAlmacen === 'todos' || celular.almacen === this.filtroAlmacen;
      const cumpleMarca = this.filtroMarca === 'todos' || celular.marca === this.filtroMarca;
      
      return cumpleEstado && cumpleAlmacen && cumpleMarca;
    });
    this.currentPage = 1;
  }

  get paginatedCelulares(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.celularesFiltrados.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.celularesFiltrados.length / this.itemsPerPage);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getEstadoBadgeClass(estado: string): string {
    switch(estado) {
      case 'disponible':
        return 'estado-disponible';
      case 'en_uso':
        return 'estado-en-uso';
      case 'dañado':
        return 'estado-danado';
      default:
        return 'estado-default';
    }
  }

  getEstadoIcon(estado: string): string {
    switch(estado) {
      case 'disponible':
        return 'fa-circle-check';
      case 'en_uso':
        return 'fa-hourglass-end';
      case 'dañado':
        return 'fa-circle-xmark';
      default:
        return 'fa-circle-question';
    }
  }

  limpiarFiltros(): void {
    this.filtroEstado = 'todos';
    this.filtroAlmacen = 'todos';
    this.filtroMarca = 'todos';
    this.aplicarFiltros();
  }
}
