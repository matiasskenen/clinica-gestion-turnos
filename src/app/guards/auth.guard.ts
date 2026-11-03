import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { UsuariosService } from '../services/usuarios/usuarios.service';

/**
 * Guard que asegura que el usuario esté autenticado.
 */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  const currentUser = await firstValueFrom(user(auth).pipe(take(1)));
  if (currentUser) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

/**
 * Guard que asegura que el usuario tenga rol de Administrador.
 */
export const adminGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const userService = inject(UsuariosService);

  const currentUser = await firstValueFrom(user(auth).pipe(take(1)));
  if (!currentUser || !currentUser.email) {
    router.navigate(['/login']);
    return false;
  }

  const admins = await firstValueFrom(userService.getEspecialistas('admins').pipe(take(1)));
  if (admins.some((a: any) => a.email === currentUser.email)) {
    return true;
  }

  router.navigate(['/home']);
  return false;
};

/**
 * Guard que asegura que el usuario tenga rol de Especialista habilitado.
 */
export const especialistaGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const userService = inject(UsuariosService);

  const currentUser = await firstValueFrom(user(auth).pipe(take(1)));
  if (!currentUser || !currentUser.email) {
    router.navigate(['/login']);
    return false;
  }

  const especialistas = await firstValueFrom(userService.getEspecialistas('especialistas').pipe(take(1)));
  const match = especialistas.find((e: any) => e.email === currentUser.email);
  if (match && match.verificado) {
    return true;
  }

  router.navigate(['/home']);
  return false;
};

/**
 * Guard que asegura que el usuario tenga rol de Paciente.
 */
export const pacienteGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const userService = inject(UsuariosService);

  const currentUser = await firstValueFrom(user(auth).pipe(take(1)));
  if (!currentUser || !currentUser.email) {
    router.navigate(['/login']);
    return false;
  }

  const pacientes = await firstValueFrom(userService.getEspecialistas('pacientes').pipe(take(1)));
  if (pacientes.some((p: any) => p.email === currentUser.email)) {
    return true;
  }

  router.navigate(['/home']);
  return false;
};

