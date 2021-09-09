// tslint:disable: no-string-literal
// Justification : On a besoin de string literals pour tester et acceder a certains attributs privees de notre component/service
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from './line.service';
import * as lineConstants from './tools-constants/line-service-constants';

describe('LineService', () => {
    let lineService: LineService;
    let drawingService: DrawingService;
    let mouseEvent: MouseEvent;
    let keyboardEvent: KeyboardEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        drawingService = TestBed.inject(DrawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        drawingService.canvas = canvasTestHelper.canvas;
        drawingService.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingService.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        lineService = TestBed.inject(LineService);
        lineService['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        lineService['drawingService'].previewCtx = previewCtxStub;
        mouseEvent = { offsetX: 25, offsetY: 25, buttons: 1 } as MouseEvent;
    });

    it('should be created', () => {
        expect(lineService).toBeTruthy();
    });

    it(' setDrawingJunction should set the type of junction correctly', () => {
        const expectedResult = true;
        lineService['isDrawingJunction'] = true;
        expect(lineService['isDrawingJunction']).toEqual(expectedResult);
    });

    it(' onSelect should change the line cap to the correct value', () => {
        const expectedResult = lineConstants.LINE_CAP_ROUND;
        lineService.onSelect();
        expect(drawServiceSpy.baseCtx.lineCap).toEqual(expectedResult);
    });

    it(' onSizeChange should change the lineWidth to the correct value', () => {
        const expectedResult: number = lineConstants.TEST_VALUE;
        lineService.onSizeChange(lineConstants.TEST_VALUE);
        expect(baseCtxStub.lineWidth).toEqual(expectedResult);
    });

    it(' onJunctionTypeChange should change the type of junction to the correct value', () => {
        const expectedResult = true;
        lineService.onJunctionTypeChange(true);
        expect(lineService['isDrawingJunction']).toEqual(expectedResult);
    });

    it(' onJunctionsizeChange should change the size of junction to the correct value', () => {
        const expectedResult: number = lineConstants.TEST_VALUE;
        lineService.onJunctionSizeChange(lineConstants.TEST_VALUE);
        expect(lineService['junctionSize']).toEqual(expectedResult);
    });

    it(' onVerifyInput should verify if the input is under the minimum value', () => {
        const expectedResult: number = lineConstants.MIN_INPUT;
        expect(lineService.verifyInput(lineConstants.TEST_MIN_INPUT)).toEqual(expectedResult);
    });

    it(' onVerifyInput should verify if the input is over the maximum value', () => {
        const expectedResult: number = lineConstants.MAX_INPUT;
        expect(lineService.verifyInput(lineConstants.TEST_MAX_INPUT)).toEqual(expectedResult);
    });

    it(' onMouseDown should change isFirstClick to false is mousDown is true', () => {
        const expectedResult = false;
        lineService.onMouseDown(mouseEvent);
        expect(lineService['isFirstClick']).toEqual(expectedResult);
    });

    it(' onMouseDown should not change isFirstClick to false if mouseEvent is not from leftClick Button', () => {
        const expectedResult = true;
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            buttons: 2,
        } as MouseEvent;
        lineService.onMouseDown(mouseEvent);
        expect(lineService['isFirstClick']).toEqual(expectedResult);
    });

    it(' onMouseDown should call drawJunction if isFirstClick is false, pathData contains 2 elements and drawJunction is true', () => {
        lineService['isFirstClick'] = false;
        const position1: Vec2 = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        const position2: Vec2 = { x: lineConstants.TEST_VALUE + 1, y: lineConstants.TEST_VALUE + 1 };
        lineService['isDrawingJunction'] = true;
        lineService.pathData.push(position1);
        lineService.pathData.push(position2);
        lineService['currentPosition'] = position2;
        lineService['drawingService'].canvas.width = lineConstants.TEST_VALUE;
        lineService['drawingService'].canvas.height = lineConstants.TEST_VALUE;
        lineService.savedSegments[0] = drawServiceSpy.baseCtx.getImageData(0, 0, drawServiceSpy.canvas.width, drawServiceSpy.canvas.height);
        lineService.onMouseDown(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it(' onMouseDown should drawJunction and add the first position of the line to both vectors', () => {
        lineService['isFirstClick'] = false;
        lineService['isDrawingJunction'] = true;
        lineService['mouseDown'] = true;
        lineService['isPressingShift'] = true;
        lineService['currentPosition'] = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        lineService.projectedPosition = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        lineService.onMouseDown(mouseEvent);
        expect(lineService.pathData.length).toEqual(lineConstants.CONTAINS_ONE_ELEMENT);
        expect(lineService.positions.length).toEqual(lineConstants.CONTAINS_ONE_ELEMENT);
    });

    it(' onMouseDown should call drawJunction with the projected position', () => {
        lineService['isFirstClick'] = false;
        const position1: Vec2 = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        const position2: Vec2 = { x: lineConstants.TEST_VALUE + 1, y: lineConstants.TEST_VALUE + 1 };
        lineService['isDrawingJunction'] = true;
        lineService['isPressingShift'] = true;
        lineService['junctionSize'] = 2;
        lineService['projectedPosition'] = position1;
        lineService.pathData.push(position1);
        lineService.pathData.push(position2);
        lineService['currentPosition'] = position2;
        lineService['drawingService'].canvas.width = lineConstants.TEST_VALUE;
        lineService['drawingService'].canvas.height = lineConstants.TEST_VALUE;
        lineService.onMouseDown(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it(' onMouseDown should drawJunction if itrs first click and isDrawingJunction', () => {
        lineService['isFirstClick'] = true;
        const position1: Vec2 = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        const position2: Vec2 = { x: lineConstants.TEST_VALUE + 1, y: lineConstants.TEST_VALUE + 1 };
        lineService['isDrawingJunction'] = true;
        lineService['junctionSize'] = 2;
        lineService.pathData.push(position1);
        lineService.pathData.push(position2);
        lineService['currentPosition'] = position2;
        lineService.onMouseDown(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it(' onMouseDown should not drawJunction', () => {
        lineService['isFirstClick'] = false;
        const position1: Vec2 = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        const position2: Vec2 = { x: lineConstants.TEST_VALUE + 1, y: lineConstants.TEST_VALUE + 1 };
        lineService['isDrawingJunction'] = false;
        lineService.pathData.push(position1);
        lineService.pathData.push(position2);
        lineService['drawingService'].canvas.width = lineConstants.TEST_VALUE;
        lineService['drawingService'].canvas.height = lineConstants.TEST_VALUE;
        lineService['currentPosition'] = position2;
        lineService.onMouseDown(mouseEvent);
        expect(lineService.positions.length).toEqual(1);
    });

    it(' onDoubleClick should call clear canvas', () => {
        lineService['mouseDown'] = false;
        lineService.onDoubleClick(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it(' onDoubleClick should draw 2 junctions and clear canvas if isDrawingJunction is true', () => {
        lineService['mouseDown'] = true;
        lineService['isDrawingJunction'] = true;
        const position1: Vec2 = { x: lineConstants.SMALL_DISTANCE, y: lineConstants.SMALL_DISTANCE };
        const position2: Vec2 = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        lineService.pathData.push(position1);
        lineService.positions.push(position1);
        lineService.positions.push(position2);
        lineService['currentPosition'] = position2;
        lineService.onDoubleClick(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it(' onDoubleClick should not eraselastSegment if distance is bigger than 20 pixels', () => {
        lineService['mouseDown'] = true;
        const position1: Vec2 = { x: 0, y: 0 };
        const position2: Vec2 = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        lineService.pathData.push(position1);
        lineService.positions.push(position1);
        lineService['currentPosition'] = position2;
        const expectedResult = false;
        lineService.onDoubleClick(mouseEvent);
        expect(lineService['distanceIsSmall']).toEqual(expectedResult);
    });

    it(' onDoubleClick should drawJunction if isDrawingJunction is true', () => {
        lineService['mouseDown'] = true;
        lineService['isDrawingJunction'] = true;
        const position1: Vec2 = { x: 0, y: 0 };
        const position2: Vec2 = { x: lineConstants.SMALL_DISTANCE, y: lineConstants.SMALL_DISTANCE };
        const position3: Vec2 = { x: lineConstants.BIG_DISTANCE, y: lineConstants.SMALL_DISTANCE };
        lineService.pathData.push(position1);
        lineService.pathData.push(position2);
        lineService.positions.push(position1);
        lineService.positions.push(position2);
        lineService.positions.push(position3);
        lineService['currentPosition'] = position1;
        lineService['lastStrokeStartingPoint'] = position2;
        const expectedResult = true;
        lineService.onDoubleClick(mouseEvent);
        expect(lineService['isDrawingJunction']).toEqual(expectedResult);
    });

    it(' onDoubleClick should not drawJunction if isDrawingJunction is false', () => {
        lineService['mouseDown'] = true;
        lineService['isDrawingJunction'] = false;
        const position1: Vec2 = { x: 0, y: 0 };
        const position2: Vec2 = { x: lineConstants.SMALL_DISTANCE, y: lineConstants.SMALL_DISTANCE };
        lineService.pathData.push(position1);
        lineService.pathData.push(position2);
        lineService.positions.push(position1);
        lineService.positions.push(position2);
        lineService['currentPosition'] = position1;
        lineService['lastStrokeStartingPoint'] = position2;
        const expectedResult = false;
        lineService.onDoubleClick(mouseEvent);
        expect(lineService['isDrawingJunction']).toEqual(expectedResult);
    });

    it(' onDoubleClick should set', () => {
        lineService['mouseDown'] = true;
        lineService['isDrawingJunction'] = true;
        const position1: Vec2 = { x: 0, y: 0 };
        const position2: Vec2 = { x: lineConstants.SMALL_DISTANCE, y: lineConstants.SMALL_DISTANCE };
        const position3: Vec2 = { x: lineConstants.BIG_DISTANCE, y: lineConstants.SMALL_DISTANCE };
        lineService.pathData.push(position1);
        lineService.pathData.push(position2);
        lineService.positions.push(position1);
        lineService.positions.push(position2);
        lineService.positions.push(position3);
        lineService['currentPosition'] = position1;
        lineService['lastStrokeStartingPoint'] = position2;
        const expectedResult = true;
        lineService.onDoubleClick(mouseEvent);
        expect(lineService['isDrawingJunction']).toEqual(expectedResult);
    });

    it(' onKeyDown with the backspace key should remove a position from the positions stack', () => {
        keyboardEvent = {
            key: 'Backspace',
        } as KeyboardEvent;
        // lineService.setCanErase(true);
        const position1: Vec2 = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        const position2: Vec2 = { x: lineConstants.TEST_VALUE + 1, y: lineConstants.TEST_VALUE + 1 };
        lineService['lastStrokeStartingPoint'] = position1;
        lineService['drawingService'].canvas.width = lineConstants.TEST_VALUE;
        lineService['drawingService'].canvas.height = lineConstants.TEST_VALUE;
        lineService.savedSegments[0] = drawServiceSpy.baseCtx.getImageData(0, 0, drawServiceSpy.canvas.width, drawServiceSpy.canvas.height);
        lineService.pathData.push(position1);
        lineService.pathData.push(position2);
        lineService['currentPosition'] = position2;
        lineService.positions.push(position2);
        lineService.positions.push(position1);
        lineService.onKeyDown(keyboardEvent);
        expect(lineService.positions.length).toEqual(1);
    });

    it(' eraseLastSegment should do nothing if savedSegments is empty', () => {
        lineService.positions = [];
        lineService.savedSegments = [];
        expect(lineService.positions.length).toEqual(0);
    });

    it(' onKeyDown should call eraseLine and empty the pathdata', () => {
        keyboardEvent = {
            key: 'Escape',
        } as KeyboardEvent;
        lineService.onKeyDown(keyboardEvent);
        expect(lineService.pathData.length).toEqual(0);
    });

    it(' onKeyDown should change isPressingShift to true if key is Shift and positions.length >= 1', () => {
        keyboardEvent = {
            key: 'Shift',
        } as KeyboardEvent;
        const position: Vec2 = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        lineService.positions.push(position);
        const expectedResult = true;
        lineService.onKeyDown(keyboardEvent);
        expect(lineService['isPressingShift']).toEqual(expectedResult);
    });

    it(' onKeyUp should change isPressingShift to false', () => {
        keyboardEvent = {
            key: 'Shift',
        } as KeyboardEvent;

        lineService.onKeyUp(keyboardEvent);
        expect(lineService['isPressingShift']).toEqual(false);
    });

    it(' onKeyUp should not change isPressingShift to false if key is not Shift', () => {
        keyboardEvent = {
            key: 'A',
        } as KeyboardEvent;
        lineService['isPressingShift'] = true;
        lineService.onKeyUp(keyboardEvent);
        expect(lineService['isPressingShift']).toEqual(true);
    });

    it(' onMouseMove should push the currentPosition in pathdata if pathdata only has one element', () => {
        lineService['mouseDown'] = true;
        const position1: Vec2 = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        const position2: Vec2 = { x: lineConstants.TEST_VALUE + 1, y: lineConstants.TEST_VALUE + 1 };
        lineService['currentPosition'] = position1;
        lineService.pathData.push(position2);
        lineService.onMouseMove(mouseEvent);
        expect(lineService.pathData[lineService.pathData.length - 1]).toEqual(position1);
    });

    it(' onMouseMove should set the correct current position', () => {
        lineService['mouseDown'] = false;
        const position1: Vec2 = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        lineService.onMouseMove(mouseEvent);
        expect(lineService['currentPosition']).toEqual(position1);
    });

    it(' onMouseMove should replace the second position in path data with the currentPosition in pathdata if pathdata only has two element', () => {
        lineService['mouseDown'] = true;
        const position1: Vec2 = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        const position2: Vec2 = { x: lineConstants.TEST_VALUE + 1, y: lineConstants.TEST_VALUE + 1 };
        lineService['currentPosition'] = position1;
        lineService.pathData.push(position1);
        lineService.pathData.push(position2);
        lineService.onMouseMove(mouseEvent);
        expect(lineService.pathData[lineService.pathData.length - 1]).toEqual(position1);
    });

    it(' onMouseMove should call clearcanvas if its not the first click', () => {
        lineService['mouseDown'] = true;
        lineService['isFirstClick'] = false;
        lineService['isPressingShift'] = true;
        const position: Vec2 = { x: lineConstants.TEST_VALUE + 1, y: lineConstants.TEST_VALUE + 1 };
        lineService['currentPosition'] = position;
        const position1: Vec2 = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        const position2: Vec2 = { x: lineConstants.TEST_VALUE + 1, y: lineConstants.TEST_VALUE + 1 };
        lineService.pathData.push(position1);
        lineService.pathData.push(position2);
        lineService.pathData.push(position);
        lineService.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it(' onMouseMove should clear the preview canvas', () => {
        lineService['mouseDown'] = true;
        lineService['isPressingShift'] = false;
        const position1: Vec2 = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        const position2: Vec2 = { x: lineConstants.TEST_VALUE + 1, y: lineConstants.TEST_VALUE + 1 };
        lineService['currentPosition'] = position1;
        lineService.pathData.push(position1);
        lineService.pathData.push(position2);
        lineService.positions.push(position1);
        lineService.positions.push(position2);
        lineService.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it(' onMouseMove should verify the angle and anchor the line if ispressingShift is true', () => {
        lineService['mouseDown'] = true;
        lineService['isPressingShift'] = true;
        const position1: Vec2 = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        const position2: Vec2 = { x: lineConstants.TEST_VALUE + 1, y: lineConstants.TEST_VALUE + 1 };
        lineService['currentPosition'] = position1;
        lineService.pathData.push(position1);
        lineService.pathData.push(position2);
        lineService.positions.push(position1);
        lineService.positions.push(position2);
        lineService.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it(' drawJunction should draw an ellipse at a specific position and fil it', () => {
        const position: Vec2 = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        lineService.drawJunction(drawServiceSpy.baseCtx, position);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it(' eraseLine should set isFirstClick to true', () => {
        lineService['mouseDown'] = false;
        lineService.onDoubleClick(mouseEvent);
        lineService.eraseLine();
        const expectedResult = true;
        expect(lineService['isFirstClick']).toEqual(expectedResult);
    });

    it(' eraseLastSegment should fill the pathdata', () => {
        const position1: Vec2 = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        const position2: Vec2 = { x: lineConstants.TEST_VALUE + 1, y: lineConstants.TEST_VALUE + 1 };
        lineService['lastStrokeStartingPoint'] = position1;
        lineService.pathData.push(position1);
        lineService.pathData.push(position2);
        lineService.positions.push(position1);
        lineService['currentPosition'] = position2;
        lineService.eraseLastSegment();
        expect(lineService.pathData.length).toEqual(2);
    });

    it(' verifyDistance should return false if distance is bigger than  20 pixels on bot axis', () => {
        const position1: Vec2 = { x: 0, y: 0 };
        const position2: Vec2 = { x: lineConstants.BIG_DISTANCE, y: lineConstants.BIG_DISTANCE };
        lineService.positions.push(position1);
        lineService['currentPosition'] = position2;
        const expectedResult = false;
        expect(lineService.verifyDistance()).toEqual(expectedResult);
    });

    it(' verifyDistance should return true if distance is smaller than  20 pixels on bot axis', () => {
        const position1: Vec2 = { x: 0, y: 0 };
        const position2: Vec2 = { x: lineConstants.SMALL_DISTANCE, y: lineConstants.SMALL_DISTANCE };
        lineService.positions.push(position1);
        lineService['currentPosition'] = position2;
        const expectedResult = true;
        expect(lineService.verifyDistance()).toEqual(expectedResult);
    });

    it(' verify angle should return the correct angle', () => {
        const position1: Vec2 = { x: 0, y: 0 };
        const position2: Vec2 = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        lineService.pathData.push(position1);
        lineService['currentPosition'] = position2;
        expect(lineService.verifyAngle()).toEqual(lineConstants.PROJECTION_ANGLE);
    });

    it(' AnchorSegment should set the second position x to be the same as the first one if angle is 0 or 180', () => {
        const angle = 0;
        const position1: Vec2 = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        lineService.projectedPosition = { x: 0, y: 0 };
        lineService['currentPosition'] = { x: lineConstants.TEST_VALUE, y: 0 };
        lineService.positions.push(position1);
        lineService.anchorSegment(angle);
        expect(lineService.pathData[lineConstants.ENDING_POINT].x).toEqual(lineService.pathData[lineConstants.STARTING_POINT].x);
    });

    it(' AnchorSegment should set the second position y to be the same as the first one if angle is 90 270', () => {
        const angle = 90;
        const position1: Vec2 = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        lineService.projectedPosition = { x: 0, y: 0 };
        lineService['currentPosition'] = { x: 0, y: lineConstants.TEST_VALUE };
        lineService.positions.push(position1);
        lineService.anchorSegment(angle);
        expect(lineService.pathData[lineConstants.ENDING_POINT].y).toEqual(lineService.pathData[lineConstants.STARTING_POINT].y);
    });

    it(' AnchorSegment should set the second position to be a projected 45 dergre angle with the x axis if angle is between [22.5, 67.5[ for the lower quadrant', () => {
        const angle = 45;
        const position1: Vec2 = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        lineService.projectedPosition = { x: 0, y: 0 };
        lineService['currentPosition'] = { x: lineConstants.TEST_VALUE * 2, y: lineConstants.TEST_VALUE * 2 };
        lineService.positions.push(position1);
        lineService.anchorSegment(angle);
        expect(lineService.pathData[lineConstants.ENDING_POINT].x).toEqual(lineService.pathData[lineConstants.STARTING_POINT].x * 2);
    });

    it(' AnchorSegment should set the second position to be a projected 45 dergre angle with the x axis if angle is between [22.5, 67.5[ for the higher quadrant', () => {
        const angle = 45;
        const position1: Vec2 = { x: lineConstants.TEST_VALUE, y: lineConstants.TEST_VALUE };
        lineService.projectedPosition = { x: 0, y: 0 };
        lineService['currentPosition'] = { x: lineConstants.TEST_VALUE / 2, y: lineConstants.TEST_VALUE / 2 };
        lineService.positions.push(position1);
        lineService.anchorSegment(angle);
        expect(lineService.pathData[lineConstants.ENDING_POINT].x).toEqual(lineService.pathData[lineConstants.STARTING_POINT].x / 2);
    });
});
