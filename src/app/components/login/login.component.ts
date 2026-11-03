import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Auth, signInWithEmailAndPassword, user } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  collectionData,
  setDoc,
  DocumentData,
  doc,
  addDoc,
} from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { orderBy, query, where, getDocs } from 'firebase/firestore';
import { forkJoin, Observable, Subscription, firstValueFrom } from 'rxjs';
import { DataService } from '../../services/authUsers/data.service';
import { map, take } from 'rxjs/operators';
import { signOut, User } from 'firebase/auth';
import { TurnosService } from '../../services/turnos/turnos.service';
import { NgxCaptchaModule } from 'ngx-captcha';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxCaptchaModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  animations: [
    trigger('routeAnimations', [
      transition('HomePage => LoginPage', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ]),
    ])
  ]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loginError: boolean = false;

  isLoading = false;
  flagError: boolean = false;
  msjError: string = '';

  role: string = '';

  siteKey : string = "6Lfpl44qAAAAAGbb4Wz0Ns6TdgnDG4YjaStxk3rp"
  verficado = false;

  users = [
    { name: 'sigak61149@cpaurl.com', role: 'Paciente', image: 'https://firebasestorage.googleapis.com/v0/b/tplabo4final.firebasestorage.app/o/pacientes%2Flucasperfil4.PNG?alt=media&token=89ce458e-cd93-4ed1-a358-9c36b5d9bc8a' },
    { name: 'hevame6403@exoular.com', role: 'Paciente', image: 'https://firebasestorage.googleapis.com/v0/b/tplabo4final.firebasestorage.app/o/pacientes%2Flucasperfil.PNG?alt=media&token=83d2a4ec-86df-47eb-8dba-49a16ed8bd20' },
    { name: 'micaela@gmail.com', role: 'Paciente', image: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { name: 'nohiy55680@exoular.com', role: 'Especialista', image: 'https://firebasestorage.googleapis.com/v0/b/tplabo4final.firebasestorage.app/o/images%2Ffotodoctor1.PNG?alt=media&token=21bd5ccc-67ef-4941-9d34-a235fe538197' },
    { name: 'sipavag916@cpaurl.com', role: 'Especialista', image: 'https://firebasestorage.googleapis.com/v0/b/tplabo4final.firebasestorage.app/o/images%2Ffotodoctor2.PNG?alt=media&token=5807ca68-5ea3-45d8-b9e4-7af5c00fab09' },
    { name: 'matias.skenen@gmail.com', role: 'Admin', image: 'https://firebasestorage.googleapis.com/v0/b/tplabo4final.firebasestorage.app/o/images%2Ffotoperfiladmin.PNG?alt=media&token=926b0854-0d85-4a7a-bf18-311b806654f4' },
  ];

  constructor(
    private auth: Auth,
    private router: Router,
    private userService: DataService,
    private firestore: Firestore,
    private turnos: TurnosService,
  ) {}

  async loginUser() {
    this.role = '';
    this.verficado = false;
    this.flagError = false;
    this.msjError = '';
    this.userService.setUserVerificado(false);

    try {
      this.isLoading = true;
      const res = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      if (!res.user || !res.user.email) {
        throw new Error('Usuario inválido');
      }

      await this.verificarRoles();
      await this.verificarEspecialistaVerificado();

      this.isLoading = false;

      if (this.role === 'admin') {
        this.userService.setUser(this.email);
        this.userService.setUserVerificado(true);
        this.turnos.sendLogLogin(this.email);
        Swal.fire({
          title: '¡Éxito!',
          text: 'Bienvenido Administrador.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.router.navigate(['/home']);
        return;
      }

      if (this.role === 'paciente') {
        if (!res.user.emailVerified) {
          await signOut(this.auth);
          this.flagError = true;
          this.msjError = 'El usuario no está verificado por correo electrónico.';
          Swal.fire({
            title: 'Error!',
            text: this.msjError,
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
          return;
        }

        this.userService.setUser(this.email);
        this.userService.setUserVerificado(true);
        this.turnos.sendLogLogin(this.email);
        Swal.fire({
          title: '¡Éxito!',
          text: 'Bienvenido Paciente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.router.navigate(['/home']);
        return;
      }

      if (this.role === 'especialista') {
        if (!res.user.emailVerified) {
          await signOut(this.auth);
          this.flagError = true;
          this.msjError = 'El especialista no está verificado por correo electrónico.';
          Swal.fire({
            title: 'Error!',
            text: this.msjError,
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
          return;
        }

        if (!this.verficado) {
          await signOut(this.auth);
          this.flagError = true;
          this.msjError = 'El especialista aún no fue habilitado por el Administrador.';
          Swal.fire({
            title: 'Error!',
            text: this.msjError,
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
          return;
        }

        this.userService.setUser(this.email);
        this.actualizarEstadoVerificacion(res.user);
        this.userService.setUserVerificado(true);
        this.turnos.sendLogLogin(this.email);
        Swal.fire({
          title: '¡Éxito!',
          text: 'Bienvenido Especialista.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.router.navigate(['/perfilEspecialista']);
        return;
      }

      // Si no coincide ningún rol conocido
      await signOut(this.auth);
      this.flagError = true;
      this.msjError = 'No se encontró un rol asignado para este usuario.';
      Swal.fire({
        title: 'Error!',
        text: this.msjError,
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    } catch (e: any) {
      this.isLoading = false;
      this.flagError = true;
      this.handleLoginError(e);
      await signOut(this.auth).catch(() => {});
    }
  }

  handleLoginError(error: any) {
    console.log(error);
    switch (error.code) {
      case 'auth/invalid-credential':
        this.msjError = 'Credenciales Incorrectas';
        break;
      case 'auth/weak-password':
        this.msjError = 'Contraseña demasiado corta.';
        break;
      case 'auth/invalid-email':
        this.msjError = 'Correo electrónico no válido.';
        break;
      case 'auth/email-already-in-use':
        this.msjError = 'El correo electrónico ya está en uso.';
        break;
      case 'auth/user-not-found':
        this.msjError = 'No se encontró ningún usuario con este correo.';
        break;
      case 'auth/wrong-password':
        this.msjError = 'Credenciales Inválidas.';
        break;
      default:
        this.msjError = error.message || ('Error: ' + error.code);
        break;
    }
  }

  autocompletar(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  actualizarEstadoVerificacion(user: User) {
    const userRef = doc(this.firestore, 'usuarios', user.uid);
    setDoc(
      userRef,
      {
        emailVerified: user.emailVerified,
      },
      { merge: true },
    )
      .then(() => {
        console.log('Estado de verificación actualizado en Firestore');
      })
      .catch((error) => {
        console.log(
          'Error al actualizar el estado de verificación en Firestore: ',
          error,
        );
      });
  }

  async verificarEspecialistaVerificado(): Promise<void> {
    try {
      const data = await firstValueFrom(this.turnos.getEspecialistas().pipe(take(1)));
      const especialista = data.find((e: any) => e.email === this.email);
      if (especialista) {
        this.verficado = Boolean(especialista.verificado);
        if (!this.role) {
          this.role = 'especialista';
        }
      }
    } catch (error) {
      console.error('Error al verificar especialista:', error);
    }
  }

  async verificarRoles(): Promise<void> {
    await this.verificarPacientes();
    if (!this.role) {
      await this.verificarAdmins();
    }
  }

  async verificarPacientes(): Promise<void> {
    try {
      const data = await firstValueFrom(this.turnos.getUsuarios().pipe(take(1)));
      const paciente = data.find((p: any) => p.email === this.email);
      if (paciente) {
        this.role = 'paciente';
      }
    } catch (error) {
      console.error('Error al verificar paciente:', error);
    }
  }

  async verificarAdmins(): Promise<void> {
    try {
      const data = await firstValueFrom(this.turnos.getAdmins().pipe(take(1)));
      const admin = data.find((a: any) => a.email === this.email);
      if (admin) {
        this.role = 'admin';
      }
    } catch (error) {
      console.error('Error al verificar admin:', error);
    }
  }
}
