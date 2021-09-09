import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { BucketMessengerService } from '@app/services/bucket-messenger-service/bucket-messenger.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { BucketService } from '@app/services/tools/bucket.service';
import { ColorService } from '@app/services/tools/color.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { BucketAttributeComponent } from './bucket-attribute.component';

// tslint:disable: no-string-literal no-magic-numbers

describe('BucketAttributeComponent', () => {
    let component: BucketAttributeComponent;
    let fixture: ComponentFixture<BucketAttributeComponent>;
    let drawingStub: DrawingService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let bucketStub: BucketService;
    let undoRedoStub: UndoRedoService;
    let colorStub: ColorService;
    let bucketMessengerServiceStub: BucketMessengerService;

    beforeEach(async(() => {
        drawingStub = new DrawingService();
        bucketMessengerServiceStub = new BucketMessengerService();
        undoRedoStub = new UndoRedoService(drawingStub);
        colorStub = new ColorService(drawingStub, bucketMessengerServiceStub);
        bucketStub = new BucketService(drawingStub, undoRedoStub, bucketMessengerServiceStub, colorStub);
        TestBed.configureTestingModule({
            declarations: [BucketAttributeComponent],
            providers: [
                { provide: UndoRedoService, useValue: undoRedoStub },
                { provide: BucketService, useValue: bucketStub },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingStub.baseCtx = baseCtxStub;
        drawingStub.previewCtx = previewCtxStub;
        fixture = TestBed.createComponent(BucketAttributeComponent);
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

    it('bucketService attribute tolerance should be modified correctly on value change of MatSliderChange Event', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = 100;
        component.sliderChange(matSliderChange);
        expect(bucketStub['tolerance']).toEqual(255);
    });

    it('bucketService attribute tolerance should not be modified on value of MatSliderChange Event of null', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        matSliderChange.value = null;
        component.sliderChange(matSliderChange);
        expect(bucketStub['tolerance']).toEqual(0);
    });
});
