import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/authUsers/data.service';
import { AuthCheckDirective } from '../directivas/authCheck/auth-check.directive';
import { ScrollDirective } from '../directivas/scroll/scroll.directive';
import { FiltroAyudaPipe } from '../pipes/filtroAyuda/filtro-ayuda.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthCheckDirective, FiltroAyudaPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  userVerificado = false;
  user : any;

  searchText: string = '';
  helpTopics = [
    { title: 'Cómo registrarse', content: 'Instrucciones para registrarse en el sistema.' },
    { title: 'Recuperar contraseña', content: 'Pasos para recuperar tu contraseña.' },
    { title: 'Agendar una cita', content: 'Guía para agendar una cita con un especialista.' },
    { title: 'Contactar soporte', content: 'Información para contactar al soporte técnico.' }
  ];

  constructor(private router: Router, private auth: Auth, private service : DataService)
  {
    this.checkUser();

  }

  checkUser() {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.user = user.email;
      }
    });
  }

  navigateTo(route: string) {
    switch(route) {
      case 'login':
        this.router.navigate(['/login']);
        break;
      case 'register':
        this.router.navigate(['/register']);
        break;
    }
  }
  

}
