import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { FacadeService } from 'src/app/services/facade.service';
import { AlumnosService } from 'src/app/services/alumnos.service';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss'],
  standalone: false // IMPORTANTE: Para Angular 16+ con Módulos
})
export class AlumnosScreenComponent implements OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_alumnos: any[] = [];

  // Configuración de la tabla y buscador
  displayedColumns: string[] = ['matricula', 'nombre', 'email', 'fecha_nacimiento', 'telefono', 'curp', 'rfc', 'ocupacion', 'editar', 'eliminar'];
  dataSource = new MatTableDataSource<DatosUsuario>(this.lista_alumnos as DatosUsuario[]);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    public facadeService: FacadeService,
    public alumnosService: AlumnosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    
    this.token = this.facadeService.getSessionToken();
    if(this.token == ""){
      this.router.navigate(["/"]);
    }
    
    this.obtenerAlumnos();
  }

  // OBTENER LISTA
  public obtenerAlumnos() {
    this.alumnosService.obtenerListaAlumnos().subscribe(
      (response) => {
        this.lista_alumnos = response;
        if (this.lista_alumnos.length > 0) {
          // Mapear datos anidados
          this.lista_alumnos.forEach(usuario => {
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
          });
          // Inicializar dataSource para la tabla
          this.dataSource = new MatTableDataSource<DatosUsuario>(this.lista_alumnos as DatosUsuario[]);
          this.dataSource.paginator = this.paginator;
        }
      }, (error) => {
        console.error("Error al obtener alumnos: ", error);
      }
    );
  }

  // FUNCION DE FILTRADO (Buscador)
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public goEditar(idUser: number) {
    this.router.navigate(["registro-usuarios/alumnos/" + idUser]);
  }

  public delete(idUser: number) {
    const userIdSession = Number(this.facadeService.getUserId());
    if (this.rol === 'administrador' || this.rol === 'maestro' || (this.rol === 'alumno' && userIdSession === idUser)) {
      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idUser, rol: 'alumno'}, 
        height: '288px',
        width: '328px',
      });
      dialogRef.afterClosed().subscribe(result => {
        if(result && result.isDelete){
          this.alumnosService.eliminarAlumno(idUser).subscribe(
            (response) => {
              alert("Alumno eliminado correctamente.");
              this.obtenerAlumnos(); 
            },
            (error) => {
              if (error.status === 404) {
                 alert("Alumno eliminado correctamente.");
                 this.obtenerAlumnos();
              } else {
                alert("No se pudo eliminar el alumno.");
              }
            }
          );
        }
      });
    } else {
      alert("No tienes permisos para eliminar este alumno.");
    }
  }
}

export interface DatosUsuario {
  id: number;
  matricula: string;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string;
  telefono: string;
  curp: string;
  rfc: string;
  ocupacion: string;
  user?: any;
}