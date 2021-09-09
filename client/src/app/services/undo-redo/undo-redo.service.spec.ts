// tslint:disable: no-string-literal
// Justification : On a besoin de string literals pour tester et acceder a certains attributs privees de notre component/service
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import * as undoRedoConstants from './undo-redo-constants';
import { UndoRedoService } from './undo-redo.service';

describe('UndoRedoService', () => {
    let service: UndoRedoService;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let drawingService: DrawingService;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(UndoRedoService);
        drawingService = TestBed.inject(DrawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        drawingService.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingService.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawingService.canvas = canvasTestHelper.canvas;
        drawingService.previewCanvas = canvasTestHelper.canvas;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' saveCurrentState should empty the undos stack and push the image to the modifications stack', () => {
        service.modifications = [];
        service['drawingService'].canvas.width = undoRedoConstants.TEST_VALUE;
        service['drawingService'].canvas.height = undoRedoConstants.TEST_VALUE;
        service.saveCurrentState(drawServiceSpy.baseCtx.getImageData(0, 0, drawServiceSpy.canvas.width, drawServiceSpy.canvas.height));
        expect(service.undos.length).toEqual(0);
        expect(service.modifications.length).toEqual(1);
    });

    it(' undo should push the modification to the undo stack', () => {
        service.modifications = [];
        service.undos = [];
        service.toolIsUsed = false;
        service['drawingService'].canvas.width = undoRedoConstants.TEST_VALUE;
        service['drawingService'].canvas.height = undoRedoConstants.TEST_VALUE;
        service.modifications.push(drawServiceSpy.baseCtx.getImageData(0, 0, drawServiceSpy.canvas.width, drawServiceSpy.canvas.height));
        service.modifications.push(drawServiceSpy.baseCtx.getImageData(0, 0, drawServiceSpy.canvas.width, drawServiceSpy.canvas.height));
        service.undos.push(drawServiceSpy.baseCtx.getImageData(0, 0, drawServiceSpy.canvas.width, drawServiceSpy.canvas.height));
        service.undos.push(drawServiceSpy.baseCtx.getImageData(0, 0, drawServiceSpy.canvas.width, drawServiceSpy.canvas.height));
        const expectedResult = 3;
        service.undo();
        expect(service.undos.length).toEqual(expectedResult);
    });

    it(' undo should do nothing if theres less or one modifications', () => {
        service.modifications = [];
        service.undo();
        const expectedResult = 0;
        expect(service.undos.length).toEqual(expectedResult);
    });

    it(' redo should push the undo to the modifications stack', () => {
        service.modifications = [];
        service.undos = [];
        service.toolIsUsed = false;
        service['drawingService'].canvas.width = undoRedoConstants.TEST_VALUE;
        service['drawingService'].canvas.height = undoRedoConstants.TEST_VALUE;
        service.modifications.push(drawServiceSpy.baseCtx.getImageData(0, 0, drawServiceSpy.canvas.width, drawServiceSpy.canvas.height));
        service.modifications.push(drawServiceSpy.baseCtx.getImageData(0, 0, drawServiceSpy.canvas.width, drawServiceSpy.canvas.height));
        service.undos.push(drawServiceSpy.baseCtx.getImageData(0, 0, drawServiceSpy.canvas.width, drawServiceSpy.canvas.height));
        service.undos.push(drawServiceSpy.baseCtx.getImageData(0, 0, drawServiceSpy.canvas.width, drawServiceSpy.canvas.height));
        const expectedResult = 3;
        service.redo();
        expect(service.modifications.length).toEqual(expectedResult);
    });

    it(' redo should do nothing if theres less than one undos', () => {
        service.undos = [];
        service.redo();
        const expectedResult = 0;
        expect(service.undos.length).toEqual(expectedResult);
    });

    it(' getUndoButtonAvailability should return true if modifications has a lenght of one', () => {
        service.modifications = [];
        service['drawingService'].canvas.width = undoRedoConstants.TEST_VALUE;
        service['drawingService'].canvas.height = undoRedoConstants.TEST_VALUE;
        service.modifications.push(drawServiceSpy.baseCtx.getImageData(0, 0, drawServiceSpy.canvas.width, drawServiceSpy.canvas.height));
        const expectedResult = true;
        expect(service.getUndoButtonAvailability()).toEqual(expectedResult);
    });

    it(' getUndoButtonAvailability should return true if tool is used', () => {
        service.modifications = [];
        service['toolIsUsed'] = true;
        service['drawingService'].canvas.width = undoRedoConstants.TEST_VALUE;
        service['drawingService'].canvas.height = undoRedoConstants.TEST_VALUE;
        service.modifications.push(drawServiceSpy.baseCtx.getImageData(0, 0, drawServiceSpy.canvas.width, drawServiceSpy.canvas.height));
        service.modifications.push(drawServiceSpy.baseCtx.getImageData(0, 0, drawServiceSpy.canvas.width, drawServiceSpy.canvas.height));
        const expectedResult = true;
        expect(service.getUndoButtonAvailability()).toEqual(expectedResult);
    });

    it(' getUndoButtonAvailability should return false', () => {
        service.modifications = [];
        service['toolIsUsed'] = false;
        service['drawingService'].canvas.width = undoRedoConstants.TEST_VALUE;
        service['drawingService'].canvas.height = undoRedoConstants.TEST_VALUE;
        service.modifications.push(drawServiceSpy.baseCtx.getImageData(0, 0, drawServiceSpy.canvas.width, drawServiceSpy.canvas.height));
        service.modifications.push(drawServiceSpy.baseCtx.getImageData(0, 0, drawServiceSpy.canvas.width, drawServiceSpy.canvas.height));
        const expectedResult = false;
        expect(service.getUndoButtonAvailability()).toEqual(expectedResult);
    });

    it(' getRedoButtonAvailability should return true if undo has a lenght of zero', () => {
        service.undos = [];
        const expectedResult = true;
        expect(service.getRedoButtonAvailability()).toEqual(expectedResult);
    });

    it(' getRedoButtonAvailability should return true if tool is used', () => {
        service.undos = [];
        service['toolIsUsed'] = true;
        service['drawingService'].canvas.width = undoRedoConstants.TEST_VALUE;
        service['drawingService'].canvas.height = undoRedoConstants.TEST_VALUE;
        service.undos.push(drawServiceSpy.baseCtx.getImageData(0, 0, drawServiceSpy.canvas.width, drawServiceSpy.canvas.height));
        const expectedResult = true;
        expect(service.getRedoButtonAvailability()).toEqual(expectedResult);
    });

    it(' getRedoButtonAvailability should return false', () => {
        service.modifications = [];
        service['toolIsUsed'] = false;
        service['drawingService'].canvas.width = undoRedoConstants.TEST_VALUE;
        service['drawingService'].canvas.height = undoRedoConstants.TEST_VALUE;
        service.undos.push(drawServiceSpy.baseCtx.getImageData(0, 0, drawServiceSpy.canvas.width, drawServiceSpy.canvas.height));
        const expectedResult = false;
        expect(service.getRedoButtonAvailability()).toEqual(expectedResult);
    });
});
