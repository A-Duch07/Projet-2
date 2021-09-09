// tslint:disable: no-string-literal
// Justification : On a besoin de string literals pour tester et acceder a certains attributs privees de notre component/service
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EllipseService } from './ellipse.service';

describe('EllipseService', () => {
    let service: EllipseService;
    let mouseEvent: MouseEvent;
    let keyboardEvent: KeyboardEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    // tslint:disable-next-line: no-any
    let fillEllipseSpy: jasmine.Spy<any>;
    // tslint:disable-next-line: no-any
    let strokeSpy: jasmine.Spy<any>;
    let drawingService: DrawingService;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(EllipseService);
        drawingService = TestBed.inject(DrawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        drawingService.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingService.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingService.canvas = canvasTestHelper.canvas;
        drawingService.previewCanvas = canvasTestHelper.canvas;

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        service = TestBed.inject(EllipseService);

        // tslint:disable-next-line: no-any
        fillEllipseSpy = spyOn<any>(previewCtxStub, 'fill');
        // tslint:disable-next-line: no-any
        strokeSpy = spyOn<any>(previewCtxStub, 'stroke');
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            buttons: 1,
        } as MouseEvent;
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it('calculateCoordCentre should set coordCentre to the correct position', () => {
        const expectedResult: Vec2 = { x: 5, y: 5 };
        const position1: Vec2 = { x: 0, y: 0 };
        service.mouseDownCoord = { x: 10, y: 10 };
        service.calculateCoordCentre(position1);
        // tslint:disable-next-line: no-string-literal
        expect(service['coordCentre']).toEqual(expectedResult);
    });

    it('calculateRayon should set rayon of the ellipse as the correct rayon', () => {
        const expectedResult: Vec2 = { x: 5, y: 5 };
        const position1: Vec2 = { x: 0, y: 0 };
        service.mouseDownCoord = { x: 10, y: 10 };
        service.calculateRayon(position1);
        // tslint:disable-next-line: no-string-literal
        expect(service['rayon']).toEqual(expectedResult);
    });

    it('calculatePerimeter should set cote of the perimeter as the correct cote', () => {
        const expectedResult: Vec2 = { x: -10, y: -10 };
        const position1: Vec2 = { x: 0, y: 0 };
        service.mouseDownCoord = { x: 10, y: 10 };
        service.calculatePerimeter(position1);
        // tslint:disable-next-line: no-string-literal
        expect(service['cote']).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it('mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it('onMouseDown should clearPath() if mouseDown is true', () => {
        service.mouseDown = true;
        service.onMouseDown(mouseEvent);
        const expectedResult: Vec2 = { x: 25, y: 25 };
        expect(service.mouseDownCoord).toEqual(expectedResult);
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

    it(' onMouseUp should no nothing if mouse event button is not left click ', () => {
        service.onMouseUp(mouseEvent);
        const expectedResult = false;
        expect(service.mouseDown).toEqual(expectedResult);
    });

    /*
    it(' onMouseUp should call drawEllipse if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service['drawingService'].canvas.width = ellipseConstants.TEST_VALUE;
        service['drawingService'].canvas.height = ellipseConstants.TEST_VALUE;
        service.onMouseUp(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });
    */

    it(' onMouseUp should call drawEllipse if mouse was already down', () => {
        service.currentStyle = 0;
        service.mouseDown = true;
        service.mouseDownCoord = { x: 0, y: 0 };
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service.onMouseUp(mouseEvent);
        const expectedResult = false;
        expect(service.mouseDown).toEqual(expectedResult);
    });

    it(' onMouseMove should call drawEllipse if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawEllipse if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });

    it('onMouseMove should call calculateRayon when ellipseMode is true', () => {
        const spy = spyOn(service, 'calculateRayon');
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            buttons: 2,
        } as MouseEvent;
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.ellipseMode = true;
        service.onMouseMove(mouseEventRClick);
        expect(spy).toHaveBeenCalled();
    });

    it('onSizeChange should change de baseCtx and the previewCtx lineWidth', () => {
        const width = 20;
        service.onSizeChange(width);
        // tslint:disable-next-line: no-string-literal
        expect(service['drawingService'].baseCtx.lineWidth).toEqual(width);
    });

    it('onSizeChange should change de baseCtx and the previewCtx lineWidth', () => {
        const width = 51;
        service.onSizeChange(width);
        // tslint:disable-next-line: no-string-literal
        expect(service['drawingService'].baseCtx.lineWidth).not.toEqual(width);
    });

    it('onKeyDown should not set ellipseMode to true if key is not shift', () => {
        keyboardEvent = {
            key: 'Escape',
        } as KeyboardEvent;
        service.ellipseMode = false;
        service.onKeyDown(keyboardEvent);
        const expectedResult = false;
        expect(service.ellipseMode).toEqual(expectedResult);
    });

    it('onKeyDown should set ellipseMode to true if key is shift', () => {
        keyboardEvent = {
            key: 'Shift',
        } as KeyboardEvent;
        // tslint:disable-next-line: no-string-literal
        service['coordCentre'] = { x: 0, y: 0 };
        // tslint:disable-next-line: no-string-literal
        service['rayon'] = { x: 1, y: 1 };
        service.mouseDownCoord = { x: 0, y: 0 };
        service.onKeyDown(keyboardEvent);
        const expectedResult = true;
        expect(service.ellipseMode).toEqual(expectedResult);
    });

    it('onKeyUp should not set ellipseMode to false if key is not shift', () => {
        keyboardEvent = {
            key: 'Escape',
        } as KeyboardEvent;
        service.ellipseMode = true;
        service.onKeyUp(keyboardEvent);
        const expectedResult = true;
        expect(service.ellipseMode).toEqual(expectedResult);
    });

    it('onKeyUp should not set ellipseMode to false if key is not shift', () => {
        keyboardEvent = {
            key: 'Shift',
        } as KeyboardEvent;
        // tslint:disable-next-line: no-string-literal
        service['coordCentre'] = { x: 0, y: 0 };
        // tslint:disable-next-line: no-string-literal
        service['rayon'] = { x: 1, y: 1 };
        service.mouseDownCoord = { x: 0, y: 0 };
        service.onKeyUp(keyboardEvent);
        const expectedResult = false;
        expect(service.ellipseMode).toEqual(expectedResult);
    });

    it('drawEllipse should not call ctx.stroke and should call ctx.fillellipse if style 1 is selected(plein)', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        // tslint:disable-next-line: no-string-literal
        service['rayon'] = { x: 100, y: 50 };
        service.currentStyle = 2;
        // tslint:disable-next-line: no-string-literal
        service['drawEllipse'](previewCtxStub);
        expect(strokeSpy).toHaveBeenCalled();
        expect(fillEllipseSpy).toHaveBeenCalled();
    });

    it('drawEllipse should call ctx.stroke and should not call ctx.fill if style 0 is selected(contour)', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        // tslint:disable-next-line: no-string-literal
        service['rayon'] = { x: 100, y: 50 };
        // tslint:disable-next-line: no-string-literal
        service['drawEllipse'](previewCtxStub);
        service.currentStyle = 0;
        expect(strokeSpy).toHaveBeenCalled();
        expect(fillEllipseSpy).not.toHaveBeenCalled();
    });

    it('drawEllipse should not call ctx.stroke and should call ctx.fillellipse if style 1 is selected(plein)', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        // tslint:disable-next-line: no-string-literal
        service['rayon'] = { x: 100, y: 50 };
        service.currentStyle = 1;
        // tslint:disable-next-line: no-string-literal
        service['drawEllipse'](previewCtxStub);
        expect(strokeSpy).not.toHaveBeenCalled();
        expect(fillEllipseSpy).toHaveBeenCalled();
    });

    it('drawEllipse should not call ctx.stroke and should call ctx.fillellipse if style 1 is selected(plein)', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.ellipseMode = false;
        // tslint:disable-next-line: no-string-literal
        service['rayon'] = { x: 100, y: 50 };
        service.currentStyle = 1;
        // tslint:disable-next-line: no-string-literal
        service['drawEllipse'](previewCtxStub);
        expect(strokeSpy).not.toHaveBeenCalled();
        expect(fillEllipseSpy).toHaveBeenCalled();
    });
});
