import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private userVerificado = new BehaviorSubject<boolean>(false);
  userVerificado$ = this.userVerificado.asObservable(); // Observable para escuchar cambios

  private userSource = new BehaviorSubject<any>(null); // Inicializamos con null
  currentUser = this.userSource.asObservable();
  user : string = "";

  constructor() {}

  setUser(user: any) {
    this.userSource.next(user);
    this.user = user;
  }

  getUser()
  {
    return this.user
  }

  getUserNow(): Observable<any> {
    return this.currentUser;

  }

  setUserVerificado(value: boolean): void {
    this.userVerificado.next(value);
  }

  getVerificado(): boolean {
    return this.userVerificado.getValue();
  }
}
