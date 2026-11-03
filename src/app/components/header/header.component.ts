import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services/authUsers/data.service';
import { Auth, signOut } from '@angular/fire/auth';
import { TurnosService } from '../../services/turnos/turnos.service';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { Subscription, firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnDestroy {
  user: any;
  perfil: any;
  private authUnsubscribe?: () => void;
  private subs: Subscription = new Subscription();

  constructor(
    private router: Router,
    private authService: DataService,
    private auth: Auth,
    private userService: UsuariosService,
    private turnos: TurnosService,
  ) {
    this.checkUser();
  }

  ngOnDestroy(): void {
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
    }
    this.subs.unsubscribe();
  }

  checkUser(): void {
    this.authUnsubscribe = this.auth.onAuthStateChanged(async (user) => {
      if (user && user.email) {
        this.user = user.email;
        await this.detectPerfil(user.email);
      } else {
        this.user = '';
        this.perfil = '';
      }
    });
  }

  async detectPerfil(email: string): Promise<void> {
    try {
      const admins = await firstValueFrom(this.userService.getEspecialistas('admins').pipe(take(1)));
      if (admins.some((item: any) => item.email === email)) {
        this.perfil = 'admin';
        return;
      }

      const especialistas = await firstValueFrom(this.userService.getEspecialistas('especialistas').pipe(take(1)));
      if (especialistas.some((item: any) => item.email === email)) {
        this.perfil = 'especialista';
        return;
      }

      const pacientes = await firstValueFrom(this.userService.getEspecialistas('pacientes').pipe(take(1)));
      if (pacientes.some((item: any) => item.email === email)) {
        this.perfil = 'paciente';
        return;
      }
    } catch (e) {
      console.error('Error al detectar perfil:', e);
    }
  }

  navigateTo(route: string) {
    switch (route) {
      case 'home': this.router.navigate(['/home']); break;
      case 'login': this.router.navigate(['/login']); break;
      case 'register': this.router.navigate(['/register']); break;
      case 'turnoPaciente': this.router.navigate(['/turnoPaciente']); break;
      case 'turnosEspecialistas': this.router.navigate(['/turnosEspecialistas']); break;
      case 'turnoAdmin': this.router.navigate(['/turnoAdmin']); break;
      case 'perfilPaciente': this.router.navigate(['/perfilPaciente']); break;
      case 'perfilEspecialista': this.router.navigate(['/perfilEspecialista']); break;
      case 'perfilAdmin': this.router.navigate(['/perfilAdmin']); break;
      case 'seccionusuarios': this.router.navigate(['/seccionusuarios']); break;
      case 'pacientesAtendidos': this.router.navigate(['/pacientesAtendidos']); break;
      case 'estadisticas': this.router.navigate(['/estadisticas']); break;
      default: console.log('Ruta no encontrada'); break;
    }
  }

  async signOut() {
    try {
      await this.auth.signOut();
      this.user = '';
      this.perfil = '';
      this.authService.setUserVerificado(false);
      console.log(this.authService.getVerificado() + "verficado..")
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}
