import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideHttpClient } from '@angular/common/http';
import { environmentConfig } from './environmentConfig';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Importar ChartsModule desde ng2-charts
import { ChartModule } from 'primeng/chart';

export const appConfig: ApplicationConfig = {
  providers: [
    // Habilitar la detección de cambios con Zone.js
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Proveer cliente HTTP para las solicitudes de red
    provideHttpClient(),
    
    // Proveer rutas de la aplicación
    provideRouter(routes),
    
    // Inicializar Firebase App con la configuración del entorno
    provideFirebaseApp(() => initializeApp(environmentConfig)),
    
    // Proveer autenticación con Firebase
    provideAuth(() => getAuth()),
    
    // Proveer Firestore de Firebase
    provideFirestore(() => getFirestore()),
    
    // Proveer almacenamiento de Firebase
    provideStorage(() => getStorage()),
    
    // Agregar el módulo de animaciones del navegador
    importProvidersFrom(BrowserAnimationsModule),

    // Importar el módulo de Charts
    importProvidersFrom(ChartModule) // Proveer ChartsModule
  ],
};
