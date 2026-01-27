import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InventarioService } from '../../services/inventario.service';
import { Dispositivo, EstadisticasInventario } from '../../interfaces/inventario';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit {
  dispositivos: Dispositivo[] = [];
  dispositivosFiltrados: Dispositivo[] = [];
  estadisticas: EstadisticasInventario | null = null;
  loading = false;
  error = '';

  // Filtros
  filtroEstado = 'todos';
  filtroCategoria = 'todas';
  filtroBusqueda = '';

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 10;

  // Categorías disponibles
  categorias = ['celular', 'tablet', 'computador', 'cargador', 'accesorio', 'otro'];
  estados = ['disponible', 'entregado', 'dañado', 'perdido', 'obsoleto'];

  constructor(
    private inventarioService: InventarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDispositivos();
    this.cargarEstadisticas();
  }

  cargarDispositivos(): void {
    this.loading = true;
    this.inventarioService.obtenerDispositivos().subscribe({
      next: (data) => {
        this.dispositivos = data;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los dispositivos';
        this.loading = false;
        console.error(err);
      }
    });
  }

  cargarEstadisticas(): void {
    this.inventarioService.obtenerEstadisticas().subscribe({
      next: (data) => {
        this.estadisticas = data;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
      }
    });
  }

  aplicarFiltros(): void {
    this.dispositivosFiltrados = this.dispositivos.filter(d => {
      const cumpleEstado = this.filtroEstado === 'todos' || d.estado === this.filtroEstado;
      const cumpleCategoria = this.filtroCategoria === 'todas' || d.categoria === this.filtroCategoria;
      const cumpleBusqueda = !this.filtroBusqueda || 
        d.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        d.marca?.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        d.modelo?.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        d.serial?.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        d.imei?.toLowerCase().includes(this.filtroBusqueda.toLowerCase());
      
      return cumpleEstado && cumpleCategoria && cumpleBusqueda;
    });
    this.paginaActual = 1;
  }

  get dispositivosPaginados(): Dispositivo[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.dispositivosFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.dispositivosFiltrados.length / this.itemsPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  getEstadoClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'disponible': 'estado-disponible',
      'entregado': 'estado-entregado',
      'dañado': 'estado-danado',
      'perdido': 'estado-perdido',
      'obsoleto': 'estado-obsoleto'
    };
    return clases[estado] || '';
  }

  getEstadoIcon(estado: string): string {
    const iconos: { [key: string]: string } = {
      'disponible': 'fa-check-circle',
      'entregado': 'fa-hand-holding',
      'dañado': 'fa-exclamation-triangle',
      'perdido': 'fa-question-circle',
      'obsoleto': 'fa-clock'
    };
    return iconos[estado] || 'fa-circle';
  }

  getCategoriaIcon(categoria: string): string {
    const iconos: { [key: string]: string } = {
      'celular': 'fa-mobile-alt',
      'tablet': 'fa-tablet-alt',
      'computador': 'fa-laptop',
      'cargador': 'fa-plug',
      'accesorio': 'fa-headphones',
      'otro': 'fa-box'
    };
    return iconos[categoria] || 'fa-box';
  }

  contarPorEstado(estado: string): number {
    return this.dispositivos.filter(d => d.estado === estado).length;
  }

  irAAgregar(): void {
    this.router.navigate(['/agregar-dispositivo']);
  }

  irAEntrega(): void {
    this.router.navigate(['/crear-acta']);
  }

  verDetalle(dispositivo: Dispositivo): void {
    this.router.navigate(['/dispositivo', dispositivo.id]);
  }

  editarDispositivo(dispositivo: Dispositivo): void {
    // Navega al detalle con el modo edición activado
    this.router.navigate(['/dispositivo', dispositivo.id], { queryParams: { editar: true } });
  }

  verTrazabilidad(dispositivo: Dispositivo): void {
    this.router.navigate(['/trazabilidad', dispositivo.id]);
  }

  cambiarEstado(dispositivo: Dispositivo): void {
    const nuevoEstado = prompt('Nuevo estado (disponible, dañado, perdido, obsoleto):');
    if (nuevoEstado && this.estados.includes(nuevoEstado)) {
      const motivo = prompt('Motivo del cambio:') || 'Cambio de estado';
      this.inventarioService.cambiarEstado(dispositivo.id!, nuevoEstado, motivo).subscribe({
        next: () => {
          this.cargarDispositivos();
          this.cargarEstadisticas();
        },
        error: (err) => {
          alert('Error al cambiar el estado');
          console.error(err);
        }
      });
    }
  }
}
