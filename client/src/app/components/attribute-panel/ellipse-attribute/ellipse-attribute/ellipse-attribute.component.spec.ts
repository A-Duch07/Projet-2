import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { BucketMessengerService } from '@app/services/bucket-messenger-service/bucket-messenger.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorService } from '@app/services/tools/color.service';
import { EllipseService } from '@app/services/tools/ellipse.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { EllipseAttributeComponent } from './ellipse-attribute.component';

describe('EllipseAttributeComponent', () => {
    let component: EllipseAttributeComponent;
    let fixture: ComponentFixture<EllipseAttributeComponent>;
    let drawingStub: DrawingService;
    let bucketMessengerServiceStub: BucketMessengerService;
    let undoRedoStub: UndoRedoService;
    let ellipseStub: EllipseService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let colorStub: ColorService;

    beforeEach(async(() => {
        bucketMessengerServiceStub = new BucketMessengerService();
        drawingStub = new DrawingService();
        ellipseStub = new EllipseService(drawingStub, undoRedoStub, colorStub);
        undoRedoStub = new UndoRedoService(drawingStub);
        colorStub = new ColorService(drawingStub, bucketMessengerServiceStub);

        TestBed.configureTestingModule({
            declarations: [EllipseAttributeComponent],
            providers: [
                { provide: EllipseService, useValue: ellipseStub },
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
        fixture = TestBed.createComponent(EllipseAttributeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onSizeChange of ellipse service should change on MatSliderChange Event', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = 1;
        const spy = spyOn(ellipseStub, 'onSizeChange').and.callThrough();
        component.sliderChange(matSliderChange);
        expect(spy).toHaveBeenCalled();
    });

    it('onSizeChange of ellipse service should not change on MatSliderChange Event if the value of the change is null', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = null;
        const spy = spyOn(ellipseStub, 'onSizeChange').and.callThrough();
        component.sliderChange(matSliderChange);
        expect(spy).not.toHaveBeenCalled();
    });

    it('selectStyle should change the current style of the polygon service and should change the current style of the component', () => {
        const styleNumber = 1;
        component.selectStyle(1);
        expect(ellipseStub.currentStyle).toEqual(styleNumber);
        expect(component.currentStyle).toEqual(styleNumber);
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
