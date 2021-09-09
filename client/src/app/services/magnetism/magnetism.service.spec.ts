// tslint:disable: no-string-literal
// Justification : On a besoin de string literals pour tester et acceder a certains attributs privees de notre component/service
import { TestBed } from '@angular/core/testing';
import { ResizeAttributes } from '@app/classes/resize-attributes';
import { Vec2 } from '@app/classes/vec2';
import * as magnetismConstants from './magnetism-constants';
import { MagnetismService } from './magnetism.service';

describe('MagnetismService', () => {
    let service: MagnetismService;
    let resizeAtributeStub1: ResizeAttributes;
    let resizeAtributeStub2: ResizeAttributes;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MagnetismService);
        resizeAtributeStub1 = {
            x: 10,
            y: 10,
            startingX: 10,
            startingY: 10,
            width: 100,
            height: 100,
            startingWidth: 100,
            startingHeight: 100,
            selectionType: 100,
            flippedX: false,
            flippedY: false,
        } as ResizeAttributes;
        resizeAtributeStub2 = {
            x: 100,
            y: 100,
            startingX: 10,
            startingY: 10,
            width: 100,
            height: 100,
            startingWidth: 100,
            startingHeight: 100,
            selectionType: 100,
            flippedX: false,
            flippedY: false,
        } as ResizeAttributes;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('moveBox should move the box to the right if the direction in in the positive X with RE1', () => {
        const direction = 0;
        service['gridService'].squareSideLenght = magnetismConstants.TEST_VALUE;
        const expectedResult = magnetismConstants.TEST_VALUE;
        resizeAtributeStub1 = service.moveBox(resizeAtributeStub1, direction);
        expect(resizeAtributeStub1.x).toEqual(expectedResult);
    });

    it('moveBox should move the box to the left if the direction in in the negative X with RE1', () => {
        const direction = 1;
        service['gridService'].squareSideLenght = magnetismConstants.TEST_VALUE;
        const expectedResult = 0;
        resizeAtributeStub1 = service.moveBox(resizeAtributeStub1, direction);
        expect(resizeAtributeStub1.x).toEqual(expectedResult);
    });

    it('moveBox should move the box to the bottom if the direction in in the positive Y with RE1', () => {
        const direction = 2;
        service['gridService'].squareSideLenght = magnetismConstants.TEST_VALUE;
        const expectedResult = magnetismConstants.TEST_VALUE2;
        resizeAtributeStub1 = service.moveBox(resizeAtributeStub1, direction);
        expect(resizeAtributeStub1.x).toEqual(expectedResult);
    });

    it('moveBox should move the box to the top if the direction in in the negative Y with RE1', () => {
        const direction = 3;
        service['gridService'].squareSideLenght = magnetismConstants.TEST_VALUE;
        const expectedResult = magnetismConstants.TEST_VALUE2;
        resizeAtributeStub1 = service.moveBox(resizeAtributeStub1, direction);
        expect(resizeAtributeStub1.x).toEqual(expectedResult);
    });

    it('moveBox should move the box to the right if the direction in in the positive X with RE2', () => {
        const direction = 0;
        service['gridService'].squareSideLenght = magnetismConstants.TEST_VALUE;
        const expectedResult = 2 * magnetismConstants.TEST_VALUE;
        resizeAtributeStub2 = service.moveBox(resizeAtributeStub2, direction);
        expect(resizeAtributeStub2.x).toEqual(expectedResult);
    });

    it('moveBox should move the box to the left if the direction in in the negative X with RE2', () => {
        const direction = 1;
        service['gridService'].squareSideLenght = magnetismConstants.TEST_VALUE;
        const expectedResult = 0;
        resizeAtributeStub2 = service.moveBox(resizeAtributeStub2, direction);
        expect(resizeAtributeStub2.x).toEqual(expectedResult);
    });

    it('moveBox should move the box to the bottom if the direction in in the positive Y with RE2', () => {
        const direction = 2;
        service['gridService'].squareSideLenght = magnetismConstants.TEST_VALUE;
        const expectedResult = magnetismConstants.TEST_VALUE;
        resizeAtributeStub2 = service.moveBox(resizeAtributeStub2, direction);
        expect(resizeAtributeStub2.x).toEqual(expectedResult);
    });

    it('moveBox should move the box to the top if the direction in in the negative Y with RE2', () => {
        const direction = 3;
        service['gridService'].squareSideLenght = magnetismConstants.TEST_VALUE;
        const expectedResult = magnetismConstants.TEST_VALUE;
        resizeAtributeStub2 = service.moveBox(resizeAtributeStub2, direction);
        expect(resizeAtributeStub2.x).toEqual(expectedResult);
    });

    it('identifyAllPosition should identify all the corner positions correctly', () => {
        const startingPosition: Vec2 = { x: magnetismConstants.TEST_VALUE, y: magnetismConstants.TEST_VALUE };
        service.positions[0] = startingPosition;
        service['gridService'].squareSideLenght = magnetismConstants.TEST_VALUE;
        service.identifyAllPositions(resizeAtributeStub1);
        expect(service.positions[magnetismConstants.TOP_MIDDLE].x).toEqual(startingPosition.x + resizeAtributeStub1.width / 2);
        expect(service.positions[magnetismConstants.TOP_MIDDLE].y).toEqual(startingPosition.y);
        expect(service.positions[magnetismConstants.TOP_RIGHT].x).toEqual(startingPosition.x + resizeAtributeStub1.width);
        expect(service.positions[magnetismConstants.TOP_RIGHT].y).toEqual(startingPosition.y);
        expect(service.positions[magnetismConstants.MIDDLE_LEFT].x).toEqual(startingPosition.x);
        expect(service.positions[magnetismConstants.MIDDLE_LEFT].y).toEqual(startingPosition.y + resizeAtributeStub1.height / 2);
        expect(service.positions[magnetismConstants.MIDDLE_RIGHT].x).toEqual(startingPosition.x + resizeAtributeStub1.width);
        expect(service.positions[magnetismConstants.MIDDLE_RIGHT].y).toEqual(startingPosition.y + resizeAtributeStub1.height / 2);
        expect(service.positions[magnetismConstants.BOTTOM_LEFT].x).toEqual(startingPosition.x);
        expect(service.positions[magnetismConstants.BOTTOM_LEFT].y).toEqual(startingPosition.y + resizeAtributeStub1.height);
        expect(service.positions[magnetismConstants.BOTTOM_MIDDLE].x).toEqual(startingPosition.x + resizeAtributeStub1.width / 2);
        expect(service.positions[magnetismConstants.BOTTOM_MIDDLE].y).toEqual(startingPosition.y + resizeAtributeStub1.height);
        expect(service.positions[magnetismConstants.BOTTOM_RIGHT].x).toEqual(startingPosition.x + resizeAtributeStub1.width);
        expect(service.positions[magnetismConstants.BOTTOM_RIGHT].y).toEqual(startingPosition.y + resizeAtributeStub1.height);
        expect(service.positions[magnetismConstants.MIDDLE].x).toEqual(startingPosition.x + resizeAtributeStub1.width / 2);
        expect(service.positions[magnetismConstants.MIDDLE].y).toEqual(startingPosition.y + resizeAtributeStub1.height / 2);
    });

    it('identifyResizeCorner should correctly identify the topLeft corner', () => {
        service.identifyResizeCorner(resizeAtributeStub1);
        expect(service.lastResizeCorner).toEqual(magnetismConstants.TOP_LEFT);
    });

    it('identifyResizeCorner should correctly identify the topRight corner', () => {
        resizeAtributeStub1.width *= magnetismConstants.STARTING_CORNER;
        service.identifyResizeCorner(resizeAtributeStub1);
        expect(service.lastResizeCorner).toEqual(magnetismConstants.TOP_RIGHT);
    });

    it('identifyResizeCorner should correctly identify the bottomleft corner', () => {
        resizeAtributeStub1.height *= magnetismConstants.STARTING_CORNER;
        service.identifyResizeCorner(resizeAtributeStub1);
        expect(service.lastResizeCorner).toEqual(magnetismConstants.BOTTOM_LEFT);
    });

    it('identifyResizeCorner should correctly identify the bottomRight corner', () => {
        resizeAtributeStub1.width *= magnetismConstants.STARTING_CORNER;
        resizeAtributeStub1.height *= magnetismConstants.STARTING_CORNER;
        service.identifyResizeCorner(resizeAtributeStub1);
        expect(service.lastResizeCorner).toEqual(magnetismConstants.BOTTOM_RIGHT);
    });

    it('identifyTopLeftPosition should correctly identify the top left corner', () => {
        service.lastResizeCorner = magnetismConstants.TOP_LEFT;
        service.identifyTopLeftPosition(resizeAtributeStub2);
        expect(service.positions[0]).toEqual({ x: resizeAtributeStub2.x, y: resizeAtributeStub2.y });

        service.lastResizeCorner = magnetismConstants.TOP_MIDDLE;
        service.identifyTopLeftPosition(resizeAtributeStub2);
        expect(service.positions[0]).toEqual({ x: resizeAtributeStub2.x - resizeAtributeStub2.width / 2, y: resizeAtributeStub2.y });

        service.lastResizeCorner = magnetismConstants.TOP_RIGHT;
        service.identifyTopLeftPosition(resizeAtributeStub2);
        expect(service.positions[0]).toEqual({ x: resizeAtributeStub2.x - resizeAtributeStub2.width, y: resizeAtributeStub2.y });

        service.lastResizeCorner = magnetismConstants.MIDDLE_LEFT;
        service.identifyTopLeftPosition(resizeAtributeStub2);
        expect(service.positions[0]).toEqual({ x: resizeAtributeStub2.x, y: resizeAtributeStub2.y - resizeAtributeStub2.height / 2 });

        service.lastResizeCorner = magnetismConstants.MIDDLE_RIGHT;
        service.identifyTopLeftPosition(resizeAtributeStub2);
        expect(service.positions[0]).toEqual({
            x: resizeAtributeStub2.x - resizeAtributeStub2.width,
            y: resizeAtributeStub2.y - resizeAtributeStub2.height / 2,
        });

        service.lastResizeCorner = magnetismConstants.BOTTOM_LEFT;
        service.identifyTopLeftPosition(resizeAtributeStub2);
        expect(service.positions[0]).toEqual({ x: resizeAtributeStub2.x, y: resizeAtributeStub2.y - resizeAtributeStub2.height });

        service.lastResizeCorner = magnetismConstants.BOTTOM_MIDDLE;
        service.identifyTopLeftPosition(resizeAtributeStub2);
        expect(service.positions[0]).toEqual({
            x: resizeAtributeStub2.x - resizeAtributeStub2.width / 2,
            y: resizeAtributeStub2.y - resizeAtributeStub2.height,
        });

        service.lastResizeCorner = magnetismConstants.BOTTOM_RIGHT;
        service.identifyTopLeftPosition(resizeAtributeStub2);
        expect(service.positions[0]).toEqual({
            x: resizeAtributeStub2.x - resizeAtributeStub2.width,
            y: resizeAtributeStub2.y - resizeAtributeStub2.height,
        });
    });

    it('calculate new position should return the correct offsets if gridsquarelenght is not pair', () => {
        service['gridService'].squareSideLenght = magnetismConstants.TEST_VALUE3;
        service.tempXOffset = magnetismConstants.TEST_VALUE / 2;
        service.tempYOffset = magnetismConstants.TEST_VALUE / 2;
        service.anchor = 0;
        service.positions[service.anchor] = { x: 0, y: 0 };
        expect(service.calculateNewPosition()).toEqual({ x: magnetismConstants.TEST_VALUE4, y: magnetismConstants.TEST_VALUE4 });
    });

    it('calculate new position should return the correct offsets if gridsquarelenght is pair', () => {
        service['gridService'].squareSideLenght = magnetismConstants.TEST_VALUE;
        service.tempXOffset = 0;
        service.tempYOffset = 0;
        service.anchor = 0;
        service.positions[service.anchor] = { x: 0, y: 0 };
        expect(service.calculateNewPosition()).toEqual({ x: 0, y: 0 });
    });

    it('calculate new position should return the correct offsets if gridlenght is pair', () => {
        service['gridService'].squareSideLenght = magnetismConstants.TEST_VALUE;
        service.tempXOffset = 0;
        service.tempYOffset = 0;
        service.anchor = 0;
        service.positions[service.anchor] = { x: 50, y: 50 };
        expect(service.calculateNewPosition()).toEqual({ x: 50, y: 50 });
    });

    it('calculate new position should return the correct offsets if gridlenght is not pair', () => {
        service['gridService'].squareSideLenght = magnetismConstants.TEST_VALUE3;
        service.tempXOffset = 0;
        service.tempYOffset = 0;
        service.anchor = 0;
        service.positions[service.anchor] = { x: 49, y: 49 };
        expect(service.calculateNewPosition()).toEqual({ x: -49, y: -49 });
    });

    it('calculate new position should return the correct offsets if gridlenght is pair', () => {
        service['gridService'].squareSideLenght = magnetismConstants.TEST_VALUE;
        service.tempXOffset = 0;
        service.tempYOffset = 0;
        service.lastTempXOffset = magnetismConstants.STARTING_CORNER;
        service.lastTempYOffset = magnetismConstants.STARTING_CORNER;
        service.anchor = 0;
        service.positions[service.anchor] = { x: 50, y: 50 };
        expect(service.calculateNewPosition()).toEqual({ x: -50, y: -50 });
    });

    it('calculate new position should return the correct offsets if gridlenght is not pair', () => {
        service['gridService'].squareSideLenght = magnetismConstants.TEST_VALUE3;
        service.tempXOffset = 0;
        service.tempYOffset = 0;
        service.anchor = 0;
        service.positions[service.anchor] = { x: 51, y: 51 };
        expect(service.calculateNewPosition()).toEqual({ x: 48, y: 48 });
    });
});
