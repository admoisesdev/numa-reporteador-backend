import { empresas as Company } from '@prisma/client';

export interface UserCompany {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
  roles: string[];
  empresas: Company[];
}
