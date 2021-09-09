import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { BucketMessengerService } from '@app/services/bucket-messenger-service/bucket-messenger.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { Observable, of } from 'rxjs';
import { BucketService } from './bucket.service';

// tslint:disable: no-string-literal no-any no-magic-numbers

class BucketMessengerServiceStub {
    receiveBucketColor(): Observable<number[]> {
        return of([0, 1, 2, 3]);
    }
}

describe('BucketService', () => {
    let service: BucketService;
    let mouseEventLeft: MouseEvent;
    let mouseEventRight: MouseEvent;
    let mouseEventMiddle: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let undoRedoServiceSpy: jasmine.SpyObj<UndoRedoService>;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    let floodFillSpy: jasmine.Spy<any>;
    let fillAllSpy: jasmine.Spy<any>;
    let getColorAtPositionSpy: jasmine.Spy<any>;
    let getPositionSpy: jasmine.Spy<any>;
    let modifyColorSpy: jasmine.Spy<any>;
    let verifySurroundingPositionsSpy: jasmine.Spy<any>;
    let verifyColorSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        undoRedoServiceSpy = jasmine.createSpyObj('UndoRedoService', ['saveCurrentState']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: BucketMessengerService, useClass: BucketMessengerServiceStub },
                { provide: UndoRedoService, useValue: undoRedoServiceSpy },
            ],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        canvasTestHelper = new CanvasTestHelper();
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(BucketService);

        service['drawingService'].canvas = canvasTestHelper.canvas;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        service['drawingService'].baseCtx.fillStyle = 'red';
        service['drawingService'].baseCtx.fillRect(0, 0, service['drawingService'].canvas.width, service['drawingService'].canvas.height);
        service['drawingService'].baseCtx.fillStyle = 'black';
        service['drawingService'].baseCtx.fillRect(0, 0, 1, 1);

        floodFillSpy = spyOn<any>(service, 'floodFill').and.callThrough();
        fillAllSpy = spyOn<any>(service, 'fillAll').and.callThrough();
        getColorAtPositionSpy = spyOn<any>(service, 'getColorAtPosition').and.callThrough();
        getPositionSpy = spyOn<any>(service, 'getPosition').and.callThrough();
        modifyColorSpy = spyOn<any>(service, 'modifyColor').and.callThrough();
        verifySurroundingPositionsSpy = spyOn<any>(service, 'verifySurroundingPositions').and.callThrough();
        verifyColorSpy = spyOn<any>(service, 'verifyColor').and.callThrough();

        mouseEventLeft = {
            offsetX: 25,
            offsetY: 25,
            buttons: 1,
        } as MouseEvent;

        mouseEventRight = {
            offsetX: 25,
            offsetY: 25,
            buttons: 2,
        } as MouseEvent;

        mouseEventMiddle = {
            offsetX: 25,
            offsetY: 25,
            buttons: 4,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should change this.newColor on bucketMessengerService during the service creation', () => {
        expect(service['newColor']).toEqual([0, 1, 2, 3]);
    });

    it('should call this.floodFill() on left click of mouse onMouseDown() and change mouseDownCoord accordingly', () => {
        const expectedMouseDownCoord: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEventLeft);
        expect(service['mouseDownCoord']).toEqual(expectedMouseDownCoord);
        expect(floodFillSpy).toHaveBeenCalledTimes(1);
    });

    it('should call this.fillAll() on right click of mouse onMouseDown() and change mouseDownCoord accordingly', () => {
        const expectedMouseDownCoord: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEventRight);
        expect(service['mouseDownCoord']).toEqual(expectedMouseDownCoord);
        expect(fillAllSpy).toHaveBeenCalledTimes(1);
    });

    it('should not call this.fillAll() or this.floodFill on mouseEvent that is not right or left click of mouse onMouseDown() and change mouseDownCoord accordingly', () => {
        const expectedMouseDownCoord: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEventMiddle);
        expect(service['mouseDownCoord']).toEqual(expectedMouseDownCoord);
        expect(fillAllSpy).not.toHaveBeenCalled();
        expect(floodFillSpy).not.toHaveBeenCalled();
    });

    it('should call saveCurrentState of UndoRedoService when onMouseDown() is called', () => {
        const expectedMouseDownCoord: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEventRight);
        expect(service['mouseDownCoord']).toEqual(expectedMouseDownCoord);
        expect(undoRedoServiceSpy.saveCurrentState).toHaveBeenCalledTimes(1);
    });

    it('verfiyColor should return true if the color sent is within the accepted tolerance', () => {
        service['tolerance'] = 255;
        service['color'] = [254, 254, 254, 254];
        const result: boolean = service['verifyColor']([0, 0, 0, 0]);
        expect(result).toBe(true);
    });

    it('verfiyColor should return false if the color sent is not within the accepted tolerance', () => {
        service['tolerance'] = 0;
        service['color'] = [254, 254, 254, 254];
        const result: boolean = service['verifyColor']([0, 0, 0, 0]);
        expect(result).toBe(false);
    });

    it('verfiyColor should return false if the color sent is not within the accepted tolerance', () => {
        service.onMouseDown(mouseEventLeft);
        service['newColor'] = [255, 255, 255, 255];
        service['modifyColor'](0);
        for (let i = 0; i < 4; i++) {
            expect(service['imageData'].data[i]).toEqual(service['newColor'][i]);
        }
    });

    it('floodFill should call getColorAtPosition, getPosition, modifyColor and verifySurroundingPositions when called', () => {
        service.onMouseDown(mouseEventLeft);
        expect(floodFillSpy).toHaveBeenCalledTimes(1);
        expect(getColorAtPositionSpy).toHaveBeenCalled();
        expect(getPositionSpy).toHaveBeenCalled();
        expect(modifyColorSpy).toHaveBeenCalled();
        expect(verifySurroundingPositionsSpy).toHaveBeenCalled();
    });

    it('fillAll should call getColorAtPosition, getPosition, modifyColor and verifyColor when called', () => {
        service.onMouseDown(mouseEventRight);
        expect(fillAllSpy).toHaveBeenCalledTimes(1);
        expect(getColorAtPositionSpy).toHaveBeenCalled();
        expect(getPositionSpy).toHaveBeenCalled();
        expect(modifyColorSpy).toHaveBeenCalled();
        expect(verifyColorSpy).toHaveBeenCalled();
    });
});
