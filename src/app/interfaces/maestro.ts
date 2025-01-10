import { User } from './user';

export interface Maestro {
  Mid: number;
  nombre: string;
  apellido: string;
  nombreMaestro: string;
  correo: string;
  cedula: string;
  firma: string;
  descripcion: string;
  Uid: number;
  estado: string;
  region: string;
  marca: string;
  modelo: string;
  usuarios: User;

}
export interface MaestroEdicion {
  Mid: number;
  nombre: string;
  apellido: string;
  NombreMaestro: string;
  correo: string;
  cedula: string;
  firma: string;
  descripcion: string;
  Uid: number;
  estado: string;
  region: string;
  marca: string;
  modelo: string;
  editing?: boolean;
}
