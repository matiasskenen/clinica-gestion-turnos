import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { getDoc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { Firestore, collection, collectionData,setDoc, DocumentData, doc, addDoc } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(private firestore: Firestore, private auth: Auth) {}

  sendPaciente(
    nombre: string,
    apellido: string,
    edad: number,
    dni: number,
    obrasocial: string,
    email: string,
    imagen: string,
    imagen2: string
  ) {
    let col = collection(this.firestore, 'pacientes');
  
    let obj = {
      nombre: nombre,
      apellido: apellido,
      edad: edad,
      dni: dni,
      obrasocial: obrasocial,
      email: email,
      imagen: imagen,
      imagen2: imagen2,
      perfil: 'paciente',
    };
  
    return addDoc(col, obj)
      .then(() => {
        console.log('Paciente agregado con éxito');
      })
      .catch((error) => {
        console.error('Error al agregar Paciente: ', error);
        throw error;
      });
  }

  sendAdmin(nombre : string, apellido : string, edad : number, dni : number, email : string, imagen: string) 
  {
    let col = collection(this.firestore, "admins");

    let obj = { 
      nombre: nombre,
      apellido: apellido,
      edad: edad,
      dni: dni,
      email: email,
      imagen : imagen,
      perfil : "admin"
    };

    return addDoc(col, obj)
      .then(() => {
        console.log('Admin agregado con éxito');
      })
      .catch((error) => {
        console.error('Error al agregar Admin: ', error);
        throw error;
      });
  }

  sendEspecialista(nombre : string, apellido : string, edad : number, dni : number, email : string, especialista : any, imagen : string) 
  {
    let col = collection(this.firestore, "especialistas");

    let obj = { 
      nombre: nombre,
      apellido: apellido,
      edad: edad,
      dni: dni,
      email: email,
      especialista : especialista,
      perfil : "especialista",
      imagen : imagen,
      verificado : false,
      horario: "",
      diasLaborales: ""
    };

    return addDoc(col, obj)
      .then(() => {
        console.log('especialista agregado con éxito');
      })
      .catch((error) => {
        console.error('Error al agregar especialista: ', error);
        throw error;
      });
  }

    getEspecialistas(name : any) 
    {
      const col = collection(this.firestore, name);

      const filteredQuery = query(
        col
      );
      return collectionData(filteredQuery); // Retorna el observable
    }


    ingresarHorario(especialista : string, horario : string)
    {
      // Suponiendo que deseas buscar por email
      const nombreBuscado = especialista; // Cambia esto con el email que buscas


      console.log()
      // Crear una referencia a la colección
      const coleccionRef = collection(this.firestore, "especialistas");

      // Crear una consulta que busque el documento donde el email coincide
      const consulta = query(coleccionRef, where("email", "==", nombreBuscado));

      // Obtener los documentos que coinciden con la consulta
      getDocs(consulta).then((querySnapshot) => {
        if (!querySnapshot.empty) {
          // Si se encuentra al menos un documento, tomamos el primero
          const docSnap = querySnapshot.docs[0]; // Aquí obtenemos el primer documento
          const idEspecialista = docSnap.id; // Obtenemos el id del documento encontrado

          // Ahora puedes actualizar el campo 'nombre' de este documento
          const especialistaRef = doc(this.firestore, "especialistas", idEspecialista);
          
          updateDoc(especialistaRef, {
            horario: horario // Cambia esto con el nuevo nombre que deseas asignar
          })

        } else {
          console.log("No se encontró el especialista con ese email.");
        }
      }).catch((error) => {
        console.error("Error al realizar la consulta:", error);
      });
    }

    ingresarLaboral(especialista : string, dias : any)
    {
      // Suponiendo que deseas buscar por email
      const nombreBuscado = especialista; // Cambia esto con el email que buscas


      console.log()
      // Crear una referencia a la colección
      const coleccionRef = collection(this.firestore, "especialistas");

      // Crear una consulta que busque el documento donde el email coincide
      const consulta = query(coleccionRef, where("email", "==", nombreBuscado));

      // Obtener los documentos que coinciden con la consulta
      getDocs(consulta).then((querySnapshot) => {
        if (!querySnapshot.empty) {
          // Si se encuentra al menos un documento, tomamos el primero
          const docSnap = querySnapshot.docs[0]; // Aquí obtenemos el primer documento
          const idEspecialista = docSnap.id; // Obtenemos el id del documento encontrado

          // Ahora puedes actualizar el campo 'nombre' de este documento
          const especialistaRef = doc(this.firestore, "especialistas", idEspecialista);
          
          updateDoc(especialistaRef, {
            laboral: dias // Cambia esto con el nuevo nombre que deseas asignar
          })

        } else {
          console.log("No se encontró el especialista con ese email.");
        }
      }).catch((error) => {
        console.error("Error al realizar la consulta:", error);
      });
    }


    modificarVerficiado(funicion : string, nombre : string)
    {
      const nombreBuscado = nombre;

      const coleccionRef = collection(this.firestore, "especialistas");

      const consulta = query(coleccionRef, where("nombre", "==", nombreBuscado));

      var accionVerificado = false;


      if(funicion == "habilitar")
      {
        accionVerificado = true;
      }

      getDocs(consulta).then((querySnapshot) => {
        if (!querySnapshot.empty) {

          const docSnap = querySnapshot.docs[0]; 
          const idEspecialista = docSnap.id; 


          const especialistaRef = doc(this.firestore, "especialistas", idEspecialista);
          
          updateDoc(especialistaRef, {
            verificado: accionVerificado 
          })

        } 
        else 
        {
          console.log("No se encontró el especialista con ese email.");
        }
      }).catch((error) => {
        console.error("Error al realizar la consulta:", error);
      });
    }


   
  


}
