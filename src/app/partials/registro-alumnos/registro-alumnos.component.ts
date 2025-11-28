import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { FacadeService } from 'src/app/services/facade.service'; // Importar FacadeService

@Component({
  selector: 'app-registro-alumnos',
  templateUrl: './registro-alumnos.component.html',
  styleUrls: ['./registro-alumnos.component.scss']
})
export class RegistroAlumnosComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public alumno:any= {};
  public token: string = "";
  public errors:any={};
  public editar:boolean = false;
  public idUser: Number = 0;

  constructor(
    private router: Router,
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private alumnosService: AlumnosService,
    private facadeService: FacadeService // Inyectar el servicio
  ) { }

  ngOnInit(): void {
    // 1. Inicializar esquema
    this.alumno = this.alumnosService.esquemaAlumno();
    this.alumno.rol = this.rol;
    this.token = this.facadeService.getSessionToken();

    // 2. VERIFICAR SI ES EDICIÓN
    console.log("Datos alumno recibidos: ", this.datos_user);
    
    // Si llegan datos, rellenamos el formulario
    if(this.datos_user && Object.keys(this.datos_user).length > 0){
      this.editar = true;
      this.alumno = { ...this.datos_user };
      console.log("Modo edición activado para Alumno");
    }
  }

  public regresar(){
    this.location.back();
  }

  public registrar(){
    //Validamos si el formulario está lleno y correcto
    this.errors = {};
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }

    // Lógica para registrar un nuevo alumno
    if(this.alumno.password == this.alumno.confirmar_password){
      this.alumnosService.registrarAlumno(this.alumno).subscribe(
        (response) => {
          alert("Alumno registrado exitosamente");
          console.log("Alumno registrado: ", response);
          if(this.token && this.token !== ""){
            this.router.navigate(["home"]); // O la ruta de lista de alumnos
          }else{
            this.router.navigate(["/"]);
          }
        },
        (error) => {
          alert("Error al registrar alumno");
          console.error("Error al registrar alumno: ", error);
        }
      );
    }else{
      alert("Las contraseñas no coinciden");
      this.alumno.password="";
      this.alumno.confirmar_password="";
    }
  }

  public actualizar(){
    // 1. Validar (pasamos 'true' porque es edición, ignora passwords)
    this.errors = {};
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
    
    if(Object.keys(this.errors).length > 0){
      return false;
    }

    // 2. Llamar al servicio
    console.log("Actualizando alumno: ", this.alumno);
    this.alumnosService.editarAlumno(this.alumno).subscribe(
      (response) => {
        alert("Alumno actualizado correctamente");
        console.log("Alumno actualizado: ", response);
        this.router.navigate(["home"]); // Redirigir a la lista
      },
      (error) => {
        alert("No se pudo actualizar el alumno");
        console.error("Error al actualizar: ", error);
      }
    );
  }

  //Funciones para password
  showPassword()
  {
    if(this.inputType_1 == 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    }
    else{
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  showPwdConfirmar()
  {
    if(this.inputType_2 == 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    }
    else{
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  //Función para detectar el cambio de fecha
  public changeFecha(event :any){
    if(event.value){
      this.alumno.fecha_nacimiento = event.value.toISOString().split("T")[0];
      console.log("Fecha: ", this.alumno.fecha_nacimiento);
    }
  }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo letras (mayúsculas y minúsculas) y espacio
    if (
      !(charCode >= 65 && charCode <= 90) &&  // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      charCode !== 32                         // Espacio
    ) {
      event.preventDefault();
    }
  }
}