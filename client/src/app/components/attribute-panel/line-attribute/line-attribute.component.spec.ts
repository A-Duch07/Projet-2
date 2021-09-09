import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { BucketMessengerService } from '@app/services/bucket-messenger-service/bucket-messenger.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorService } from '@app/services/tools/color.service';
import { LineService } from '@app/services/tools/line.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { LineAttributeComponent } from './line-attribute.component';

describe('LineAttributeComponent', () => {
    let component: LineAttributeComponent;
    let fixture: ComponentFixture<LineAttributeComponent>;
    let drawingStub: DrawingService;
    let undoRedoStub: UndoRedoService;
    let lineStub: LineService;
    let colorStub: ColorService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let bucketMessengerServiceStub: BucketMessengerService;

    beforeEach(async(() => {
        drawingStub = new DrawingService();
        lineStub = new LineService(drawingStub, undoRedoStub, colorStub);
        undoRedoStub = new UndoRedoService(drawingStub);
        bucketMessengerServiceStub = new BucketMessengerService();
        colorStub = new ColorService(drawingStub, bucketMessengerServiceStub);

        TestBed.configureTestingModule({
            declarations: [LineAttributeComponent],
            providers: [
                { provide: LineService, useValue: lineStub },
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
        fixture = TestBed.createComponent(LineAttributeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // JunctionChange
    it('junctionChange should change the type of junction used to false if toogle is true', () => {
        component.toggle = true;
        const expectedResult = false;
        component.junctionChange();
        expect(component.toggle).toEqual(expectedResult);
    });

    it('junctionChange should change the type of junction used to true if toggle is false', () => {
        component.toggle = false;
        const expectedResult = true;
        component.junctionChange();
        expect(component.toggle).toEqual(expectedResult);
    });

    // sliderOnChange
    it('onSizeChange of line service should change on MatSliderChange Event', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = 1;
        const spy = spyOn(lineStub, 'onSizeChange').and.callThrough();
        component.sliderChange(matSliderChange);
        expect(spy).toHaveBeenCalled();
    });

    it('onSizeChange of line service should not change on MatSliderChange Event if the value of the change is null', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = null;
        const spy = spyOn(lineStub, 'onSizeChange').and.callThrough();
        component.sliderChange(matSliderChange);
        expect(spy).not.toHaveBeenCalled();
    });

    // sliderJunctionChange
    it('onSizeChange of line service should change on MatSliderChange Event', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = 1;
        const spy = spyOn(lineStub, 'onJunctionSizeChange').and.callThrough();
        component.sliderJunctionChange(matSliderChange);
        expect(spy).toHaveBeenCalled();
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
