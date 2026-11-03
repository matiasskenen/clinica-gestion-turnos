import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { browserLocalPersistence, setPersistence } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { trigger, transition, style, animate } from '@angular/animations';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    trigger('routeAnimations', [
      transition('* => LoginPage', [
        style({ opacity: 0, transform: 'translateY(-100%)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition('* => HomePage', [
        style({ opacity: 0, transform: 'translateX(-100%)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
      transition('* => RegisterPage', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms ease-in', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition('* => PacientesPage', [
        style({ opacity: 0, transform: 'translateY(50%) scale(0.9)' }),
        animate('400ms ease-in-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
      transition('* => EspecialistasPage', [
        style({ opacity: 0, transform: 'rotateY(90deg)' }),
        animate('500ms ease-in-out', style({ opacity: 1, transform: 'rotateY(0deg)' })),
      ]),
      transition('* => AdminPage', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('300ms ease-in-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
      transition('* => PacientePerfilPage', [
        style({ opacity: 0, transform: 'scale(0.8) rotate(-5deg)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1) rotate(0deg)' })),
      ]),
      transition('* => EspecialistaPerfilPage', [
        style({ opacity: 0, transform: 'translateY(100%)' }),
        animate('400ms ease-in', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition('* => AdminPerfilPage', [
        style({ opacity: 0, transform: 'rotateX(90deg)' }),
        animate('400ms ease-in-out', style({ opacity: 1, transform: 'rotateX(0deg)' })),
      ]),
      transition('* => PacientesAtendidosPage', [
        style({ opacity: 0, transform: 'translateX(-100%) rotate(-5deg)' }),
        animate('500ms ease-in-out', style({ opacity: 1, transform: 'translateX(0) rotate(0deg)' })),
      ]),
    ])
  ],
})
export class AppComponent {

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  constructor(private auth : Auth)
  {
    
  }

  title = 'tplabo4final';

  async setSessionPersistence() {
    try {
      await setPersistence(this.auth, browserLocalPersistence);
      console.log('Persistencia de sesión configurada correctamente.');
    } catch (error) {
      console.error('Error configurando la persistencia de sesión:', error);
    }
  }

}
