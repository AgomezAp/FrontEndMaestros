import { User } from './user';

export interface Maestro {
  Mid: number;
  NombreMaestro: string;
  firma: string;
  descripcion: string;
  Uid: number;
  estado: string;
  region: string;
  marca: string;
  modelo: string;
  imei: string;
  fecha: Date;
usuarios: User;

}
export interface MaestroEdicion {
  Mid: number;
  NombreMaestro: string;
  firma: string;
  descripcion: string;
  Uid: number;
  estado: string;
  region: string;
  marca: string;
  modelo: string;
  imei: string;
  fecha: Date;
  editing?: boolean;
}
