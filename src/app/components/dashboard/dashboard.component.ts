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
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import { MaestroEdicion } from '../../interfaces/maestro';
import { MaestroService } from '../../services/maestro.service';
import { UserService } from '../../services/user.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  imports: [NavbarComponent,CommonModule,FormsModule],
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
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  maestros: any[] = [];
  userId: string = localStorage.getItem('userId') || '0';
  loading: boolean = true;
  currentPage: number = 1;
  itemsPerPage: number = 5;
  
  constructor(private userService: UserService,private router: Router,private toastr: ToastrService,private maestroService: MaestroService) {}

  ngOnInit(): void {
    this.obtenerMaestros();
  }

  obtenerMaestros(): void {
    this.userService.obtenerMaestrosPorIdUsuario(this.userId).subscribe(
      (data:any) => {
        console.log('Respuesta del servicio:', data);
        if (data && Array.isArray(data.maestros)) {
          this.maestros = data.maestros;
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
  
  get paginatedMaestros(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.maestros.slice(startIndex, endIndex);
  }
  nextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.maestros.length) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  navigateToAddMaestro(): void {
    this.router.navigate(['/agregarMaestro']);
  }
  toggleEdit(maestro: MaestroEdicion): void {
    if (maestro.editing) {
      // Guardar cambios
      this.maestroService.actualizarMaestro(maestro.Mid, maestro).subscribe(
        (response) => {
          console.log('Maestro actualizado', response);
          maestro.editing = false;
        },
        (error) => {
          console.error('Error al actualizar el maestro', error);
        }
      );
    } else {
      // Habilitar edición
      maestro.editing = true;
    }
  }


  deleteMaestro(Mid: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción es irreparable',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.maestroService.BorrarMaestroId(Mid).subscribe({
          next: () => {
            this.toastr.success('Maestro eliminado con éxito', 'Éxito');
            this.obtenerMaestros(); // Actualizar la lista de maestros
            this.loading = false;
          },
          error: (err) => {
            this.toastr.error('Error al eliminar el maestro', 'Error');
            this.loading = false;
          }
        });
      }
    });
  }
}
