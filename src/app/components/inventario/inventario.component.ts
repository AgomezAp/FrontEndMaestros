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
  filtroCondicion = 'todas';
  filtroBusqueda = '';

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 10;

  // Categorías disponibles
  categorias = ['celular', 'tablet', 'computador', 'cargador', 'accesorio', 'otro'];
  estados = ['disponible', 'prestado', 'dañado', 'perdido', 'obsoleto'];
  condiciones = ['nuevo', 'bueno', 'regular', 'malo'];

  // Suscripciones WebSocket
  private subscriptions: Subscription[] = [];
  
  // Debounce para búsqueda
  private debounceTimer: any;
  private debounceDelay = 300; // ms

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
    // Limpiar el debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
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
      // Mapear 'prestado' a 'entregado' para comparación
      const estadoFiltro = this.filtroEstado === 'prestado' ? 'entregado' : this.filtroEstado;
      const cumpleEstado = this.filtroEstado === 'todos' || d.estado === estadoFiltro;
      const cumpleCategoria = this.filtroCategoria === 'todas' || d.categoria === this.filtroCategoria;
      const cumpleCondicion = this.filtroCondicion === 'todas' || d.condicion === this.filtroCondicion;
      const cumpleBusqueda = !this.filtroBusqueda || 
        d.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        d.marca?.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        d.modelo?.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        d.serial?.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        d.imei?.toLowerCase().includes(this.filtroBusqueda.toLowerCase());
      
      return cumpleEstado && cumpleCategoria && cumpleCondicion && cumpleBusqueda;
    });
    this.paginaActual = 1;
    // Actualizar estadísticas visuales después de filtrar
    this.actualizarEstadisticasVisuales();
  }

  // Método para actualizar las estadísticas visuales
  actualizarEstadisticasVisuales(): void {
    // Este método simplemente notifica a Angular que hay cambios
    // Las vistas se actualizarán automáticamente a través de los getters dinámicos
  }

  // Método para aplicar filtros con debounce en la búsqueda
  onBusquedaChange(): void {
    // Limpiar el timer anterior si existe
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    // Establecer un nuevo timer para aplicar los filtros después del delay
    this.debounceTimer = setTimeout(() => {
      this.aplicarFiltros();
    }, this.debounceDelay);
  }

  // Método para cambios de estado y categoría (sin debounce)
  onFiltroChange(): void {
    this.aplicarFiltros();
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
      'prestado': 'estado-prestado',
      'dañado': 'estado-danado',
      'perdido': 'estado-perdido',
      'obsoleto': 'estado-obsoleto'
    };
    return clases[estado] || '';
  }

  getEstadoIcon(estado: string): string {
    const iconos: { [key: string]: string } = {
      'disponible': 'fa-check-circle',
      'prestado': 'fa-hand-holding',
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
    // Mapeo de 'prestado' a 'entregado' en la BD si es necesario
    const estadoMapeado = estado === 'prestado' ? 'entregado' : estado;
    return this.dispositivos.filter(d => d.estado === estadoMapeado).length;
  }

  // Métodos para obtener estadísticas dinámicas (basadas en filtros)
  getTotalFiltrado(): number {
    return this.dispositivosFiltrados.length;
  }

  getDisponiblesFiltrado(): number {
    return this.dispositivosFiltrados.filter(d => d.estado === 'disponible').length;
  }

  getPrestadosFiltrado(): number {
    return this.dispositivosFiltrados.filter(d => d.estado === 'entregado').length;
  }

  getDaniadosFiltrado(): number {
    return this.dispositivosFiltrados.filter(d => d.estado === 'dañado').length;
  }

  getPerdidosFiltrado(): number {
    return this.dispositivosFiltrados.filter(d => d.estado === 'perdido').length;
  }

  getObsoletosFiltrado(): number {
    return this.dispositivosFiltrados.filter(d => d.estado === 'obsoleto').length;
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
    const nuevoEstado = prompt('Nuevo estado (disponible, prestado, dañado, perdido, obsoleto):');
    if (nuevoEstado && this.estados.includes(nuevoEstado)) {
      const motivo = prompt('Motivo del cambio:') || 'Cambio de estado';
      // Mapear 'prestado' a 'entregado' para el backend
      const estadoParaBackend = nuevoEstado === 'prestado' ? 'entregado' : nuevoEstado;
      this.inventarioService.cambiarEstado(dispositivo.id!, estadoParaBackend, motivo).subscribe({
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
