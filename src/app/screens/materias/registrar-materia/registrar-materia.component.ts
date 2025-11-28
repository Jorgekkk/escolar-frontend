import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MateriasService } from 'src/app/services/materias.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-registrar-materia',
  templateUrl: './registrar-materia.component.html',
  styleUrls: ['./registrar-materia.component.scss']
})
export class RegistrarMateriaComponent implements OnInit {

  // Variables
  form: FormGroup;
  idMateria: any = null;
  isEdit: boolean = false;
  lista_maestros: any[] = [];

  // Opciones para selectores estáticos
  programas = [
    {value: 'Ingeniería en Ciencias de la Computación', viewValue: 'Ingeniería en Ciencias de la Computación'},
    {value: 'Licenciatura en Ciencias de la Computación', viewValue: 'Licenciatura en Ciencias de la Computación'},
    {value: 'Ingeniería en Tecnologías de la Información', viewValue: 'Ingeniería en Tecnologías de la Información'}
  ];

  dias_semana = [
    { value: 'Lunes', nombre: 'Lunes', checked: false },
    { value: 'Martes', nombre: 'Martes', checked: false },
    { value: 'Miércoles', nombre: 'Miércoles', checked: false },
    { value: 'Jueves', nombre: 'Jueves', checked: false },
    { value: 'Viernes', nombre: 'Viernes', checked: false },
  ];

  constructor(
    private fb: FormBuilder,
    private materiasService: MateriasService,
    private maestrosService: MaestrosService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private location: Location
  ) {
    // Inicializar formulario con validaciones
    this.form = this.fb.group({
      nrc: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(5)]],
      nombre_materia: ['', [Validators.required, Validators.pattern("^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*$")]],
      seccion: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(3)]],
      dias: [[], Validators.required],
      hora_inicio: ['', Validators.required],
      hora_fin: ['', Validators.required],
      salon: ['', [Validators.required, Validators.maxLength(15)]],
      programa_educativo: ['', Validators.required],
      profesor: ['', Validators.required],
      creditos: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(2)]]
    });
  }

  ngOnInit(): void {
    // 1. Obtener lista de maestros
    this.obtenerMaestros();

    // 2. Revisar si estamos editando
    this.idMateria = this.activeRoute.snapshot.params['id'];
    if (this.idMateria) {
      this.isEdit = true;
      this.cargarDatosMateria();
    }
  }

  public obtenerMaestros() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        this.lista_maestros = response;
        this.lista_maestros.forEach(maestro => {
          maestro.nombre_completo = maestro.user.first_name + ' ' + maestro.user.last_name;
        });
      },
      (error) => {
        alert("Error al cargar lista de maestros");
      }
    );
  }

  public checkboxChange(event: any) {
    const dia = event.source.value;
    if (event.checked) {
      this.dias_semana.find(d => d.value === dia)!.checked = true;
    } else {
      this.dias_semana.find(d => d.value === dia)!.checked = false;
    }

    const diasSeleccionados = this.dias_semana.filter(d => d.checked).map(d => d.value);
    this.form.patchValue({ dias: diasSeleccionados.join(', ') });
  }

  public cargarDatosMateria() {
    this.materiasService.getMateriaById(this.idMateria).subscribe(
      (response) => {
        this.form.patchValue(response);
        if(response.dias){
            const diasArray = response.dias.split(', ');
            diasArray.forEach((diaNombre: string) => {
                const found = this.dias_semana.find(d => d.value === diaNombre);
                if(found) found.checked = true;
            });
            this.form.patchValue({ dias: response.dias });
        }
      },
      (error) => {
        alert("Error al cargar datos de la materia");
      }
    );
  }

  public registrar() {
    if (!this.form.value.hora_inicio || !this.form.value.hora_fin) {
      alert("Debes seleccionar horarios");
      return;
    }

   
    const diasSeleccionados = this.dias_semana.filter(d => d.checked);
    if(diasSeleccionados.length === 0){
        alert("Debes seleccionar al menos un día");
        return;
    }

    if (this.form.valid) {

      
      const datos = { ...this.form.value };

      
      const convertirHora = (hora: string) => {
        if (!hora) return null;

        
        if (hora.split(':').length === 3) return hora;

        
        if (hora.indexOf('AM') === -1 && hora.indexOf('PM') === -1) {
            return hora + ':00';
        }

       
        const [time, modifier] = hora.split(' ');
        let [hours, minutes] = time.split(':');

        if (hours === '12') {
          hours = '00';
        }

        if (modifier === 'PM') {
          hours = (parseInt(hours, 10) + 12).toString();
        }

        return `${hours}:${minutes}:00`;
      };

      
      datos.hora_inicio = convertirHora(datos.hora_inicio);
      datos.hora_fin = convertirHora(datos.hora_fin);

      
      if (!this.isEdit) {
        this.materiasService.registrarMateria(datos).subscribe(
          (response) => {
            alert("Materia registrada correctamente");
            this.router.navigate(['home']);
          },
          (error) => {
            console.log("Error registro:", error);
            let mensaje = "Error desconocido";
            if (error.error && error.error.message) {
              mensaje = error.error.message;
            } else if (error.error) {
               mensaje = "Verifique los datos: " + JSON.stringify(error.error);
            } else {
               mensaje = "No se pudo conectar con el servidor";
            }
            alert(mensaje);
          }
        );
      } else {
        
        const datosEdit = { ...datos, id: this.idMateria };
        this.materiasService.editarMateria(datosEdit).subscribe(
          (response) => {
            alert("Materia actualizada correctamente");
            this.router.navigate(['home']);
          },
          (error) => {
             console.log("Error editar:", error);
             alert("Error al actualizar la materia");
          }
        );
      }
    } else {
      alert("Faltan campos por llenar correctamente");
    }
  }

  public regresar() {
    this.location.back();
  }
}
