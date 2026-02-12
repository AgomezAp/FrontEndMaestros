import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { InventarioService } from '../../services/inventario.service';
import { WebsocketService } from '../../services/websocket.service';
import { Dispositivo, EstadisticasInventario } from '../../interfaces/inventario';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit, OnDestroy {
  dispositivos: Dispositivo[] = [];
  dispositivosFiltrados: Dispositivo[] = [];
  estadisticas: EstadisticasInventario | null = null;
  loading = false;
  error = '';

  // Modal eliminar
  mostrarModalEliminar = false;
  dispositivoAEliminar: Dispositivo | null = null;
  eliminando = false;

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

  // Suscripciones WebSocket
  private subscriptions: Subscription[] = [];

  constructor(
    private inventarioService: InventarioService,
    private websocketService: WebsocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDispositivos();
    this.cargarEstadisticas();
    this.conectarWebSocket();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private conectarWebSocket(): void {
    // Unirse a la sala de inventario
    this.websocketService.joinRoom('inventario');

    // Suscribirse a eventos de dispositivos
    this.subscriptions.push(
      this.websocketService.onDispositivoCreated().subscribe(dispositivo => {
        console.log('📦 Nuevo dispositivo creado:', dispositivo);
        this.cargarDispositivos();
        this.cargarEstadisticas();
      })
    );

    this.subscriptions.push(
      this.websocketService.onDispositivoUpdated().subscribe(data => {
        console.log('📦 Dispositivo actualizado:', data);
        this.cargarDispositivos();
        this.cargarEstadisticas();
      })
    );

    this.subscriptions.push(
      this.websocketService.onDispositivoDeleted().subscribe(data => {
        console.log('📦 Dispositivo eliminado:', data);
        this.cargarDispositivos();
        this.cargarEstadisticas();
      })
    );
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

  abrirModalEliminar(dispositivo: Dispositivo): void {
    this.dispositivoAEliminar = dispositivo;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar(): void {
    this.mostrarModalEliminar = false;
    this.dispositivoAEliminar = null;
  }

  confirmarEliminar(): void {
    if (!this.dispositivoAEliminar) return;
    
    this.eliminando = true;
    
    this.inventarioService.eliminarDispositivo(this.dispositivoAEliminar.id!).subscribe({
      next: () => {
        this.eliminando = false;
        this.cerrarModalEliminar();
        alert('Dispositivo eliminado exitosamente');
        this.cargarDispositivos();
        this.cargarEstadisticas();
      },
      error: (err) => {
        this.eliminando = false;
        alert(err.error?.msg || 'Error al eliminar el dispositivo');
        console.error(err);
      }
    });
  }
}
