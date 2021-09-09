// tslint:disable: no-string-literal
// Justification : On a besoin de string literals pour tester et acceder a certains attributs privees de notre component/service
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import * as gridConstants from './grid-constants';
import { GridService } from './grid.service';

describe('GridService', () => {
    let service: GridService;
    let canvasTestHelper: CanvasTestHelper;
    let drawingService: DrawingService;
    let gridCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GridService);
        drawingService = TestBed.inject(DrawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        drawingService.canvas = canvasTestHelper.canvas;
        drawingService.gridCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        gridCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service['drawingService'].gridCtx = gridCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('verifyInput() should return the minInput if input is lower than 15', () => {
        const input = gridConstants.TEST_LOWER_INPUT;
        expect(service.verifyInput(input)).toEqual(gridConstants.MIN_INPUT);
    });

    it('verifyInput() should return the maxInput if input is higher than 100', () => {
        const input = gridConstants.TEST_HIGHER_INPUT;
        expect(service.verifyInput(input)).toEqual(gridConstants.MAX_INPUT);
    });

    it('verifyInput() should return the input if input is withi the two boundries', () => {
        const input = gridConstants.TEST_NORMAL_INPUT;
        expect(service.verifyInput(input)).toEqual(gridConstants.TEST_NORMAL_INPUT);
    });

    it('verifySize() should set the size of the square lenght to the closest multiple of five', () => {
        service['squareSideLenght'] = gridConstants.TEST_SMALL_SIZE;
        service['verifySize']();
        expect(service['squareSideLenght']).toEqual(gridConstants.SIZE_CHANGE);
    });

    it('verifySize() should set the size of the square lenght to the closest multiple of five', () => {
        service['squareSideLenght'] = gridConstants.TEST_BIG_SIZE;
        service['verifySize']();
        expect(service['squareSideLenght']).toEqual(gridConstants.SIZE_CHANGE * 2);
    });

    it('drawline should draw the lines and set the linedash back to zero', () => {
        gridCtxStub.setLineDash([1, 1]);
        service.drawLine(gridCtxStub);
        expect(gridCtxStub.lineDashOffset).toEqual(0);
    });

    it('onOpacityChange should set the opacity to the minimum if the value is under 0.5', () => {
        service.onOpacityChange(gridConstants.TEST_OPACITY_UNDER);
        expect(service.opacity).toEqual(gridConstants.MIN_OPACITY);
    });

    it('onOpacityChange should set the opacity to the minimum if the value is within 0.5 and 1', () => {
        service.onOpacityChange(gridConstants.TEST_OPACITY_WITHIN);
        expect(service.opacity).toEqual(gridConstants.TEST_OPACITY_WITHIN);
    });

    it('onOpacityChange should set the opacity to the minimum if the value is within 0.5 and 1', () => {
        service.onOpacityChange(gridConstants.TEST_OPACITY_ABOVE);
        expect(service.opacity).toEqual(gridConstants.MAX_OPACITY);
    });

    it('onSizeChange should set the appropriate size', () => {
        service.onSizeChange(gridConstants.MIN_INPUT);
        expect(service.squareSideLenght).toEqual(gridConstants.MIN_INPUT);
    });

    it('increaseSize should set the appropriate size if the input is above the max input', () => {
        service.squareSideLenght = gridConstants.BIG_SIZE_TEST;
        service.increaseSize();
        expect(service.squareSideLenght).toEqual(gridConstants.MAX_INPUT);
    });

    it('increaseSize should set the appropriate size if the input is above the max input', () => {
        service.squareSideLenght = gridConstants.NORMAL_SIZE_TEST1;
        service.increaseSize();
        expect(service.squareSideLenght).toEqual(gridConstants.MAX_INPUT);
    });

    it('reduceSize should set the appropriate size if the input is bellow the min input', () => {
        service.squareSideLenght = gridConstants.SMALL_SIZE_TEST;
        service.reduceSize();
        expect(service.squareSideLenght).toEqual(gridConstants.MIN_INPUT);
    });

    it('reduceSize should set the appropriate size if the input is above the max input', () => {
        service.squareSideLenght = gridConstants.NORMAL_SIZE_TEST2;
        service.reduceSize();
        expect(service.squareSideLenght).toEqual(gridConstants.MIN_INPUT);
    });
});
