import { User } from './user';

export interface MaestroEntregado {
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