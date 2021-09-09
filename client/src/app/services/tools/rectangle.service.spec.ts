import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleService } from './rectangle.service';

// tslint:disable: no-any

describe('RectangleService', () => {
    let service: RectangleService;
    let mouseEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawLineSpy: jasmine.Spy<any>;
    let fillRectSpy: jasmine.Spy<any>;
    let strokeSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(RectangleService);

        drawLineSpy = spyOn<any>(service, 'drawLine').and.callThrough();

        fillRectSpy = spyOn<any>(previewCtxStub, 'fillRect');
        strokeSpy = spyOn<any>(previewCtxStub, 'stroke');

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        service['drawingService'].canvas = canvasTestHelper.canvas;
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            buttons: 1,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
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

    it(' onMouseUp should call drawLine if mouse was already down', () => {
        service['firstSquareMode'] = false;
        service.mouseDown = true;
        service.mouseDownCoord = { x: 0, y: 0 };
        service['squareMode'] = false;
        service.currentStyle = 0;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service.onMouseUp(mouseEvent);
        expect(service['firstSquareMode']).toEqual(false);
    });

    it(' onMouseUp should not call drawLine if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawLine if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' calculateOffset should correctly calculate the rectangle new edge', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        const newMousePosition: Vec2 = { x: -25, y: -25 };
        service['calculateOffset'](newMousePosition);
        expect(service['offsetPosition']).toEqual(newMousePosition);
    });

    it('calculateOffsetSquare should set the offsetSquare values the same (absolute)', () => {
        const newOffset: Vec2 = { x: 100, y: -50 };
        service['offsetPosition'] = newOffset;
        service['calculateOffsetSquare']();
        expect(Math.abs(service['offsetPositionSquare'].x)).toEqual(Math.abs(service['offsetPositionSquare'].y));
    });

    it('caculateOffsetSquare should assign the right values to the offset depending on which direction the user input is', () => {
        const newOffset1: Vec2 = { x: 100, y: 50 };
        service['offsetPosition'] = newOffset1;
        service['calculateOffsetSquare']();
        expect(service['offsetPositionSquare'].x).toEqual(newOffset1.y);
        expect(service['offsetPositionSquare'].y).toEqual(newOffset1.y);

        const newOffset2: Vec2 = { x: 100, y: -50 };
        service['offsetPosition'] = newOffset2;
        service['calculateOffsetSquare']();
        expect(service['offsetPositionSquare'].x).toEqual(-newOffset2.y);
        expect(service['offsetPositionSquare'].y).toEqual(newOffset2.y);

        const newOffset3: Vec2 = { x: -100, y: 50 };
        service['offsetPosition'] = newOffset3;
        service['calculateOffsetSquare']();
        expect(service['offsetPositionSquare'].x).toEqual(-newOffset3.y);
        expect(service['offsetPositionSquare'].y).toEqual(newOffset3.y);

        const newOffset4: Vec2 = { x: -100, y: -50 };
        service['offsetPosition'] = newOffset4;
        service['calculateOffsetSquare']();
        expect(service['offsetPositionSquare'].x).toEqual(newOffset4.y);
        expect(service['offsetPositionSquare'].y).toEqual(newOffset4.y);

        const newOffset5: Vec2 = { x: 0, y: 0 };
        service['offsetPosition'] = newOffset5;
        service['calculateOffsetSquare']();
        expect(service['offsetPositionSquare'].x).toEqual(0);
        expect(service['offsetPositionSquare'].y).toEqual(0);
    });

    it('onMouseMove should call CalculateOffsetSquare when squareMode is true', () => {
        const spy = spyOn<any>(service, 'calculateOffsetSquare');
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            buttons: 1,
        } as MouseEvent;
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service['squareMode'] = true;
        service.onMouseMove(mouseEventRClick);
        expect(spy).toHaveBeenCalled();
    });

    it('onKeyDown should set squareMode to true if the shift key is pressed', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'Shift',
        });
        service['firstSquareMode'] = false;
        service.onKeyDown(event);
        expect(service['squareMode']).toBeTrue();
    });

    it('onKeyDown should not set squareMode to true if the shift key is not pressed', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'Enter',
        });
        service['squareMode'] = false;
        service.onKeyDown(event);
        expect(service['squareMode']).toBeFalse();
    });

    it('onKeyDown should call drawLine when the shift key is first pressed and set firstSquareMode to false', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'Shift',
        });
        service.mouseDownCoord = { x: 0, y: 0 };
        service['offsetPosition'] = { x: 100, y: 50 };
        service['calculateOffsetSquare']();
        service['firstSquareMode'] = true;
        service.onKeyDown(event);
        expect(drawLineSpy).toHaveBeenCalled();
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

    it('onKeyUp should not set squareMode to false if the shift key is not released', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'Enter',
        });
        service['squareMode'] = false;
        service.onKeyUp(event);
        expect(service['squareMode']).toBeFalse();
    });

    it('onSizeChange should change de baseCtx and the previewCtx lineWidth', () => {
        const width = 20;
        service.onSizeChange(width);
        expect(service['drawingService'].baseCtx.lineWidth).toEqual(width);
        expect(service['drawingService'].previewCtx.lineWidth).toEqual(width);
    });

    it('drawLine should call ctx.stroke and should not call ctx.fillRect if style 0 is selected(contour)', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service['offsetPosition'] = { x: 100, y: 50 };
        service['drawLine'](previewCtxStub);
        service.currentStyle = 0;
        expect(strokeSpy).toHaveBeenCalled();
        expect(fillRectSpy).not.toHaveBeenCalled();
    });

    it('drawLine should not call ctx.stroke and should call ctx.fillRect if style 1 is selected(plein)', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service['offsetPosition'] = { x: 100, y: 50 };
        service.currentStyle = 1;
        service['drawLine'](previewCtxStub);
        expect(strokeSpy).not.toHaveBeenCalled();
        expect(fillRectSpy).toHaveBeenCalled();
    });

    it('drawLine should not call ctx.stroke and should call ctx.fillRect if style 1 is selected(plein)', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service['offsetPosition'] = { x: 100, y: 50 };
        service.currentStyle = 2;
        service['drawLine'](previewCtxStub);
        expect(strokeSpy).toHaveBeenCalled();
        expect(fillRectSpy).toHaveBeenCalled();
    });

    it('drawLine should not call ctx.stroke and should not call ctx.fillRect if style 4 is selected(does not exist)', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service['offsetPosition'] = { x: 100, y: 50 };
        service.currentStyle = 4;
        service['drawLine'](previewCtxStub);
        expect(strokeSpy).not.toHaveBeenCalled();
        expect(fillRectSpy).not.toHaveBeenCalled();
    });

    it(' on select should set the curernt style to 0', () => {
        service.currentStyle = 0;
        service.onSelect();
        expect(service.currentStyle).toEqual(0);
    });
});
