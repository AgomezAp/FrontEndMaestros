import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import SignaturePad from 'signature_pad';
import { InventarioService } from '../../services/inventario.service';
import { Dispositivo, CrearActaRequest } from '../../interfaces/inventario';

@Component({
  selector: 'app-crear-acta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-acta.component.html',
  styleUrls: ['./crear-acta.component.css']
})
export class CrearActaComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('signaturePadCanvas') signaturePadCanvas!: ElementRef<HTMLCanvasElement>;
  signaturePad!: SignaturePad;
  private resizeHandler = () => this.resizeCanvas();

  // Datos del receptor
  receptor = {
    nombre: '',
    cargo: '',
    correo: ''
  };

  observacionesEntrega = '';

  // Dispositivos
  dispositivosDisponibles: Dispositivo[] = [];
  dispositivosSeleccionados: {
    dispositivo: Dispositivo;
    condicion: string;
    observaciones: string;
    fotos: File[];
    fotosPreview: string[];
  }[] = [];

  loading = false;
  loadingDispositivos = false;
  errorMessage = '';
  successMessage = '';
  firmado = false;

  condiciones = [
    { value: 'nuevo', label: 'Nuevo' },
    { value: 'bueno', label: 'Bueno' },
    { value: 'regular', label: 'Regular' },
    { value: 'malo', label: 'Malo' }
  ];

  constructor(
    private inventarioService: InventarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDispositivosDisponibles();
  }

  ngAfterViewInit(): void {
    // Esperar a que el DOM esté completamente renderizado
    setTimeout(() => this.initSignaturePad(), 100);
    
    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy(): void {
    // Limpiar el event listener al destruir el componente
    window.removeEventListener('resize', this.resizeHandler);
  }

  initSignaturePad(): void {
    if (this.signaturePadCanvas) {
      const canvas = this.signaturePadCanvas.nativeElement;
      
      // Obtener el contenedor padre para calcular el ancho correcto
      const container = canvas.parentElement;
      const width = container ? container.clientWidth - 40 : 600; // 40px de padding
      const height = 200;
      
      // Establecer dimensiones físicas del canvas
      canvas.width = width;
      canvas.height = height;
      
      // Establecer dimensiones CSS para que coincidan
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      
      this.signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
        minWidth: 1,
        maxWidth: 3
      });
      
      // Limpiar para aplicar el fondo blanco
      this.signaturePad.clear();
    }
  }

  resizeCanvas(): void {
    if (!this.signaturePadCanvas || !this.signaturePad) return;
    
    const canvas = this.signaturePadCanvas.nativeElement;
    const container = canvas.parentElement;
    const width = container ? container.clientWidth - 40 : 600;
    const height = 200;
    
    // Guardar datos actuales si hay firma
    const data = this.signaturePad.toData();
    
    // Redimensionar
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    // Limpiar y restaurar datos
    this.signaturePad.clear();
    if (data && data.length > 0) {
      this.signaturePad.fromData(data);
    }
  }

  cargarDispositivosDisponibles(): void {
    this.loadingDispositivos = true;
    this.inventarioService.obtenerDisponibles().subscribe({
      next: (data) => {
        this.dispositivosDisponibles = data;
        this.loadingDispositivos = false;
      },
      error: (err) => {
        console.error('Error al cargar dispositivos:', err);
        this.loadingDispositivos = false;
      }
    });
  }

  agregarDispositivo(dispositivo: Dispositivo): void {
    // Verificar que no esté ya seleccionado
    if (this.dispositivosSeleccionados.find(d => d.dispositivo.id === dispositivo.id)) {
      return;
    }

    this.dispositivosSeleccionados.push({
      dispositivo,
      condicion: dispositivo.condicion || 'bueno',
      observaciones: '',
      fotos: [],
      fotosPreview: []
    });

    // Remover de disponibles
    this.dispositivosDisponibles = this.dispositivosDisponibles.filter(d => d.id !== dispositivo.id);
  }

  quitarDispositivo(index: number): void {
    const item = this.dispositivosSeleccionados[index];
    this.dispositivosDisponibles.push(item.dispositivo);
    this.dispositivosSeleccionados.splice(index, 1);
  }

  onFotosSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      const item = this.dispositivosSeleccionados[index];

      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 10 * 1024 * 1024) continue;
        if (item.fotos.length >= 5) break;

        item.fotos.push(file);

        const reader = new FileReader();
        reader.onload = (e) => {
          item.fotosPreview.push(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  eliminarFoto(itemIndex: number, fotoIndex: number): void {
    const item = this.dispositivosSeleccionados[itemIndex];
    item.fotos.splice(fotoIndex, 1);
    item.fotosPreview.splice(fotoIndex, 1);
  }

  limpiarFirma(): void {
    this.signaturePad.clear();
    this.firmado = false;
  }

  onFirmaEnd(): void {
    this.firmado = !this.signaturePad.isEmpty();
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

  validarFormulario(): boolean {
    if (!this.receptor.nombre.trim()) {
      this.errorMessage = 'El nombre del receptor es requerido';
      return false;
    }
    if (!this.receptor.cargo.trim()) {
      this.errorMessage = 'El cargo del receptor es requerido';
      return false;
    }
    if (this.dispositivosSeleccionados.length === 0) {
      this.errorMessage = 'Debe seleccionar al menos un dispositivo';
      return false;
    }
    if (this.signaturePad.isEmpty()) {
      this.errorMessage = 'La firma del receptor es requerida';
      return false;
    }
    return true;
  }

  crearActa(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();

    // Datos del receptor
    formData.append('nombreReceptor', this.receptor.nombre);
    formData.append('cargoReceptor', this.receptor.cargo);
    formData.append('correoReceptor', this.receptor.correo);
    formData.append('firmaReceptor', this.signaturePad.toDataURL());
    
    if (this.observacionesEntrega) {
      formData.append('observacionesEntrega', this.observacionesEntrega);
    }
    
    formData.append('Uid', localStorage.getItem('userId') || '');
    formData.append('tipoUpload', 'entregas');

    // Dispositivos
    const dispositivos = this.dispositivosSeleccionados.map(item => ({
      dispositivoId: item.dispositivo.id,
      condicionEntrega: item.condicion,
      observaciones: item.observaciones
    }));
    formData.append('dispositivos', JSON.stringify(dispositivos));

    // Fotos de cada dispositivo
    this.dispositivosSeleccionados.forEach((item) => {
      item.fotos.forEach((foto) => {
        formData.append(`fotos_${item.dispositivo.id}`, foto);
      });
    });

    this.inventarioService.crearActaEntrega(formData).subscribe({
      next: (response) => {
        this.successMessage = `Acta ${response.acta.numeroActa} creada exitosamente`;
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/actas']);
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Error al crear el acta de entrega';
        this.loading = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/inventario']);
  }
}
