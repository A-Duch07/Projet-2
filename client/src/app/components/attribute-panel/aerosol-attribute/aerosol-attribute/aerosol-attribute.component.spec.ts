import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { BucketMessengerService } from '@app/services/bucket-messenger-service/bucket-messenger.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { AerosolService } from '@app/services/tools/aerosol.service';
import { ColorService } from '@app/services/tools/color.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { AerosolAttributeComponent } from './aerosol-attribute.component';

describe('AerosolAttributeComponent', () => {
    let component: AerosolAttributeComponent;
    let fixture: ComponentFixture<AerosolAttributeComponent>;
    let drawingStub: DrawingService;
    let undoRedoStub: UndoRedoService;
    let bucketMessengerServiceStub: BucketMessengerService;
    let colorStub: ColorService;
    let aerosolStub: AerosolService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(async(() => {
        drawingStub = new DrawingService();
        bucketMessengerServiceStub = new BucketMessengerService();
        aerosolStub = new AerosolService(drawingStub, undoRedoStub, colorStub);
        undoRedoStub = new UndoRedoService(drawingStub);
        colorStub = new ColorService(drawingStub, bucketMessengerServiceStub);

        TestBed.configureTestingModule({
            declarations: [AerosolAttributeComponent],
            providers: [
                { provide: AerosolService, useValue: aerosolStub },
                { provide: UndoRedoService, useValue: undoRedoStub },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingStub.baseCtx = baseCtxStub;
        drawingStub.previewCtx = previewCtxStub;
        fixture = TestBed.createComponent(AerosolAttributeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
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

    it('onSizeChange of aerosol service should change on MatSliderChange Event', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = 1;
        const spy = spyOn(aerosolStub, 'onSizeChange').and.callThrough();
        component.sliderChange(matSliderChange);
        expect(spy).toHaveBeenCalled();
    });

    it('onSizeChange of aerosol service should not change on null event value', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = null;
        const spy = spyOn(aerosolStub, 'onSizeChange').and.callThrough();
        component.sliderChange(matSliderChange);
        expect(spy).not.toHaveBeenCalled();
    });

    it('onEmmisionChange of aerosol service should change on MatSliderChange Event', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = 1;
        const spy = spyOn(aerosolStub, 'onEmissionChange').and.callThrough();
        component.emissionChange(matSliderChange);
        expect(spy).toHaveBeenCalled();
    });

    it('onEmmisionChange of aerosol service should not change on null event value', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = null;
        const spy = spyOn(aerosolStub, 'onEmissionChange').and.callThrough();
        component.emissionChange(matSliderChange);
        expect(spy).not.toHaveBeenCalled();
    });

    it('onGouteletteChange of aerosol service should change on MatSliderChange Event', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = 1;
        const spy = spyOn(aerosolStub, 'onGouteletteChange').and.callThrough();
        component.gouteletteChange(matSliderChange);
        expect(spy).toHaveBeenCalled();
    });

    it('onGouteletteChange of aerosol service should not change on null event value', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = null;
        const spy = spyOn(aerosolStub, 'onGouteletteChange').and.callThrough();
        component.gouteletteChange(matSliderChange);
        expect(spy).not.toHaveBeenCalled();
    });
});
