// tslint:disable: no-string-literal
// Justification : On a besoin de string literals pour tester et acceder a certains attributs privees de notre component/service
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PolygonService } from './polygon.service';
import * as polygonConstants from './tools-constants/polygon-service-constants';

describe('PolygonService', () => {
    let service: PolygonService;
    let canvasTestHelper: CanvasTestHelper;
    let drawingService: DrawingService;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let mouseEvent: MouseEvent;
    let mouseEvent2: MouseEvent;
    let mouseEvent3: MouseEvent;
    let position1: Vec2;
    let position2: Vec2;
    let position3: Vec2;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PolygonService);
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
        mouseEvent = { offsetX: 25, offsetY: 25, buttons: 1 } as MouseEvent;
        mouseEvent2 = { offsetX: 30, offsetY: 30, buttons: 1 } as MouseEvent;
        mouseEvent3 = { offsetX: 30, offsetY: 30, buttons: 2 } as MouseEvent;
        position1 = { x: 30, y: 30 };
        position2 = { x: 36, y: 40 };
        position3 = { x: 40, y: 36 };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onSelect should change to edgesAmount to 6', () => {
        const expectedResult = 6;
        service.onSelect();
        expect(service.edgesAmount).toEqual(expectedResult);
    });

    it(' onSizeChange should change the lineWidth to the correct value', () => {
        const expectedResult: number = polygonConstants.MAX_INPUT;
        service.onSizeChange(polygonConstants.MAX_INPUT + 1);
        expect(baseCtxStub.lineWidth).toEqual(expectedResult);
    });

    it(' onSizeChange should change the lineWidth to the correct value', () => {
        const expectedResult: number = polygonConstants.MIN_INPUT;
        service.onSizeChange(polygonConstants.MIN_INPUT);
        expect(baseCtxStub.lineWidth).toEqual(expectedResult);
    });

    it(' onSizeChange should change the lineWidth to the correct value', () => {
        const expectedResult: number = polygonConstants.MIN_INPUT + 1;
        service.onSizeChange(polygonConstants.MIN_INPUT + 1);
        expect(baseCtxStub.lineWidth).toEqual(expectedResult);
    });

    it(' onEdgesChange should change the amount of edges to the correct value', () => {
        const expectedResult: number = polygonConstants.MIN_EDGES;
        service.edgesAmount = polygonConstants.MAX_EDGES;
        service.onEdgesChange(polygonConstants.MIN_EDGES);
        expect(service.edgesAmount).toEqual(expectedResult);
    });

    it(' onEdgesChange should change the amount of edges to the correct value', () => {
        const expectedResult: number = polygonConstants.MAX_EDGES;
        service.edgesAmount = polygonConstants.MIN_EDGES;
        service.onEdgesChange(polygonConstants.MAX_EDGES);
        expect(service.edgesAmount).toEqual(expectedResult);
    });

    it(' onEdgesChange should change the amount of edges to the correct value', () => {
        const expectedResult: number = polygonConstants.MAX_EDGES - 1;
        service.edgesAmount = polygonConstants.MIN_EDGES;
        service.onEdgesChange(polygonConstants.MAX_EDGES - 1);
        expect(service.edgesAmount).toEqual(expectedResult);
    });

    it(' onMouseDown should change the startingPosition', () => {
        const expectedResult = position1;
        service.startingPosition = mouseEvent;
        service.onMouseDown(mouseEvent2);
        expect(service.startingPosition).toEqual(expectedResult);
    });

    it(' onMouseDown does nothing if mouseEvent is not leftClick', () => {
        service.onMouseDown(mouseEvent3);
        const expectedResult = false;
        expect(service.mouseDown).toEqual(expectedResult);
    });

    it(' getCircleRadius should return the correct radius', () => {
        service.startingPosition = position1;
        service.endingPosition = position2;
        const expectedResult = 3;
        const radius = service.getCircleRadius();
        expect(radius).toEqual(expectedResult);
    });

    it(' getCircleRadius should return the correct radius', () => {
        service.startingPosition = position1;
        service.endingPosition = position3;
        const expectedResult = 3;
        const radius = service.getCircleRadius();
        expect(radius).toEqual(expectedResult);
    });

    it(' clearPosition should set the starting and ending position to [0, 0]', () => {
        service.startingPosition = position1;
        service.endingPosition = position2;
        const expectedResult: Vec2 = { x: 0, y: 0 };
        service.clearPositions();
        expect(service.startingPosition).toEqual(expectedResult);
        expect(service.endingPosition).toEqual(expectedResult);
    });

    it(' drawPerimeter should set the correct circle center depending on starting and ending positions', () => {
        service.startingPosition = position1;
        service.endingPosition = position2;
        const radius = service.getCircleRadius();
        const expectedResult: Vec2 = { x: service.startingPosition.x + radius, y: service.startingPosition.y + radius };
        service.drawPerimeter(baseCtxStub, radius);
        expect(service.circleCenter).toEqual(expectedResult);
    });

    it(' drawPerimeter should set the correct circle center depending on starting and ending positions', () => {
        service.startingPosition = position2;
        service.endingPosition = position1;
        const radius = service.getCircleRadius();
        const expectedResult: Vec2 = { x: service.startingPosition.x - radius, y: service.startingPosition.y - radius };
        service.drawPerimeter(baseCtxStub, radius);
        expect(service.circleCenter).toEqual(expectedResult);
    });

    it(' drawPolygon will use the correct angle to draw a triangle', () => {
        service.edgesAmount = polygonConstants.MIN_EDGES;
        service.circleCenter = position1;
        const radius = polygonConstants.TEST_VALUE;
        service.drawPolygon(baseCtxStub, radius);
        const expectedResult = polygonConstants.MIN_EDGES_ANGLE_TEST;
        expect(service.angleTemp).toEqual(expectedResult);
    });

    it(' drawPolygon will use the correct angle to draw a dodecagon', () => {
        service.edgesAmount = polygonConstants.MAX_EDGES;
        service.circleCenter = position1;
        const radius = polygonConstants.TEST_VALUE;
        service.drawPolygon(baseCtxStub, radius);
        const expectedResult = polygonConstants.FULL_CIRCLE;
        expect(service.angleTemp).toEqual(expectedResult);
    });

    it(' draw with the currentstyle set to 0 should only draw the unfilled polygon', () => {
        service.currentStyle = 0;
        service.startingPosition = position2;
        service.endingPosition = position1;
        service.edgesAmount = polygonConstants.MAX_EDGES;
        const radius = service.getCircleRadius();
        service.draw(baseCtxStub, baseCtxStub, radius);
        const expectedResult = polygonConstants.FULL_CIRCLE;
        expect(service.angleTemp).toEqual(expectedResult);
    });

    it(' draw with the currentstyle set to 1 should only draw the filled polygon', () => {
        service.currentStyle = 1;
        service.startingPosition = position2;
        service.endingPosition = position1;
        service.edgesAmount = polygonConstants.MAX_EDGES;
        const radius = service.getCircleRadius();
        service.draw(baseCtxStub, baseCtxStub, radius);
        const expectedResult = polygonConstants.FULL_CIRCLE;
        expect(service.angleTemp).toEqual(expectedResult);
    });

    it(' draw with the currentstyle set to 2 should draw the filled polygon with its edges', () => {
        service.currentStyle = 2;
        service.startingPosition = position2;
        service.endingPosition = position1;
        service.edgesAmount = polygonConstants.MAX_EDGES;
        const radius = service.getCircleRadius();
        service.draw(baseCtxStub, baseCtxStub, radius);
        const expectedResult = polygonConstants.FULL_CIRCLE;
        expect(service.angleTemp).toEqual(expectedResult);
    });

    it(' draw should do nothing if the current style is not 0, 1 or 2', () => {
        service.currentStyle = polygonConstants.TEST_STYLE;
        service.startingPosition = position2;
        service.endingPosition = position1;
        service.edgesAmount = polygonConstants.MAX_EDGES;
        const radius = service.getCircleRadius();
        service.draw(baseCtxStub, baseCtxStub, radius);
        const expectedResult = 0;
        expect(service.angleTemp).toEqual(expectedResult);
    });

    it(' onMouseMove should reset the angletemps to 360 afterdrawing ', () => {
        service.currentStyle = 0;
        service.mouseDown = true;
        service.startingPosition = position1;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service.edgesAmount = polygonConstants.MAX_EDGES;
        service.onMouseMove(mouseEvent);
        const expectedResult = polygonConstants.FULL_CIRCLE;
        expect(service.angleTemp).toEqual(expectedResult);
    });

    it(' onMouseMove should do nothing if mouseDown button is not left click ', () => {
        service.onMouseMove(mouseEvent3);
        const expectedResult = false;
        expect(service.mouseDown).toEqual(expectedResult);
    });

    it(' onMouseUp should draw the correct polygon with the correct style at the correct angle', () => {
        service.currentStyle = 0;
        service.mouseDown = true;
        service.startingPosition = position1;
        service.endingPosition = position2;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service.edgesAmount = polygonConstants.MAX_EDGES;
        service.onMouseUp(mouseEvent);
        const expectedResult = polygonConstants.FULL_CIRCLE;
        expect(service.angleTemp).toEqual(expectedResult);
    });

    it(' onMouseUp should no nothing if mouse event button is not left click ', () => {
        service.onMouseUp(mouseEvent3);
        const expectedResult = 0;
        expect(service.angleTemp).toEqual(expectedResult);
    });
});
