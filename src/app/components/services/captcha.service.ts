import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CaptchaService {
  // Usamos BehaviorSubject para poder emitir el estado actual a los suscriptores.
  private captchaEnabledSubject = new BehaviorSubject<boolean>(true); // Por defecto, el captcha está habilitado.
  captchaEnabled$ = this.captchaEnabledSubject.asObservable();

  constructor() {}

  // Método para habilitar o deshabilitar el captcha
  setCaptchaEnabled(enabled: boolean) {
    this.captchaEnabledSubject.next(enabled);
  }

  // Método para obtener el estado actual del captcha
  getCaptchaEnabled(): boolean {
    return this.captchaEnabledSubject.getValue();
  }
}
