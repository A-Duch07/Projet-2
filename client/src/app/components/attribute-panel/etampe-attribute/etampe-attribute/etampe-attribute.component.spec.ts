import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EtampeService } from '@app/services/tools/etampe.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { EtampeAttributeComponent } from './etampe-attribute.component';

describe('EtampeAttributeComponent', () => {
    let component: EtampeAttributeComponent;
    let fixture: ComponentFixture<EtampeAttributeComponent>;
    let undoRedoStub: UndoRedoService;
    let drawingStub: DrawingService;
    let etampeStub: EtampeService;

    beforeEach(async(() => {
        drawingStub = new DrawingService();
        etampeStub = new EtampeService(drawingStub, undoRedoStub);
        undoRedoStub = new UndoRedoService(drawingStub);
        TestBed.configureTestingModule({
            declarations: [EtampeAttributeComponent],
            providers: [
                { provide: EtampeService, useValue: etampeStub },
                { provide: UndoRedoService, useValue: undoRedoStub },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EtampeAttributeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onAngleChange of etampe service should be called', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = 1;
        const spy = spyOn(etampeStub, 'onAngleChange').and.stub();
        component.angleChange(matSliderChange);
        expect(spy).toHaveBeenCalled();
    });

    it('onAngleChange of etampe service should not be called', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = null;
        const spy = spyOn(etampeStub, 'onAngleChange').and.stub();
        component.angleChange(matSliderChange);
        expect(spy).not.toHaveBeenCalled();
    });

    it('onMiseAEchelleChange of etampe service should be called', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = 1;
        const spy = spyOn(etampeStub, 'onMiseAEchelleChange').and.stub();
        component.miseAEchelleChange(matSliderChange);
        expect(spy).toHaveBeenCalled();
    });

    it('onMiseAEchelleChange of etampe service should be called', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = null;
        const spy = spyOn(etampeStub, 'onMiseAEchelleChange').and.stub();
        component.miseAEchelleChange(matSliderChange);
        expect(spy).not.toHaveBeenCalled();
    });

    it('undo should call undoRedoservice.undo()', () => {
        const spy = spyOn(undoRedoStub, 'undo').and.callThrough();
        component.undo();
        expect(spy).toHaveBeenCalled();
    });

    it('redo should call undoRedoservice.redo()', () => {
        const spy = spyOn(undoRedoStub, 'redo').and.callThrough();
        component.redo();
        expect(spy).toHaveBeenCalled();
    });
});
