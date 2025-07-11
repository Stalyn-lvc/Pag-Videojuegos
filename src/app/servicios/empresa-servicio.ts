import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment';
import { Observable } from 'rxjs';
import { Empresa } from '../modelos/Empresa';

@Injectable({
  providedIn: 'root'
})
export class EmpresaServicio {

  constructor(private http:HttpClient) { }
  private urlApiEmpresa=`${environment.urlApi}/empresa`;
  getEmpresa(): Observable<Empresa>{
    return this.http.get<Empresa>(this.urlApiEmpresa);
  }
  updateEmpresa(data: Empresa): Observable<Empresa> {
    return this.http.put<Empresa>(`${this.urlApiEmpresa}/${data.secuencial}`, data);
  }
}
