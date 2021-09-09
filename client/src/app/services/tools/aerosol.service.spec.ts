// tslint:disable: no-string-literal
// Justification : On a besoin de string literals pour tester et acceder a certains attributs privees de notre component/service
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { AerosolService } from './aerosol.service';
import * as aerosolConstants from './tools-constants/aerosol-service-constants';

describe('AerosolService', () => {
    let service: AerosolService;
    let canvasTestHelper: CanvasTestHelper;
    let drawingService: DrawingService;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let mouseEvent1: MouseEvent;
    let mouseEvent2: MouseEvent;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AerosolService);
        drawingService = TestBed.inject(DrawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        drawingService.canvas = canvasTestHelper.canvas;
        drawingService.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingService.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        mouseEvent1 = { offsetX: 25, offsetY: 25, buttons: 1 } as MouseEvent;
        mouseEvent2 = { offsetX: 25, offsetY: 25, buttons: 2 } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onSizeChange should correctly change the radius', () => {
        // service.radius = 0;
        const testValue = 20;
        service.onSizeChange(testValue);
        expect(service.radius).toEqual(testValue);
    });

    it('onEmissionChange should correctly change the emission rate', () => {
        service.emission = 0;
        const testValue = 1;
        service.onEmissionChange(testValue);
        expect(service.emission).toEqual(aerosolConstants.SECOND);
    });

    it('onGouteletteChange should correctly change the radius', () => {
        service.radius = 0;
        const testValue = 20;
        service.onGouteletteChange(testValue);
        expect(service.diametre).toEqual(testValue);
    });

    it('getRandomInt should correctly change the radius', () => {
        const testValue1 = 0;
        const testValue2 = 1;
        expect(service['getRandomInt'](testValue1, testValue2)).toBeLessThanOrEqual(testValue2);
    });

    it('stopSpraying should set the mousedown boolean to false', () => {
        service.mouseDown = true;
        service.pathData = [];
        service['stopSpraying'](mouseEvent1);
        const expectedResult = false;
        expect(service.mouseDown).toEqual(expectedResult);
    });

    it('stopSpraying should do nothing if mousedown is false', () => {
        service.mouseDown = false;
        service.pathData = [];
        service['stopSpraying'](mouseEvent1);
        const expectedResult = false;
        expect(service.mouseDown).toEqual(expectedResult);
    });

    it('drawSpray should not change mousedown ', () => {
        service.mouseDown = true;
        service.emission = aerosolConstants.BASE_EMISSION;
        service.radius = aerosolConstants.BASE_RADIUS;
        service.diametre = aerosolConstants.BASE_RADIUS * 2;
        service.currentMousePosition = { x: 0, y: 0 };
        service.pathData = [];
        service['drawSpray'](baseCtxStub);
        const expectedResult = true;
        expect(service.mouseDown).toEqual(expectedResult);
    });

    it('start spraying should empty the path data and add the currentposition', () => {
        service.mouseDown = false;
        service.emission = aerosolConstants.BASE_EMISSION;
        service.radius = aerosolConstants.BASE_RADIUS;
        service.diametre = aerosolConstants.BASE_RADIUS * 2;
        service.currentMousePosition = { x: 0, y: 0 };
        service.pathData = [];
        service.pathData.push(service.currentMousePosition);
        drawingService.baseCtx = baseCtxStub;
        service['startSpraying'](mouseEvent1);
        const expectedResult = true;
        expect(service.mouseDown).toEqual(expectedResult);
    });

    it('start spraying should do nothing if the wrong button', () => {
        service.mouseDown = false;
        service['startSpraying'](mouseEvent2);
        const expectedResult = false;
        expect(service.mouseDown).toEqual(expectedResult);
    });

    it('onMouseDown should startSpraying', () => {
        service.mouseDown = false;
        service.emission = aerosolConstants.BASE_EMISSION;
        service.radius = aerosolConstants.BASE_RADIUS;
        service.diametre = aerosolConstants.BASE_RADIUS * 2;
        service.currentMousePosition = { x: 0, y: 0 };
        service.pathData = [];
        service.pathData.push(service.currentMousePosition);
        drawingService.baseCtx = baseCtxStub;
        service.onMouseDown(mouseEvent1);
        const expectedResult = true;
        expect(service.mouseDown).toEqual(expectedResult);
    });

    it('onMouseDown should stopSpraying', () => {
        service.mouseDown = true;
        service.onMouseUp(mouseEvent1);
        const expectedResult = false;
        expect(service.mouseDown).toEqual(expectedResult);
    });

    it('onMouseMove should update the current mouse position', () => {
        service.mouseDown = true;
        service.pathData = [];
        service.onMouseMove(mouseEvent1);
        const expectedResult = 1;
        expect(service.pathData.length).toEqual(expectedResult);
    });

    it('onMouseMove should do nothing if wrong mouse button', () => {
        service.mouseDown = false;
        service.pathData = [];
        service.onMouseMove(mouseEvent2);
        const expectedResult = 0;
        expect(service.pathData.length).toEqual(expectedResult);
    });
});
