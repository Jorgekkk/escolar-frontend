import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { MatRadioChange } from '@angular/material/radio';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { AlumnosService } from 'src/app/services/alumnos.service';

@Component({
  selector: 'app-registro-usuarios-screen',
  templateUrl: './registro-usuarios-screen.component.html',
  styleUrls: ['./registro-usuarios-screen.component.scss']
})
export class RegistroUsuariosScreenComponent implements OnInit {

  public tipo: string = "registro-usuarios";
  public editar: boolean = false;
  public rol: string = "";
  public idUser: number = 0;

  // Banderas
  public isAdmin: boolean = false;
  public isAlumno: boolean = false;
  public isMaestro: boolean = false;

  public tipo_user: string = "";
  public user: any = {};

  constructor(
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public facadeService: FacadeService,
    private administradoresService: AdministradoresService,
    private maestrosService: MaestrosService,
    private alumnosService: AlumnosService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // 1. Obtener rol desde URL
    if (this.activatedRoute.snapshot.params['rol'] != undefined) {
      this.rol = this.activatedRoute.snapshot.params['rol'];
    }

    // 2. Obtener ID si es edición
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID User:", this.idUser);
      this.obtenerUserByID();
    }
  }

  
  public obtenerUserByID() {
    console.log("Obteniendo usuario tipo:", this.rol, "ID:", this.idUser);
    
    
    const rolNormalizado = this.rol.replace(/s$/, ''); 

    // --- ALUMNO ---
    if (rolNormalizado === "alumno" || this.rol === "alumno") {
      this.alumnosService.obtenerAlumnoPorID(this.idUser).subscribe(
        (response) => {
          console.log("Datos Alumno:", response);
          
          this.user = { ...response }; 
          
          
          if (response.user) {
            this.user.first_name = response.user.first_name;
            this.user.last_name = response.user.last_name;
            this.user.email = response.user.email;
          }
          
          
          this.user.password = '';
          this.user.confirmar_password = '';

          
          this.user.tipo_usuario = "alumno";
          this.tipo_user = "alumno";
          this.isAlumno = true;
          this.isAdmin = false;
          this.isMaestro = false;
          
          this.cdr.detectChanges();
        },
        (error) => {
          console.error("Error al cargar alumno:", error);
          alert("No se pudieron cargar los datos del alumno.");
        }
      );
    }
    // --- MAESTRO ---
    else if (rolNormalizado === "maestro" || this.rol === "maestro") {
       this.maestrosService.obtenerMaestroPorID(this.idUser).subscribe(
        (response) => {
          this.user = { ...response };
          if (response.user) {
            this.user.first_name = response.user.first_name;
            this.user.last_name = response.user.last_name;
            this.user.email = response.user.email;
          }
          // Manejo de fechas y JSON de maestro...
          if (response.materias_json && typeof response.materias_json === 'string') {
             try { this.user.materias_json = JSON.parse(response.materias_json); } catch { this.user.materias_json = []; }
          }
          this.tipo_user = "maestro";
          this.isMaestro = true;
          this.isAdmin = false;
          this.isAlumno = false;
          this.cdr.detectChanges();
        },
        (error) => alert("Error al cargar maestro")
      );
    }
    // --- ADMINISTRADOR ---
    else if (rolNormalizado === "administrador" || this.rol === "administrador") {
      this.administradoresService.obtenerAdminPorID(this.idUser).subscribe(
        (response) => {
          this.user = response;
          this.user.first_name = response.user?.first_name || response.first_name;
          this.user.last_name = response.user?.last_name || response.last_name;
          this.user.email = response.user?.email || response.email;
          this.tipo_user = "administrador";
          this.isAdmin = true;
          this.isMaestro = false;
          this.isAlumno = false;
          this.cdr.detectChanges();
        },
        (error) => alert("Error al cargar admin")
      );
    }
  }

  
  public actualizar() {
    if (this.isAlumno) {
      // Validar antes de enviar
      const errores = this.alumnosService.validarAlumno(this.user, true);
      if (errores.length > 0) {
        alert(errores.join('\n'));
        return;
      }
      
      this.alumnosService.editarAlumno(this.user).subscribe(
        (response) => {
          alert("Alumno actualizado correctamente");
          this.router.navigate(['home']); 
        },
        (error) => {
          console.error(error);
          alert("Error al actualizar el alumno");
        }
      );
    }
    
  }

  public radioChange(event: MatRadioChange) {
    this.tipo_user = event.value;
    this.isAdmin = (event.value === 'administrador');
    this.isAlumno = (event.value === 'alumno');
    this.isMaestro = (event.value === 'maestro');
  }

  public goBack() {
    this.location.back();
  }
}