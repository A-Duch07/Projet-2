import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { BucketMessengerService } from '@app/services/bucket-messenger-service/bucket-messenger.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorService } from '@app/services/tools/color.service';
// import * as colorConstants from '@app/services/tools/tools-constants/color-service-constants';
import { of } from 'rxjs';
import { ColorAttributeComponent } from './color-attribute.component';

describe('ColorAttributeComponent', () => {
    let component: ColorAttributeComponent;
    let fixture: ComponentFixture<ColorAttributeComponent>;
    let mouseLeftEvent: MouseEvent;
    // tslint:disable-next-line: no-any
    let dialogSpy: jasmine.Spy<any>;
    let bucketMessengerServiceStub: BucketMessengerService;
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of({}), close: null });
    dialogRefSpyObj.componentInstance = { body: 'component' };
    let colorServiceStub: ColorService;
    let drawingStub: DrawingService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(async(() => {
        drawingStub = new DrawingService();
        bucketMessengerServiceStub = new BucketMessengerService();
        colorServiceStub = new ColorService(drawingStub, bucketMessengerServiceStub);
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [ColorAttributeComponent],
            providers: [{ provide: ColorService, useValue: colorServiceStub }],
        }).compileComponents();
    }));

    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        drawingStub.baseCtx = baseCtxStub;
        drawingStub.previewCtx = previewCtxStub;

        fixture = TestBed.createComponent(ColorAttributeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        dialogSpy = spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(dialogRefSpyObj);
        mouseLeftEvent = {
            buttons: 1,
        } as MouseEvent;
    });

    it('openDialog should createComponent', () => {
        component.openDialog();
        expect(component).toBeTruthy();
    });

    it('openDialog should call open from MatDialog', () => {
        component.openDialog();
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('switchColors should call switchColors from colorService', () => {
        const spy = spyOn(colorServiceStub, 'switchColors').and.callThrough();
        component.switchColors();
        expect(spy).toHaveBeenCalled();
    });

    it('selectColor should call selectColor from colorService and set currentColor to the right number', () => {
        const spy = spyOn(colorServiceStub, 'selectColor').and.callThrough();
        component.selectColor(0);
        expect(spy).toHaveBeenCalled();
        expect(component.currentColor).toEqual(colorServiceStub.currentColor);
    });

    it('previousColorSelection should call previousColorSelection from colorService', () => {
        const spy = spyOn(colorServiceStub, 'previousColorSelection').and.callThrough();
        component.previousColorSelection(mouseLeftEvent, 'rgba(0,0,0,1');
        expect(spy).toHaveBeenCalled();
    });
});
