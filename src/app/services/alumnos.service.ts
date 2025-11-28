import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ValidatorService } from './tools/validator.service';
import { ErrorsService } from './tools/errors.service';
import { FacadeService } from './facade.service'; 

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AlumnosService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService 
  ) { }

  public esquemaAlumno() {
    return {
      'rol': 'alumno',
      'first_name': '',
      'last_name': '',
      'email': '',
      'password': '',
      'confirmar_password': '',
      'fecha_nacimiento': '',
      'curp': '',
      'rfc': '',
      'edad': '',
      'telefono': '',
      'ocupacion': '',
      'matricula': ''
    }
  }

  // Validar formulario
  public validarAlumno(data: any, editar: boolean) {
    console.log("Validando alumno... ", data);
    let error: any = [];

    if (!this.validatorService.required(data["first_name"])) {
      error.push('El nombre es obligatorio');
    }
    if (!this.validatorService.required(data["last_name"])) {
      error.push('El apellido es obligatorio');
    }
    if (!this.validatorService.required(data["email"])) {
      error.push('El correo es obligatorio');
    }
    
    if(!editar){
      if (!this.validatorService.required(data["password"])) {
        error.push('La contraseña es obligatoria');
      }
      if (data["password"] != data["confirmar_password"]) {
        error.push('Las contraseñas no coinciden');
      }
    }

    return error;
  }

  
  private getHeaders(): HttpHeaders {
    const token = this.facadeService.getSessionToken();
    if (token) {
      return new HttpHeaders({ 
        'Content-Type': 'application/json', 
        'Authorization': 'Bearer ' + token 
      });
    }
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

 
  public obtenerListaAlumnos(): Observable<any> {
    return this.http.get<any>(`${environment.url_api}/lista-alumnos/`, { headers: this.getHeaders() });
  }

  // REGISTRAR (POST)
  public registrarAlumno(data: any): Observable<any> {
    return this.http.post<any>(`${environment.url_api}/alumnos/`, data, { headers: this.getHeaders() });
  }

  // OBTENER POR ID (GET) 
  public obtenerAlumnoPorID(idUser: number): Observable<any> {
    return this.http.get<any>(`${environment.url_api}/alumnos/?id=${idUser}`, { headers: this.getHeaders() });
  }

  // EDITAR (PUT)
  public editarAlumno(data: any): Observable<any> {
    return this.http.put<any>(`${environment.url_api}/alumnos/?id=${data.id}`, data, { headers: this.getHeaders() });
  }

  // ELIMINAR (DELETE)
  public eliminarAlumno(idUser: number): Observable<any> {
    return this.http.delete<any>(`${environment.url_api}/alumnos/?id=${idUser}`, { headers: this.getHeaders() });
  }
}