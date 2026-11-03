import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../../../services/authUsers/data.service';
import { Auth } from '@angular/fire/auth';
import { UsuariosService } from '../../../../services/usuarios/usuarios.service';
import { getDownloadURL, ref, uploadBytes, getStorage } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-especialista-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './especialista-perfil.component.html',
  styleUrl: './especialista-perfil.component.scss'
})
export class EspecialistaPerfilComponent {
  storage = getStorage(); // Inicializar Firebase Storage correctamente

  constructor(private authService: DataService, private auth: Auth, private userService: UsuariosService, private firestore: Firestore) {
    this.checkUser();
    this.checkPerfil("especialistas");

  }

  diasusuario : any;
  
  imagenusuario = "";


  DepartamentList = ["9:00 a 17:00", "7:00 a 15:00"]

  horario: any;
  user: any;
  getHorario: any;
  especialidad1 = "";
  especialidad2 = "";
  nombredoctor = "";
  apellidodoctor = "";
  dni = "";

  changeDepartament(e: any) {
    if (e.target.value == "9:00 a 17:00") {
      this.horario = "9/17"
    } else {
      this.horario = "7/15"
    }
  }

  saveDataHorario() {
    console.log(this.especialidad1)
    this.userService.ingresarHorario(this.authService.getUser(), this.horario)
    this.dafualtimage();
    this.sendAdmin();
  }

  checkUser() {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.user = user.email;
      } else {
        console.log("No hay usuario autenticado.");
      }
    });
  }

  checkPerfil(name: any) {
    this.userService.getEspecialistas(name).subscribe((data: any[]) => {
      data.forEach(item => {
        if (item.email === this.user) {
          this.getHorario = item.horario;
          this.imagenusuario = item.imagen;
          this.diasusuario = item.laboral;
          this.nombredoctor = item.nombre;
          this.apellidodoctor = item.apellido;
          this.dni = item.dni;
          
          // Accediendo a las claves del objeto especialista
          const especialistas = Object.keys(item.especialista);
  
          this.especialidad1 = especialistas[0];  // Primer especialista
          this.especialidad2 = especialistas[1];  // Segundo especialista (si existe)
  
          console.log(item.especialista); // Ver el objeto completo
        }
      });
    });
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
      if (this.selectedFile1) {
        const filePath1 = `especialidades/${this.selectedFile1.name}`;
        const storageRef1 = ref(this.storage, filePath1);
  
        // Subir primera imagen
        await uploadBytes(storageRef1, this.selectedFile1);
        this.imgurl = await getDownloadURL(storageRef1);
        console.log('Primera imagen subida:', this.imgurl);
      } else {
        // Usar imagen predeterminada
        this.imgurl = this.defaultImgUrl1;
        console.log('Primera imagen no seleccionada. Usando predeterminada:', this.imgurl);
      }
  
      if (this.selectedFile2) {
        const filePath2 = `especialidades/${this.selectedFile2.name}`;
        const storageRef2 = ref(this.storage, filePath2);
  
        // Subir segunda imagen
        await uploadBytes(storageRef2, this.selectedFile2);
        this.imgurl2 = await getDownloadURL(storageRef2);
        console.log('Segunda imagen subida:', this.imgurl2);
      } else {
        // Usar imagen predeterminada
        this.imgurl2 = this.defaultImgUrl2;
        console.log('Segunda imagen no seleccionada. Usando predeterminada:', this.imgurl2);
      }
    } catch (error) {
      console.error('Error al subir imágenes:', error);
    }
  }

  defaultImgUrl1 = 'https://via.placeholder.com/150'; // URL de imagen predeterminada 1
defaultImgUrl2 = 'https://via.placeholder.com/150'; // URL de imagen predeterminada 2

dafualtimage()
{
  if(this.especialidad1 == "Cardiología")
  {
    this.defaultImgUrl1 = "https://firebasestorage.googleapis.com/v0/b/tplabo4final.firebasestorage.app/o/corazon.jfif?alt=media&token=3415728e-e3f4-4f8c-8e07-7725a7a53245"
  }
  else if(this.especialidad1 == "Dermatología")
  {
    this.defaultImgUrl1 = "https://firebasestorage.googleapis.com/v0/b/tplabo4final.firebasestorage.app/o/darmat.jfif?alt=media&token=f15ae899-6f95-4ab1-a87e-f238ab999f1e"
  }
  else if(this.especialidad1 == "Pediatría")
  {
    console.log("entre a pedia")
    this.defaultImgUrl1 = "https://firebasestorage.googleapis.com/v0/b/tplabo4final.firebasestorage.app/o/bebes.jfif?alt=media&token=1d1a3dff-5293-4f9f-9038-6f90bc49fb73"
  }
  else{
    console.log(this.especialidad1)
    this.defaultImgUrl1 = "https://firebasestorage.googleapis.com/v0/b/tplabo4final.firebasestorage.app/o/images.png?alt=media&token=a27e8a32-3ae1-4e8b-8e5b-e4277a3f8d34"
  }

  if(this.especialidad2 == "Cardiología")
    {
      this.defaultImgUrl2 = "https://firebasestorage.googleapis.com/v0/b/tplabo4final.firebasestorage.app/o/corazon.jfif?alt=media&token=3415728e-e3f4-4f8c-8e07-7725a7a53245"
    }
    else if(this.especialidad2 == "Dermatología")
    {
      this.defaultImgUrl2 = "https://firebasestorage.googleapis.com/v0/b/tplabo4final.firebasestorage.app/o/darmat.jfif?alt=media&token=f15ae899-6f95-4ab1-a87e-f238ab999f1e"
    }
    else if(this.especialidad2 == "Pediatría")
    {
      this.defaultImgUrl2 = "https://firebasestorage.googleapis.com/v0/b/tplabo4final.firebasestorage.app/o/bebes.jfif?alt=media&token=1d1a3dff-5293-4f9f-9038-6f90bc49fb73"
    }
    else{
      this.defaultImgUrl2 = "https://firebasestorage.googleapis.com/v0/b/tplabo4final.firebasestorage.app/o/images.png?alt=media&token=a27e8a32-3ae1-4e8b-8e5b-e4277a3f8d34"
    }

}

  // Enviar imagenes y especialidad a Firestore
  async sendAdmin() {
    await this.uploadImages();
  
    try {
      // Validar y asignar valores predeterminados si faltan
      if (!this.especialidad1) {
        console.error('La especialidad1 no está definida.');
        return;
      }
  
      if (!this.especialidad2) {
        console.warn('La especialidad2 no está definida. Se asignará un valor predeterminado.');
        this.especialidad2 = 'No especificada'; // Valor predeterminado
      }
  
      // Asegúrate de que las imágenes estén subidas
      if (!this.imgurl || !this.imgurl2) {
        console.error('Las imágenes deben estar subidas primero.');
        return;
      }
  
      // Colección de imágenes por especialidad
      const col = collection(this.firestore, "imagenesEspecialidad");
  
      const obj = { 
        usuario: this.user,
        especialidad1: this.especialidad1,
        especialidad2: this.especialidad2,
        imgurl1: this.imgurl,
        imgurl2: this.imgurl2
      };
  
      // Guardar en Firestore
      await addDoc(col, obj);
      console.log('Datos guardados con éxito');
  
    } catch (error) {
      console.error('Error al agregar datos: ', error);
    }
  }

  diasLaborales: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  diasSeleccionados: string[] = [];

  actualizarDiasLaborales(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const dia = checkbox.value;

    if (checkbox.checked) {
      // Agregar día si está seleccionado
      this.diasSeleccionados.push(dia);
    } else {
      // Remover día si está desmarcado
      this.diasSeleccionados = this.diasSeleccionados.filter(d => d !== dia);
    }
  }

  diassellecionados = false;

  guardarDiasLaborales(): void {
    this.diassellecionados = true;
    console.log('Días laborales seleccionados:', this.diasSeleccionados.join(', '));
    console.log(this.diasSeleccionados)
    this.userService.ingresarLaboral(this.user, this.diasSeleccionados)
    // Aquí puedes enviar los días seleccionados al backend o guardarlos en alguna variable persistente
  }

  cambiarDiasLaborales(): void {
    this.diasSeleccionados = [];
    this.diassellecionados = false;
    console.log('Días laborales seleccionados:', this.diasSeleccionados.join(', '));
    this.userService.ingresarLaboral(this.user, this.diasSeleccionados) 
    // Aquí puedes enviar los días seleccionados al backend o guardarlos en alguna variable persistente
  }
  
}
