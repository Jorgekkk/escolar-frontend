import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { MaestrosService } from 'src/app/services/maestros.service';

@Component({
  selector: 'app-registro-maestros',
  templateUrl: './registro-maestros.component.html',
  styleUrls: ['./registro-maestros.component.scss']
})
export class RegistroMaestrosComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public maestro:any = {};
  public errors:any = {};
  public editar:boolean = false;
  public token: string = "";
  public idUser: Number = 0;

  //Para el select
  public areas: any[] = [
    {value: '1', viewValue: 'Desarrollo Web'},
    {value: '2', viewValue: 'Programación'},
    {value: '3', viewValue: 'Bases de datos'},
    {value: '4', viewValue: 'Redes'},
    {value: '5', viewValue: 'Matemáticas'},
  ];

  public materias:any[] = [
    {value: '1', nombre: 'Aplicaciones Web'},
    {value: '2', nombre: 'Programación 1'},
    {value: '3', nombre: 'Bases de datos'},
    {value: '4', nombre: 'Tecnologías Web'},
    {value: '5', nombre: 'Minería de datos'},
    {value: '6', nombre: 'Desarrollo móvil'},
    {value: '7', nombre: 'Estructuras de datos'},
    {value: '8', nombre: 'Administración de redes'},
    {value: '9', nombre: 'Ingeniería de Software'},
    {value: '10', nombre: 'Administración de S.O.'},
  ];

  constructor(
    private router: Router,
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private maestrosService: MaestrosService
  ) { }

  ngOnInit(): void {
    // 1. Inicializar esquema vacío por defecto
    this.maestro = this.maestrosService.esquemaMaestro();
    this.maestro.rol = this.rol;

    // 2. VERIFICAR SI HAY DATOS PARA EDITAR (ESTA ES LA PARTE QUE FALTABA)
    console.log("Datos recibidos en el hijo (Maestro): ", this.datos_user);
    
    // Si datos_user no es nulo y tiene propiedades, es edición
    if(this.datos_user && Object.keys(this.datos_user).length > 0){
      this.editar = true;
      // Copiamos los datos al objeto del formulario
      this.maestro = { ...this.datos_user };
      
      // Aseguramos que las materias sean un array para los checkboxes
      if(!this.maestro.materias_json){
        this.maestro.materias_json = [];
      }
    }
  }

  public regresar(){
    this.location.back();
  }

  public registrar(){
    //Validamos si el formulario está lleno y correcto
    this.errors = {};
    this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }
    //Validar la contraseña
    if(this.maestro.password == this.maestro.confirmar_password){
      this.maestrosService.registrarMaestro(this.maestro).subscribe(
        (response) => {
          alert("Maestro registrado exitosamente");
          console.log("Maestro registrado: ", response);
          this.router.navigate(["home"]); // O a /maestros
        },
        (error) => {
          alert("Error al registrar maestro");
          console.error("Error al registrar maestro: ", error);
        }
      );
    }else{
      alert("Las contraseñas no coinciden");
      this.maestro.password="";
      this.maestro.confirmar_password="";
    }
  }

  public actualizar(){
    // 1. Validar formulario (pasamos 'true' porque es edición)
    this.errors = {};
    this.errors = this.maestrosService.validarMaestro(this.maestro, this.editar);
    
    if(Object.keys(this.errors).length > 0){
      return false;
    }

    // 2. Llamar al servicio
    console.log("Actualizando maestro: ", this.maestro);
    this.maestrosService.editarMaestro(this.maestro).subscribe(
      (response) => {
        alert("Maestro actualizado correctamente");
        console.log("Maestro actualizado: ", response);
        this.router.navigate(["home"]); // O redirigir a donde prefieras
      },
      (error) => {
        alert("No se pudo actualizar el maestro");
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
      this.maestro.fecha_nacimiento = event.value.toISOString().split("T")[0];
    }
  }

  // Funciones para los checkbox
  public checkboxChange(event:any){
    if(event.checked){
      this.maestro.materias_json.push(event.source.value)
    }else{
      this.maestro.materias_json.forEach((materia: any, i: number) => {
        if(materia == event.source.value){
          this.maestro.materias_json.splice(i,1)
        }
      });
    }
  }

  public revisarSeleccion(nombre: string){
    if(this.maestro.materias_json){
      var busqueda = this.maestro.materias_json.find((element: any)=>element==nombre);
      return busqueda != undefined;
    }
    return false;
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