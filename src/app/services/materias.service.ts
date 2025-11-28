import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FacadeService } from './facade.service';
// IMPORTANTE: Importar el entorno
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MateriasService {

  // CAMBIO: Usamos la variable de entorno en lugar del texto fijo
  private baseUrl: string = environment.url_api + '/';

  constructor(
    private http: HttpClient,
    private facadeService: FacadeService
  ) { }

  // Obtener headers con el token
  private getHeaders(): HttpHeaders {
    const token = this.facadeService.getSessionToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // 1. Obtener todas las materias
  public getMaterias(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}materias-all/`, { headers: this.getHeaders() });
  }

  // 2. Obtener una materia por ID
  public getMateriaById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}materias/?id=${id}`, { headers: this.getHeaders() });
  }

  // 3. Registrar materia
  public registrarMateria(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}materias/`, data, { headers: this.getHeaders() });
  }

  // 4. Editar materia
  public editarMateria(data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}materias/`, data, { headers: this.getHeaders() });
  }

  // 5. Eliminar materia
  public eliminarMateria(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}materias/?id=${id}`, { headers: this.getHeaders() });
  }
}
