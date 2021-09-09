import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/drawing/selection-service';
import { SelectionEllipseService } from './selection-ellipse.service';

// tslint:disable: no-string-literal
// tslint:disable: no-magic-numbers
// tslint:disable: no-any max-file-line-count

describe('SelectionEllipseService', () => {
    let service: SelectionEllipseService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let resizeServiceSpy: jasmine.SpyObj<SelectionService>;

    let onMouseDownSpy: jasmine.Spy<any>;
    let drawLineSpy: jasmine.Spy<any>;
    let saveCtxSpy: jasmine.Spy<any>;
    let restoreCtxSpy: jasmine.Spy<any>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let selectionCtxStub: CanvasRenderingContext2D;
    let baseCanvasStub: HTMLCanvasElement;
    let selectionCanvasStub: HTMLCanvasElement;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        resizeServiceSpy = jasmine.createSpyObj('SelectionService', [
            'drawCanvas',
            'onMouseDown',
            'onMouseUp',
            'changePassedDimensions',
            'changeStyle',
            'onMouseMove',
            'onKeyDown',
            'onKeyUp',
            'imageClicked',
            'confirmSelection',
            'cornerClicked',
            'newSelection',
        ]);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: SelectionService, useValue: resizeServiceSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        selectionCtxStub = canvasTestHelper.selectionCanvas.getContext('2d') as CanvasRenderingContext2D;

        baseCanvasStub = canvasTestHelper.canvas;
        selectionCanvasStub = canvasTestHelper.selectionCanvas;

        service = TestBed.inject(SelectionEllipseService);
        drawLineSpy = spyOn<any>(service, 'drawLine').and.callThrough();
        onMouseDownSpy = spyOn<any>(service, 'onMouseDown').and.callThrough();

        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].selectionCtx = selectionCtxStub;
        service['drawingService'].canvas = baseCanvasStub;
        service['drawingService'].selectionCanvas = selectionCanvasStub;

        saveCtxSpy = spyOn<any>(service['drawingService'].previewCtx, 'save');
        // tslint:disable-next-line: no-string-literal
        restoreCtxSpy = spyOn<any>(service['drawingService'].previewCtx, 'restore');

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            buttons: 1,
        } as MouseEvent;

        service['offsetPosition'] = { x: 0, y: 0 };
        service['offsetPositionSquare'] = { x: 0, y: 0 };
        service['mouseDownCoord'] = { x: 0, y: 0 };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' calculateOffset should correctly calculate the rectangle new edge', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        const newMousePosition: Vec2 = { x: -25, y: -25 };
        service['calculateOffset'](newMousePosition);
        expect(service['offsetPosition']).toEqual(newMousePosition);
    });

    it(' calculateOffset should correctly calculate the rectangle new edge', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        const newMousePosition: Vec2 = { x: -25, y: -25 };
        service['calculateOffset'](newMousePosition);
        expect(service['offsetPosition']).toEqual(newMousePosition);
    });

    it('calculateOffset should set the offsetSquare values the same (absolute)', () => {
        const newOffset: Vec2 = { x: 2000, y: 2000 };
        const mouseDownCoord: Vec2 = { x: 60, y: 60 };
        service['mouseDownCoord'] = mouseDownCoord;
        service['calculateOffset'](newOffset);
        expect(Math.abs(service['offsetPositionSquare'].x)).toEqual(Math.abs(service['offsetPositionSquare'].y));
    });

    it('calculateOffset should assign the right values to the offset depending on which direction the user input is', () => {
        let mouseDownCoord: Vec2 = { x: 0, y: 0 };
        service['mouseDownCoord'] = mouseDownCoord;
        const newOffset1: Vec2 = { x: 100, y: 50 };
        service['calculateOffset'](newOffset1);
        expect(service['offsetPositionSquare'].x).toEqual(newOffset1.y);
        expect(service['offsetPositionSquare'].y).toEqual(newOffset1.y);

        mouseDownCoord = { x: 0, y: 0 };
        const newOffset2: Vec2 = { x: 100, y: -50 };
        service['calculateOffset'](newOffset2);
        expect(service['offsetPositionSquare'].x).toEqual(-newOffset2.y);
        expect(service['offsetPositionSquare'].y).toEqual(newOffset2.y);

        mouseDownCoord = { x: 0, y: 0 };
        const newOffset3: Vec2 = { x: -100, y: 50 };
        service['calculateOffset'](newOffset3);
        expect(service['offsetPositionSquare'].x).toEqual(-newOffset3.y);
        expect(service['offsetPositionSquare'].y).toEqual(newOffset3.y);

        mouseDownCoord = { x: 0, y: 0 };
        const newOffset4: Vec2 = { x: -100, y: -50 };
        service['calculateOffset'](newOffset4);
        expect(service['offsetPositionSquare'].x).toEqual(newOffset4.y);
        expect(service['offsetPositionSquare'].y).toEqual(newOffset4.y);

        mouseDownCoord = { x: 0, y: 0 };
        const newOffset5: Vec2 = { x: 0, y: 0 };
        service['calculateOffset'](newOffset5);
        expect(service['offsetPositionSquare'].x).toEqual(0);
        expect(service['offsetPositionSquare'].y).toEqual(0);
    });

    it(' mouseDown should call selectionService confirm selection if the selection is not clicked', () => {
        const mouseEvent2 = {
            offsetX: 2000,
            offsetY: 2000,
            buttons: 1,
        } as MouseEvent;
        service['drawingService'].imageSelected = true;
        resizeServiceSpy.cornerClicked.and.callFake(() => {
            return -1;
        });

        resizeServiceSpy.imageClicked.and.callFake(() => {
            service['drawingService'].imageSelected = false;
            return false;
        });
        service['drawingService'].imageSelected = true;
        service.onMouseDown(mouseEvent2);
        expect(onMouseDownSpy).toHaveBeenCalled();
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            buttons: 2,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' mouseDown should call onMouseDown of SelectionService when an the mouse event is inside the selection', () => {
        const mouseEvent2 = {
            offsetX: 10,
            offsetY: 10,
            buttons: 1,
        } as MouseEvent;

        service['drawingService'].imageSelected = true;
        resizeServiceSpy.imageClicked.and.callFake(() => {
            return true;
        });
        service.onMouseDown(mouseEvent2);
        expect(onMouseDownSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should call onMouseUp of the resize service if an image is selected', () => {
        service.mouseDown = true;
        service.mouseDownCoord = { x: 0, y: 0 };
        service['drawingService'].imageSelected = true;

        service.onMouseUp(mouseEvent);
        expect(resizeServiceSpy.onMouseUp).toHaveBeenCalled();
    });

    it(' onMouseUp should call changePassedDImensions with offsetPositionSquare if squareMode is selected', () => {
        service.mouseDown = true;
        service.mouseDownCoord = { x: 20, y: 20 };
        service['offsetPosition'] = { x: 25, y: 25 };
        service['offsetPositionSquare'] = { x: 25, y: 25 };
        service['drawingService'].imageSelected = false;
        service['squareMode'] = true;

        service.onMouseUp(mouseEvent);
        expect(resizeServiceSpy.newSelection).toHaveBeenCalledWith({ x: 20, y: 20 }, { x: 5, y: 5 }, 2, []);
    });

    it(' onMouseUp should call changePassedDImensions with offsetPosition if squareMode is not selected', () => {
        service.mouseDown = true;
        service.mouseDownCoord = { x: 20, y: 20 };
        service['offsetPosition'] = { x: 25, y: 25 };
        service['offsetPositionSquare'] = { x: 25, y: 25 };
        service['drawingService'].imageSelected = false;
        service['squareMode'] = false;

        service.onMouseUp(mouseEvent);
        expect(resizeServiceSpy.newSelection).toHaveBeenCalledWith({ x: 20, y: 20 }, { x: 5, y: 5 }, 2, []);
    });

    it(' onMouseUp should set mouseDown to false if mouseDown is already false', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };
        service['drawingService'].imageSelected = true;

        service.onMouseUp(mouseEvent);
        expect(service.mouseDown).toBeFalse();
    });

    it(' onMouseUp should set mouseDown to false if canvas is not clicked', () => {
        service.mouseDown = true;
        service.mouseDownCoord = { x: -2000, y: -2000 };
        service['drawingService'].imageSelected = false;

        service.onMouseUp(mouseEvent);
        expect(service.mouseDown).toBeFalse();

        service.mouseDown = true;
        service.mouseDownCoord = { x: 50, y: -2000 };
        service['drawingService'].imageSelected = false;

        service.onMouseUp(mouseEvent);
        expect(service.mouseDown).toBeFalse();

        service.mouseDown = true;
        service.mouseDownCoord = { x: -2000, y: 50 };
        service['drawingService'].imageSelected = false;

        service.onMouseUp(mouseEvent);
        expect(service.mouseDown).toBeFalse();
    });

    it(' onMouseMove should call onMouseMove of the resize service if an image is selected', () => {
        service.mouseDown = true;
        service.mouseDownCoord = { x: 0, y: 0 };
        service['drawingService'].imageSelected = true;

        service.onMouseMove(mouseEvent);
        expect(resizeServiceSpy.onMouseMove).toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine if an image is not selected', () => {
        service.mouseDown = true;
        service.mouseDownCoord = { x: 0, y: 0 };
        service['drawingService'].imageSelected = false;

        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawLine if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it('onKeyDown should set squareMode to true if the shift key is pressed', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'Shift',
        });
        service['firstSquareMode'] = false;
        service.onKeyDown(event);
        expect(service['squareMode']).toBeTrue();
    });

    it('onKeyDown should call drawLine when the shift key is first pressed and set firstSquareMode to false', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'Shift',
        });
        service.mouseDownCoord = { x: 0, y: 0 };
        service['offsetPosition'] = { x: 100, y: 50 };
        service['calculateOffset'](service['offsetPosition']);
        service['firstSquareMode'] = true;
        service.onKeyDown(event);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('onKeyDown should pass the dimensions of the canvas to changePassedDimensions of the SelectionService if ctrl+a are pressed', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'a',
            ctrlKey: true,
        });
        service.onKeyDown(event);
        expect(resizeServiceSpy.newSelection).toHaveBeenCalledWith(
            { x: 0, y: 0 },
            { x: service['drawingService'].canvas.width, y: service['drawingService'].canvas.height },
            2,
            [],
        );
    });

    it('onKeyDown call SelectionService onKeyDown if the keyboardEvent is not shift, escape, or ctrl+a', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'm',
        });
        service.onKeyDown(event);
        expect(resizeServiceSpy.onKeyDown).toHaveBeenCalled();
    });

    it('onKeyUp should call drawLine when the shift key is released and squareMode is true', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'Shift',
        });
        service.mouseDownCoord = { x: 0, y: 0 };
        service['offsetPosition'] = { x: 100, y: 50 };
        service['firstSquareMode'] = false;
        service['squareMode'] = true;
        service.onKeyUp(event);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('onKeyUp should not call drawLine when the shift key is released and squareMode is false', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'Shift',
        });
        service.mouseDownCoord = { x: 0, y: 0 };
        service['offsetPosition'] = { x: 100, y: 50 };
        service['firstSquareMode'] = false;
        service['squareMode'] = false;
        service.onKeyUp(event);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it('onKeyUp should call SelectionService onKeyUp when the shift key is not the one released', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'b',
        });
        service.onKeyUp(event);
        expect(resizeServiceSpy.onKeyUp).toHaveBeenCalled();
    });

    it('onSelect should set imageSelected to false the preview canvas state', () => {
        service.onSelect();
        expect(saveCtxSpy).toHaveBeenCalled();
    });

    it('onDeSelect should restore the preview canvas state', () => {
        service.onDeSelect();
        expect(restoreCtxSpy).toHaveBeenCalled();
    });
});
