import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BusquedaBarraComponent } from './busqueda-barra';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('BusquedaBarraComponent', () => {
  let component: BusquedaBarraComponent;
  let fixture: ComponentFixture<BusquedaBarraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusquedaBarraComponent, FormsModule]
    }).compileComponents();
    fixture = TestBed.createComponent(BusquedaBarraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit buscar event', () => {
    spyOn(component.buscar, 'emit');
    component.onBuscar();
    expect(component.buscar.emit).toHaveBeenCalled();
  });

  it('should emit limpiar event', () => {
    spyOn(component.limpiar, 'emit');
    component.onLimpiar();
    expect(component.limpiar.emit).toHaveBeenCalled();
  });

  it('should emit cambioCampo event', () => {
    spyOn(component.cambioCampo, 'emit');
    component.onCambioCampo('generoSeleccionado', 'Acción');
    expect(component.cambioCampo.emit).toHaveBeenCalledWith({campo: 'generoSeleccionado', valor: 'Acción'});
  });

  it('should emit autocompletar event', () => {
    spyOn(component.autocompletar, 'emit');
    component.onAutocompletar('nombreBusqueda', 'Halo');
    expect(component.autocompletar.emit).toHaveBeenCalledWith({campo: 'nombreBusqueda', valor: 'Halo'});
  });

  it('should emit seleccionarSugerencia event', () => {
    spyOn(component.seleccionarSugerencia, 'emit');
    component.onSeleccionarSugerencia('nombreBusqueda', 'Halo');
    expect(component.seleccionarSugerencia.emit).toHaveBeenCalledWith({campo: 'nombreBusqueda', valor: 'Halo'});
  });
}); 