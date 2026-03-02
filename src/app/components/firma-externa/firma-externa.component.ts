import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import SignaturePad from 'signature_pad';
import { environment } from '../../../environments/environment';

interface DispositivoActa {
  nombre: string;
  categoria: string;
  marca: string;
  modelo: string;
  serial: string;
  descripcion: string;
  condicion: string;
}

interface DatosActa {
  numeroActa: string;
  nombreReceptor: string;
  cargoReceptor: string;
  correoReceptor: string;
  fechaEntrega: Date;
  observaciones: string;
  dispositivos: DispositivoActa[];
}

@Component({
  selector: 'app-firma-externa',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './firma-externa.component.html',
  styleUrl: './firma-externa.component.css'
})
export class FirmaExternaComponent implements OnInit, AfterViewInit {
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;
  
  private signaturePad!: SignaturePad;
  private apiUrl = environment.apiUrl;
  
  token: string = '';
  datosActa: DatosActa | null = null;
  
  // Estados de la página
  cargando: boolean = true;
  error: string = '';
  yaFirmada: boolean = false;
  fechaFirmaExistente: Date | null = null;
  rechazada: boolean = false;
  motivoRechazoExistente: string = '';
  
  // Proceso de firma
  mostrarFirma: boolean = false;
  firmando: boolean = false;
  firmaVacia: boolean = true;
  modoFirma: 'dibujar' | 'subir' = 'dibujar';
  firmaImagenPreview: string = '';
  
  // Proceso de rechazo
  mostrarRechazo: boolean = false;
  motivoRechazo: string = '';
  rechazando: boolean = false;
  
  // Confirmación
  firmaExitosa: boolean = false;
  rechazoExitoso: boolean = false;
  fechaActual: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    
    if (!this.token) {
      this.error = 'Token no válido';
      this.cargando = false;
      return;
    }
    
    this.cargarDatosActa();
  }

  ngAfterViewInit(): void {
    // El signature pad se inicializa después de mostrar el panel de firma
  }

  cargarDatosActa(): void {
    this.http.get<DatosActa>(`${this.apiUrl}api/firma/publica/${this.token}`)
      .subscribe({
        next: (datos) => {
          this.datosActa = datos;
          this.cargando = false;
        },
        error: (err) => {
          this.cargando = false;
          
          if (err.status === 400) {
            if (err.error?.fechaFirma) {
              this.yaFirmada = true;
              this.fechaFirmaExistente = new Date(err.error.fechaFirma);
            } else if (err.error?.motivo) {
              this.rechazada = true;
              this.motivoRechazoExistente = err.error.motivo;
            }
            this.error = err.error?.msg || 'Este enlace ya no es válido';
          } else if (err.status === 404) {
            this.error = 'Enlace inválido o expirado';
          } else {
            this.error = 'Error al cargar los datos. Intente nuevamente.';
          }
        }
      });
  }

  mostrarPanelFirma(): void {
    this.mostrarFirma = true;
    this.mostrarRechazo = false;
    
    // Inicializar signature pad después de que el DOM se actualice
    setTimeout(() => {
      this.initSignaturePad();
    }, 100);
  }

  mostrarPanelRechazo(): void {
    this.mostrarRechazo = true;
    this.mostrarFirma = false;
  }

  cancelar(): void {
    this.mostrarFirma = false;
    this.mostrarRechazo = false;
    this.motivoRechazo = '';
  }

  private initSignaturePad(): void {
    if (!this.signatureCanvas) return;
    
    const canvas = this.signatureCanvas.nativeElement;
    
    // Configurar dimensiones fijas
    canvas.width = 500;
    canvas.height = 200;
    
    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)',
      minWidth: 1,
      maxWidth: 2.5
    });
    
    // Escuchar cambios en la firma
    this.signaturePad.addEventListener('beginStroke', () => {
      this.firmaVacia = false;
    });
  }

  limpiarFirma(): void {
    if (this.signaturePad) {
      this.signaturePad.clear();
      this.firmaVacia = true;
    }
  }

  confirmarFirma(): void {
    if (!this.signaturePad || this.signaturePad.isEmpty()) {
      alert('Debe dibujar su firma antes de confirmar');
      return;
    }
    
    this.firmando = true;
    const firmaBase64 = this.signaturePad.toDataURL('image/png');
    
    this.http.post(`${this.apiUrl}api/firma/publica/${this.token}/firmar`, {
      firma: firmaBase64
    }).subscribe({
      next: () => {
        this.firmando = false;
        this.firmaExitosa = true;
        this.mostrarFirma = false;
        this.fechaActual = this.formatearFecha(new Date());
      },
      error: (err) => {
        this.firmando = false;
        alert(err.error?.msg || 'Error al procesar la firma. Intente nuevamente.');
      }
    });
  }

  confirmarRechazo(): void {
    if (!this.motivoRechazo.trim()) {
      alert('Debe indicar el motivo por el cual devuelve el acta');
      return;
    }
    
    this.rechazando = true;
    
    this.http.post(`${this.apiUrl}api/firma/publica/${this.token}/rechazar`, {
      motivo: this.motivoRechazo
    }).subscribe({
      next: () => {
        this.rechazando = false;
        this.rechazoExitoso = true;
        this.mostrarRechazo = false;
      },
      error: (err) => {
        this.rechazando = false;
        alert(err.error?.msg || 'Error al procesar. Intente nuevamente.');
      }
    });
  }

  formatearFecha(fecha: Date | string): string {
    const f = new Date(fecha);
    return f.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDispositivoIcon(categoria: string): string {
    const iconos: { [key: string]: string } = {
      'laptop': 'fa-laptop',
      'computadora': 'fa-desktop',
      'desktop': 'fa-desktop',
      'monitor': 'fa-display',
      'teclado': 'fa-keyboard',
      'mouse': 'fa-computer-mouse',
      'impresora': 'fa-print',
      'telefono': 'fa-phone',
      'celular': 'fa-mobile-screen',
      'tablet': 'fa-tablet-screen-button',
      'router': 'fa-wifi',
      'servidor': 'fa-server',
      'cable': 'fa-ethernet',
      'audifonos': 'fa-headphones',
      'camara': 'fa-camera',
      'proyector': 'fa-video',
      'ups': 'fa-car-battery',
      'disco duro': 'fa-hard-drive',
      'usb': 'fa-usb'
    };
    const cat = (categoria || '').toLowerCase();
    return iconos[cat] || 'fa-box';
  }

  cambiarModoFirma(modo: 'dibujar' | 'subir'): void {
    this.modoFirma = modo;
    if (modo === 'dibujar') {
      setTimeout(() => this.initSignaturePad(), 100);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.procesarArchivoFirma(files[0]);
    }
  }

  onFirmaImagenSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.procesarArchivoFirma(input.files[0]);
    }
  }

  private procesarArchivoFirma(file: File): void {
    const tiposPermitidos = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!tiposPermitidos.includes(file.type)) {
      alert('Formato no permitido. Use PNG, JPG o JPEG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.firmaImagenPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  limpiarFirmaImagen(): void {
    this.firmaImagenPreview = '';
  }

  confirmarFirmaImagen(): void {
    if (!this.firmaImagenPreview) {
      alert('Debe subir una imagen de su firma antes de confirmar');
      return;
    }

    this.firmando = true;

    this.http.post(`${this.apiUrl}api/firma/publica/${this.token}/firmar`, {
      firma: this.firmaImagenPreview
    }).subscribe({
      next: () => {
        this.firmando = false;
        this.firmaExitosa = true;
        this.mostrarFirma = false;
        this.fechaActual = this.formatearFecha(new Date());
      },
      error: (err) => {
        this.firmando = false;
        alert(err.error?.msg || 'Error al procesar la firma. Intente nuevamente.');
      }
    });
  }
}
