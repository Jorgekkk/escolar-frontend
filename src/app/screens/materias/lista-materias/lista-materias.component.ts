import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MateriasService } from 'src/app/services/materias.service';
import { FacadeService } from 'src/app/services/facade.service';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-lista-materias',
  templateUrl: './lista-materias.component.html',
  styleUrls: ['./lista-materias.component.scss']
})
export class ListaMateriasComponent implements OnInit {

  // Lista de columnas a mostrar
  displayedColumns: string[] = [
    'nrc',
    'nombre_materia',
    'seccion',
    'dias',
    'hora_inicio',
    'hora_fin',
    'salon',
    'programa_educativo',
    'profesor',
    'creditos'
  ];

  dataSource = new MatTableDataSource<any>([]);
  public isAdmin: boolean = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private materiasService: MateriasService,
    private facadeService: FacadeService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Validar rol: Solo el admin puede ver la columna de acciones (Editar/Eliminar)
    if(this.facadeService.getUserGroup() === 'administrador'){
      this.isAdmin = true;
      this.displayedColumns.push('acciones');
    }

    this.obtenerMaterias();
  }

  // Obtener lista de materias del backend
  public obtenerMaterias() {
    this.materiasService.getMaterias().subscribe(
      (response) => {
        this.dataSource = new MatTableDataSource(response);
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
        alert("Error al obtener materias");
      }
    );
  }

  // Filtrado por NRC y Nombre [cite: 65]
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Ir a la pantalla de edición [cite: 70]
  public goEditar(id: number) {
    this.router.navigate(['materias/editar', id]);
  }

  // Eliminar materia [cite: 74]
  public goEliminar(id: number) {
    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
      data: { id: id, rol: 'materia' }, // Pasamos 'materia' para que el modal sepa qué texto mostrar si lo tienes configurado así
      height: '280px',
      width: '320px',
    });

    dialogRef.afterClosed().subscribe(result => {
      // Si se confirma la eliminación en el modal
      if (result) {
        this.materiasService.eliminarMateria(id).subscribe(
          (response) => {
            alert("Materia eliminada correctamente");
            this.obtenerMaterias(); // Recargar tabla
          },
          (error) => {
            alert("Error al eliminar la materia");
          }
        );
      }
    });
  }
}
