import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { BucketMessengerService } from '@app/services/bucket-messenger-service/bucket-messenger.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorService } from '@app/services/tools/color.service';
import { PolygonService } from '@app/services/tools/polygon.service';
import * as polygonConstants from '@app/services/tools/tools-constants/polygon-service-constants';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { PolygonAttributeComponent } from './polygon-attribute.component';

describe('PolygonAttributeComponent', () => {
    let component: PolygonAttributeComponent;
    let fixture: ComponentFixture<PolygonAttributeComponent>;
    let drawingStub: DrawingService;
    let polygonStub: PolygonService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let undoRedoStub: UndoRedoService;
    let colorStub: ColorService;
    let bucketMessengerServiceStub: BucketMessengerService;

    beforeEach(async(() => {
        drawingStub = new DrawingService();
        bucketMessengerServiceStub = new BucketMessengerService();
        polygonStub = new PolygonService(drawingStub, undoRedoStub, colorStub);
        undoRedoStub = new UndoRedoService(drawingStub);
        colorStub = new ColorService(drawingStub, bucketMessengerServiceStub);

        TestBed.configureTestingModule({
            declarations: [PolygonAttributeComponent],
            providers: [
                { provide: PolygonService, useValue: polygonStub },
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
        fixture = TestBed.createComponent(PolygonAttributeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onSizeChange of polygon service should change on MatSliderChange Event', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = 1;
        const spy = spyOn(polygonStub, 'onSizeChange').and.callThrough();
        component.sliderSizeChange(matSliderChange);
        expect(spy).toHaveBeenCalled();
    });

    it('onSizeChange of polygon service should not change on MatSliderChange Event if the value of the change is null', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = null;
        const spy = spyOn(polygonStub, 'onSizeChange').and.callThrough();
        component.sliderSizeChange(matSliderChange);
        expect(spy).not.toHaveBeenCalled();
    });

    it('onEdgesChange of polygon service should change on MatSliderChange Event', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = polygonConstants.TEST_STYLE + 1;
        const spy = spyOn(polygonStub, 'onEdgesChange').and.callThrough();
        component.sliderEdgesAmount(matSliderChange);
        expect(spy).toHaveBeenCalled();
    });

    it('onEdgesChange of polygon service should not change on MatSliderChange Event if the value of the change is null', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = null;
        const spy = spyOn(polygonStub, 'onEdgesChange').and.callThrough();
        component.sliderEdgesAmount(matSliderChange);
        expect(spy).not.toHaveBeenCalled();
    });

    it('selectStyle should change the current style of the polygon service and should change the current style of the component', () => {
        const styleNumber = 1;
        component.selectStyle(1);
        expect(polygonStub.currentStyle).toEqual(styleNumber);
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
