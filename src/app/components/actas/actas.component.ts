import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InventarioService } from '../../services/inventario.service';
import { ActaEntrega, DetalleActa } from '../../interfaces/inventario';

@Component({
  selector: 'app-actas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './actas.component.html',
  styleUrl: './actas.component.css'
})
export class ActasComponent implements OnInit {
  actas: ActaEntrega[] = [];
  actasFiltradas: ActaEntrega[] = [];
  actaSeleccionada: ActaEntrega | null = null;
  
  loading = false;
  loadingDetalle = false;
  error = '';

  // Filtros
  filtroEstado = 'todas';
  filtroBusqueda = '';

  // Modal de devolución
  mostrarModalDevolucion = false;
  devolucionActa: ActaEntrega | null = null;
  devoluciones: {
    detalle: DetalleActa;
    devolver: boolean;
    estadoDevolucion: string;
    condicionDevolucion: string;
    observaciones: string;
  }[] = [];
  observacionesDevolucion = '';
  loadingDevolucion = false;

  estados = ['activa', 'devuelta_parcial', 'devuelta_completa', 'vencida'];

  constructor(
    private inventarioService: InventarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarActas();
  }

  cargarActas(): void {
    this.loading = true;
    this.inventarioService.obtenerActas().subscribe({
      next: (data) => {
        this.actas = data;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las actas';
        this.loading = false;
        console.error(err);
      }
    });
  }

  aplicarFiltros(): void {
    this.actasFiltradas = this.actas.filter(acta => {
      const cumpleEstado = this.filtroEstado === 'todas' || acta.estado === this.filtroEstado;
      const cumpleBusqueda = !this.filtroBusqueda ||
        acta.numeroActa.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        acta.nombreReceptor.toLowerCase().includes(this.filtroBusqueda.toLowerCase());
      
      return cumpleEstado && cumpleBusqueda;
    });
  }

  verDetalle(acta: ActaEntrega): void {
    this.loadingDetalle = true;
    this.inventarioService.obtenerActaPorId(acta.id!).subscribe({
      next: (data) => {
        this.actaSeleccionada = data;
        this.loadingDetalle = false;
      },
      error: (err) => {
        console.error('Error al cargar detalle:', err);
        this.loadingDetalle = false;
      }
    });
  }

  cerrarDetalle(): void {
    this.actaSeleccionada = null;
  }

  getEstadoClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'activa': 'estado-activa',
      'devuelta_parcial': 'estado-parcial',
      'devuelta_completa': 'estado-completa',
      'vencida': 'estado-vencida'
    };
    return clases[estado] || '';
  }

  getEstadoIcon(estado: string): string {
    const iconos: { [key: string]: string } = {
      'activa': 'fa-clock',
      'devuelta_parcial': 'fa-exclamation-circle',
      'devuelta_completa': 'fa-check-circle',
      'vencida': 'fa-calendar-times'
    };
    return iconos[estado] || 'fa-circle';
  }

  getEstadoLabel(estado: string): string {
    const labels: { [key: string]: string } = {
      'activa': 'Activa',
      'devuelta_parcial': 'Devolución Parcial',
      'devuelta_completa': 'Devuelta',
      'vencida': 'Vencida'
    };
    return labels[estado] || estado;
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

  contarPendientes(acta: ActaEntrega): number {
    return acta.detalles?.filter(d => !d.devuelto).length || 0;
  }

  // Devolución
  abrirModalDevolucion(acta: ActaEntrega): void {
    this.devolucionActa = acta;
    this.devoluciones = (acta.detalles || [])
      .filter(d => !d.devuelto)
      .map(d => ({
        detalle: d,
        devolver: true,
        estadoDevolucion: 'disponible',
        condicionDevolucion: d.condicionEntrega || 'bueno',
        observaciones: ''
      }));
    this.observacionesDevolucion = '';
    this.mostrarModalDevolucion = true;
  }

  cerrarModalDevolucion(): void {
    this.mostrarModalDevolucion = false;
    this.devolucionActa = null;
    this.devoluciones = [];
  }

  registrarDevolucion(): void {
    if (!this.devolucionActa) return;

    const devolucionesARegistrar = this.devoluciones
      .filter(d => d.devolver)
      .map(d => ({
        detalleId: d.detalle.id!,
        estadoDevolucion: d.estadoDevolucion as 'disponible' | 'dañado' | 'perdido',
        condicionDevolucion: d.condicionDevolucion,
        observaciones: d.observaciones
      }));

    if (devolucionesARegistrar.length === 0) {
      alert('Debe seleccionar al menos un dispositivo para devolver');
      return;
    }

    this.loadingDevolucion = true;

    const formData = new FormData();
    formData.append('devoluciones', JSON.stringify(devolucionesARegistrar));
    formData.append('observacionesDevolucion', this.observacionesDevolucion);
    formData.append('Uid', localStorage.getItem('userId') || '');

    this.inventarioService.registrarDevolucion(this.devolucionActa.id!, formData).subscribe({
      next: () => {
        this.loadingDevolucion = false;
        this.cerrarModalDevolucion();
        this.cargarActas();
        alert('Devolución registrada exitosamente');
      },
      error: (err) => {
        this.loadingDevolucion = false;
        alert(err.error?.msg || 'Error al registrar la devolución');
      }
    });
  }

  irACrearActa(): void {
    this.router.navigate(['/crear-acta']);
  }

  irAInventario(): void {
    this.router.navigate(['/inventario']);
  }

  // Métodos para contar por estado (usados en el template)
  contarActivas(): number {
    return this.actas.filter(a => a.estado === 'activa').length;
  }

  contarParciales(): number {
    return this.actas.filter(a => a.estado === 'devuelta_parcial').length;
  }

  contarCompletas(): number {
    return this.actas.filter(a => a.estado === 'devuelta_completa').length;
  }
}
