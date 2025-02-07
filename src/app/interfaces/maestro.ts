import { User } from './user';

export interface Maestro {
  Mid: number;
  nombre: string;
  NombreMaestro: string;
  maestroRecibido:string;
  firmaEntrega: string;
  firmaRecibe: string;
  descripcionEntrega: string;
  descripcionRecibe: string;
  Uid: number;
  nombreCompletoRecibe: string;
  estado: string;
  region: string;
  marca: string;
  modelo: string;
  imei: string;
  fechaRecibe: Date;
  fechaEntrega: Date;
  usuarios: User;

}
export interface MaestroEdicion {
  Mid: number;
  nombre: string;
  NombreMaestro: string;
  maestroRecibido:string;
  firmaEntrega: string;
  firmaRecibe: string;
  descripcionEntrega: string;
  descripcionRecibe: string;
  Uid: number;
  nombreCompletoRecibe: string;
  estado: string;
  region: string;
  marca: string;
  modelo: string;
  imei: string;
  fechaRecibido: Date;
  fechaEntregado: Date;
  editing?: boolean;
}
