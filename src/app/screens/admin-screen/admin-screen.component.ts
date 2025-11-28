import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-admin-screen',
  templateUrl: './admin-screen.component.html',
  styleUrls: ['./admin-screen.component.scss'],
  standalone: false // IMPORTANTE
})
export class AdminScreenComponent implements OnInit {
  
  public name_user: string = "";
  public lista_admins: any[] = [];
  public token: string = "";

  // Configuración Tabla
  displayedColumns: string[] = ['clave_admin', 'nombre', 'email', 'rfc', 'ocupacion', 'editar', 'eliminar'];
  dataSource = new MatTableDataSource<any>(this.lista_admins);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public facadeService: FacadeService,
    private administradoresService: AdministradoresService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.token = this.facadeService.getSessionToken();
    if(this.token == ""){
      this.router.navigate(["/"]);
    }
    this.obtenerAdmins();
  }

  // Obtener lista
  public obtenerAdmins() {
    this.administradoresService.obtenerListaAdmins().subscribe(
      (response) => {
        this.lista_admins = response;
        if(this.lista_admins.length > 0){
          this.lista_admins.forEach(admin => {
            admin.first_name = admin.user.first_name;
            admin.last_name = admin.user.last_name;
            admin.email = admin.user.email;
          });
          this.dataSource = new MatTableDataSource(this.lista_admins);
          this.dataSource.paginator = this.paginator;
        }
      }, (error) => {
        alert("No se pudo obtener la lista de administradores");
      }
    );
  }

  // BUSCADOR
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public goEditar(idUser: number) {
    this.router.navigate(["registro-usuarios/administrador/" + idUser]);
  }

  public delete(idUser: number) {
    const dialogRef = this.dialog.open(EliminarUserModalComponent,{
      data: {id: idUser, rol: 'administrador'}, 
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result && result.isDelete){
        this.administradoresService.eliminarAdmin(idUser).subscribe(
          (response) => {
            alert("Administrador eliminado correctamente.");
            this.obtenerAdmins(); 
          },
          (error) => {
            if (error.status === 404) {
              alert("Administrador eliminado correctamente.");
              this.obtenerAdmins();
            } else {
              alert("No se pudo eliminar el administrador.");
            }
          }
        );
      }
    });
  }
}