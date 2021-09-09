import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { BucketMessengerService } from '@app/services/bucket-messenger-service/bucket-messenger.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorService } from '@app/services/tools/color.service';
import { PencilService } from '@app/services/tools/pencil.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { PencilAttributeComponent } from './pencil-attribute.component';

describe('PencilAttributeComponent', () => {
    let component: PencilAttributeComponent;
    let fixture: ComponentFixture<PencilAttributeComponent>;
    let drawingStub: DrawingService;
    let undoRedoStub: UndoRedoService;
    let pencilStub: PencilService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let colorStub: ColorService;
    let bucketMessengerServiceStub: BucketMessengerService;

    beforeEach(async(() => {
        drawingStub = new DrawingService();
        pencilStub = new PencilService(drawingStub, undoRedoStub, colorStub);
        undoRedoStub = new UndoRedoService(drawingStub);
        bucketMessengerServiceStub = new BucketMessengerService();
        colorStub = new ColorService(drawingStub, bucketMessengerServiceStub);

        TestBed.configureTestingModule({
            declarations: [PencilAttributeComponent],
            providers: [
                { provide: PencilService, useValue: pencilStub },
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
        fixture = TestBed.createComponent(PencilAttributeComponent);
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

    it('onSizeChange of pencil service should change on MatSliderChange Event', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = 1;
        const spy = spyOn(pencilStub, 'onSizeChange').and.callThrough();
        component.sliderChange(matSliderChange);
        expect(spy).toHaveBeenCalled();
    });

    it('onSizeChange of pencil service should not change on MatSliderChange Event if the value of the change is null', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = null;
        const spy = spyOn(pencilStub, 'onSizeChange').and.callThrough();
        component.sliderChange(matSliderChange);
        expect(spy).not.toHaveBeenCalled();
    });
});
