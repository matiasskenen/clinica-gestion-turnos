import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgxCaptchaModule } from 'ngx-captcha';
import Swal from 'sweetalert2';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import {

  FormBuilder,
  FormGroup,
  FormsModule,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService } from '../../services/usuarios/usuarios.service';
import { sendEmailVerification } from 'firebase/auth';

import { getDownloadURL, listAll, ref, uploadBytes } from 'firebase/storage';
import { Storage } from '@angular/fire/storage';
import { Subscription } from 'rxjs';
import { CaptchaDirective } from '../directivas/captcha/captcha.directive';
import { CaptchaService } from '../services/captcha.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxCaptchaModule, CaptchaDirective],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  animations: [
    trigger('routeAnimations', [
      transition('HomePage => LoginPage', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 }))
      ]),
      // Agregar más transiciones según las necesidades
    ])
  ]
})

export class RegisterComponent {

  captchaValid: boolean = false;
  disableCaptcha: boolean = false; // Controla si el captcha está habilitado
  private captchaSubscription: Subscription;


  public email: string = '';
  public password: string = '';
  public mensagges = '';

  eleccion = false;

  loggedUser: string = '';
  flagError: boolean = false;
  flagSuccess: boolean = false;
  msjError: string = '';
  isLoading = false;

  form!: FormGroup;

  resultado: string = '';

  rol: string = '';

  otro = false;




  imageName: string = '';
  selectedFile: File | null = null;
  downloadURL: string | null = null;

  constructor(
    public auth: Auth,
    private router: Router,
    private fb: FormBuilder,
    private sendUsers: UsuariosService,
    private storage: Storage,
    private captchaService : CaptchaService
  ) {

    this.captchaSubscription = this.captchaService.captchaEnabled$.subscribe(enabled => {
      this.disableCaptcha = !enabled;  // Si está habilitado, disableCaptcha será false
    });
  }

  captchaCode: string = '';
  userInput: string = '';
  captchaVerified: boolean | null = null;

  // Generar CAPTCHA
  generateCaptcha(): void {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    this.captchaCode = Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    this.userInput = '';
    this.captchaVerified = null;
    this.habilitado = false;
    this.form.get('captchaInput')?.setValue('');
  }

  habilitado = false;

  // Verificar CAPTCHA
  verifyCaptcha(): void {
    const inputVal = this.form.get('captchaInput')?.value || '';
    this.captchaVerified = inputVal.trim() === this.captchaCode && this.captchaCode !== '';

    if (this.captchaVerified) {
      this.habilitado = true;
    } else {
      this.habilitado = false;
    }
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      nombre: new FormControl('', [
        Validators.required,
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$'),
      ]),
      apellido: new FormControl('', [
        Validators.required,
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$'),
      ]),
      mail: new FormControl('', [Validators.required, Validators.email]),
      clave: new FormControl('', [Validators.required, Validators.minLength(6)]),
      dni: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]+$'),
        Validators.maxLength(10),
      ]),
      edad: new FormControl('', [Validators.required]),
      obrasocial: new FormControl(''),
      especialidad: new FormControl(''),
      especialidadOtro: new FormControl(''),
      captchaInput: new FormControl('', Validators.required)
    });

    this.generateCaptcha();
  }

  get captchaInput() {
    return this.form.get('recaptcha');
  }

  get recaptcha() {
    return this.form.get('recaptcha');
  }

  get especialidad() {
    return this.form.get('especialidad');
  }

  get especialidadOtro() {
    return this.form.get('especialidadOtro');
  }

  get nombre() {
    return this.form.get('nombre');
  }

  get apellido() {
    return this.form.get('apellido');
  }

  get edad() {
    return this.form.get('edad');
  }
  get mail() {
    return this.form.get('mail');
  }
  get clave() {
    return this.form.get('clave');
  }
  get repiteClave() {
    return this.form.get('repiteClave');
  }

  get dni() {
    return this.form.get('dni');
  }

  get obrasocial() {
    return this.form.get('obrasocial');
  }

  

  async enviar() {
    if (!this.habilitado || !this.captchaVerified) {
      this.flagError = true;
      this.resultado = 'Por favor complete y verifique el CAPTCHA.';
      return;
    }

    if (!this.form.valid) {
      this.flagError = true;
      this.resultado = 'Por favor complete todos los campos obligatorios requeridos.';
      this.form.markAllAsTouched();
      return;
    }

    if (this.rol === 'especialista') {
      this.guardarEspecialidades();
      const seleccionadas = Object.keys(this.especialidadesSeleccionadas).filter(k => this.especialidadesSeleccionadas[k]);
      if (seleccionadas.length === 0) {
        this.flagError = true;
        this.resultado = 'Debe seleccionar al menos una especialidad.';
        return;
      }
    }

    if (!this.selectedFile1) {
      this.flagError = true;
      this.resultado = 'Debe seleccionar al menos una imagen de perfil.';
      return;
    }

    if (this.rol === 'paciente' && !this.selectedFile2) {
      this.flagError = true;
      this.resultado = 'El paciente debe seleccionar dos imágenes de perfil.';
      return;
    }

    this.isLoading = true;
    try {
      await this.uploadImages();
      await this.sendUser();

      this.isLoading = false;
      this.resultado = 'Usuario registrado con éxito. Se ha enviado un correo de verificación.';
      this.flagSuccess = true;
      Swal.fire({
        title: '¡Éxito!',
        text: 'Registro completado. Por favor verifique su correo antes de iniciar sesión.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.isLoading = false;
      this.flagError = true;
      console.error('Error en el registro:', error);
      this.resultado = error.message || 'Error al registrar el usuario.';
      Swal.fire({
        title: 'Error',
        text: this.resultado,
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  }

  adminRegister = false;
  especialistaRegister = false;
  clienteRegister = false;

  onRoleChange(role: string): void {

    this.eleccion = true;
    //const edadControl = this.form.get('edad') as FormControl;

    this.rol = role;

    console.log(this.rol)

    //edadControl.updateValueAndValidity();
  }

  async sendUser(): Promise<void> {
    const email = this.form.value.mail;
    const clave = this.form.value.clave;

    const res = await createUserWithEmailAndPassword(this.auth, email, clave);
    if (!res.user) {
      throw new Error('No se pudo crear el usuario en Firebase Auth.');
    }

    try {
      await sendEmailVerification(res.user);
      console.log('Correo de verificación enviado a:', email);
    } catch (e) {
      console.warn('No se pudo enviar correo de verificación:', e);
    }

    switch (this.rol) {
      case 'paciente':
        await this.sendUsers.sendPaciente(
          this.form.value.nombre,
          this.form.value.apellido,
          Number(this.form.value.edad),
          Number(this.form.value.dni),
          this.form.value.obrasocial || '',
          email,
          this.imgurl, 
          this.imgurl2
        );
        break;
      case 'admin':
        await this.sendUsers.sendAdmin(
          this.form.value.nombre,
          this.form.value.apellido,
          Number(this.form.value.edad),
          Number(this.form.value.dni),
          email,
          this.imgurl
        );
        break;
      default:
        this.guardarEspecialidades();
        await this.sendUsers.sendEspecialista(
          this.form.value.nombre,
          this.form.value.apellido,
          Number(this.form.value.edad),
          Number(this.form.value.dni),
          email,
          this.especialidadesSeleccionadas,
          this.imgurl
        );
        this.otro = false;
        break;
    }
  }

  

  especialidades: string[] = [
    'Cardiología',
    'Dermatología',
    'Pediatría',
  ];

  // Objeto para almacenar las especialidades seleccionadas
  especialidadesSeleccionadas: { [key: string]: boolean } = {};

  OTRAespecialidad = false;

  cambiarOtra()
  {
    this.OTRAespecialidad = true;
  }

  otraEspecialidad: string = '';

  // Función para manejar el guardado de especialidades
  guardarEspecialidades() {
    // Filtrar las especialidades seleccionadas
    const seleccionadas = Object.keys(this.especialidadesSeleccionadas).filter(
      (especialidad) => this.especialidadesSeleccionadas[especialidad],
    );

    // Si se selecciona "Otra especialidad", agregarla a las seleccionadas y al objeto especialidadesSeleccionadas
    if (this.OTRAespecialidad && this.otraEspecialidad.trim()) {
      seleccionadas.push(this.otraEspecialidad);
      this.especialidadesSeleccionadas[this.otraEspecialidad] = true; // Agregar "Otra especialidad" al objeto
      console.log('Especialidad "Otra" agregada:', this.otraEspecialidad);
    }

    // Mostrar las especialidades seleccionadas en la consola
    console.log('Especialidades seleccionadas:', this.especialidadesSeleccionadas);

  }

  selectedFile1: File | null = null;
  selectedFile2: File | null = null;

  onFileSelected(event: Event, imagenId: string): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      if (imagenId === 'imagen1') {
        this.selectedFile1 = input.files[0];
      } else if (imagenId === 'imagen2') {
        this.selectedFile2 = input.files[0];
      }
    }
  }

  imgurl: string = "";
  imgurl2: string = "";

  async uploadImages(): Promise<void> {
    try {
      if (this.rol == "paciente") {
        if (this.selectedFile1 && this.selectedFile2) {
          const filePath1 = `pacientes/${this.selectedFile1.name}`;
          const filePath2 = `pacientes/${this.selectedFile2.name}`;
  
          const storageRef1 = ref(this.storage, filePath1);
          const storageRef2 = ref(this.storage, filePath2);
  
          // Check if selectedFile1 is not null and upload
          if (this.selectedFile1) {
            await uploadBytes(storageRef1, this.selectedFile1);
            this.imgurl = await getDownloadURL(storageRef1);
            console.log('Primera imagen subida:', this.imgurl);
          }
  
          // Check if selectedFile2 is not null and upload
          if (this.selectedFile2) {
            await uploadBytes(storageRef2, this.selectedFile2);
            this.imgurl2 = await getDownloadURL(storageRef2);
            console.log('Segunda imagen subida:', this.imgurl2);
          }
  
        } else {
          console.error('Debes seleccionar ambas imágenes');
        }
      } else {
        const filePath1 = `pacientes/${this.selectedFile1?.name}`;
  
        const storageRef1 = ref(this.storage, filePath1);
  
        // Check if selectedFile1 is not null and upload
        if (this.selectedFile1) {
          await uploadBytes(storageRef1, this.selectedFile1);
          this.imgurl = await getDownloadURL(storageRef1);
          console.log('Primera imagen subida:', this.imgurl);
        }
      }
    } catch (error) {
      console.error('Error al subir imágenes:', error);
    }
  }
  

}
