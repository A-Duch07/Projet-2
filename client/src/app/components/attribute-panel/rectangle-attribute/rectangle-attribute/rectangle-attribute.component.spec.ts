import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { BucketMessengerService } from '@app/services/bucket-messenger-service/bucket-messenger.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorService } from '@app/services/tools/color.service';
import { RectangleService } from '@app/services/tools/rectangle.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { RectangleAttributeComponent } from './rectangle-attribute.component';

describe('RectangleAttributeComponent', () => {
    let component: RectangleAttributeComponent;
    let fixture: ComponentFixture<RectangleAttributeComponent>;
    let drawingStub: DrawingService;
    let undoRedoStub: UndoRedoService;
    let rectangleStub: RectangleService;
    let colorStub: ColorService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let bucketMessengerServiceStub: BucketMessengerService;

    beforeEach(async(() => {
        bucketMessengerServiceStub = new BucketMessengerService();
        drawingStub = new DrawingService();
        undoRedoStub = new UndoRedoService(drawingStub);
        rectangleStub = new RectangleService(drawingStub, undoRedoStub, colorStub);
        colorStub = new ColorService(drawingStub, bucketMessengerServiceStub);

        TestBed.configureTestingModule({
            declarations: [RectangleAttributeComponent],
            providers: [
                { provide: RectangleService, useValue: rectangleStub },
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

        fixture = TestBed.createComponent(RectangleAttributeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // canvasTestHelper = TestBed.inject(CanvasTestHelper);
    });

    it('selectStyle should change ', () => {
        expect(component).toBeTruthy();
    });

    it('onSizeChange of rectangle service should change on MatSliderChange Event', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = 1;
        const spy = spyOn(rectangleStub, 'onSizeChange').and.callThrough();
        component.sliderChange(matSliderChange);
        expect(spy).toHaveBeenCalled();
    });

    it('onSizeChange of rectangle service should not change on MatSliderChange Event if the value of the change is null', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = null;
        const spy = spyOn(rectangleStub, 'onSizeChange').and.callThrough();
        component.sliderChange(matSliderChange);
        expect(spy).not.toHaveBeenCalled();
    });

    it('selectStyle should change the current style of the rectangle service and should change the current style of the component', () => {
        const styleNumber = 1;
        component.selectStyle(1);
        expect(rectangleStub.currentStyle).toEqual(styleNumber);
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
