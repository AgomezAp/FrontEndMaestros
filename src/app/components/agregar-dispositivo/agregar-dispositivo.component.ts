import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InventarioService } from '../../services/inventario.service';
import { Dispositivo } from '../../interfaces/inventario';

@Component({
  selector: 'app-agregar-dispositivo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agregar-dispositivo.component.html',
  styleUrl: './agregar-dispositivo.component.css'
})
export class AgregarDispositivoComponent {
  dispositivo: Partial<Dispositivo> = {
    nombre: '',
    categoria: 'celular',
    marca: '',
    modelo: '',
    serial: '',
    imei: '',
    color: '',
    descripcion: '',
    condicion: 'bueno',
    ubicacion: 'Almacén Principal',
    observaciones: ''
  };

  fotos: File[] = [];
  fotosPreview: string[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  categorias = [
    { value: 'celular', label: 'Celular', icon: 'fa-mobile-alt' },
    { value: 'tablet', label: 'Tablet', icon: 'fa-tablet-alt' },
    { value: 'computador', label: 'Computador', icon: 'fa-laptop' },
    { value: 'cargador', label: 'Cargador', icon: 'fa-plug' },
    { value: 'accesorio', label: 'Accesorio', icon: 'fa-headphones' },
    { value: 'otro', label: 'Otro', icon: 'fa-box' }
  ];

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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      
      // Validar que no excedan 10 fotos
      if (this.fotos.length + files.length > 10) {
        this.errorMessage = 'Máximo 10 fotos permitidas';
        return;
      }

      for (const file of files) {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          this.errorMessage = 'Solo se permiten archivos de imagen';
          continue;
        }

        // Validar tamaño (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          this.errorMessage = 'Las imágenes no deben superar 10MB';
          continue;
        }

        this.fotos.push(file);

        // Crear preview
        const reader = new FileReader();
        reader.onload = (e) => {
          this.fotosPreview.push(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
      this.errorMessage = '';
    }
  }

  eliminarFoto(index: number): void {
    this.fotos.splice(index, 1);
    this.fotosPreview.splice(index, 1);
  }

  requiereIMEI(): boolean {
    return this.dispositivo.categoria === 'celular' || this.dispositivo.categoria === 'tablet';
  }

  validarFormulario(): boolean {
    if (!this.dispositivo.nombre?.trim()) {
      this.errorMessage = 'El nombre es requerido';
      return false;
    }
    if (!this.dispositivo.categoria) {
      this.errorMessage = 'La categoría es requerida';
      return false;
    }
    return true;
  }

  guardarDispositivo(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    
    // Agregar datos del dispositivo
    Object.keys(this.dispositivo).forEach(key => {
      const value = (this.dispositivo as any)[key];
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    });

    // Agregar usuario
    formData.append('Uid', localStorage.getItem('userId') || '');
    formData.append('tipoUpload', 'dispositivos');

    // Agregar fotos
    this.fotos.forEach((foto) => {
      formData.append('fotos', foto);
    });

    this.inventarioService.registrarDispositivo(formData).subscribe({
      next: (response) => {
        this.successMessage = 'Dispositivo registrado exitosamente';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/inventario']);
        }, 1500);
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || 'Error al registrar el dispositivo';
        this.loading = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/inventario']);
  }
}
