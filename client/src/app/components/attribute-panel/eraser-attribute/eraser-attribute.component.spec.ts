import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EraserService } from '@app/services/tools/eraser.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { EraserAttributeComponent } from './eraser-attribute.component';

describe('EraserAttributeComponent', () => {
    let component: EraserAttributeComponent;
    let fixture: ComponentFixture<EraserAttributeComponent>;
    let drawingStub: DrawingService;
    let undoRedoStub: UndoRedoService;
    let eraserStub: EraserService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(async(() => {
        drawingStub = new DrawingService();
        eraserStub = new EraserService(drawingStub, undoRedoStub);
        undoRedoStub = new UndoRedoService(drawingStub);

        TestBed.configureTestingModule({
            declarations: [EraserAttributeComponent],
            providers: [
                { provide: EraserService, useValue: eraserStub },
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
        fixture = TestBed.createComponent(EraserAttributeComponent);
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

    it('onSizeChange of eraser service should change on MatSliderChange Event', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = 1;
        const spy = spyOn(eraserStub, 'onSizeChange').and.callThrough();
        component.sliderChange(matSliderChange);
        expect(spy).toHaveBeenCalled();
    });

    it('onSizeChange of eraser service should not change on MatSliderChange Event if the value of the change is null', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = null;
        const spy = spyOn(eraserStub, 'onSizeChange').and.callThrough();
        component.sliderChange(matSliderChange);
        expect(spy).not.toHaveBeenCalled();
    });

    it('onSizeChange of eraser service should change on MatSliderChange Event', () => {
        const spy = spyOn(eraserStub, 'onSizeChange').and.callThrough();
        const input = '10';
        component.inputChange(input);
        expect(spy).toHaveBeenCalled();
    });
});
