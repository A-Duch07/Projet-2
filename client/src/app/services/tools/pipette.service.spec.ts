import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PipetteService } from './pipette.service';

// tslint:disable: no-magic-numbers no-string-literal

describe('PipetteService', () => {
    let service: PipetteService;
    let canvasTestHelper: CanvasTestHelper;
    let drawingService: DrawingService;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let mouseEvent1: MouseEvent;
    let mouseEvent2: MouseEvent;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PipetteService);
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

    it('AssigneColor should assign the color to the right main color', () => {
        service['r'] = 0;
        service['g'] = 0;
        service['b'] = 0;
        service['a'] = 0;

        service['assignColor'](mouseEvent2);
        expect(service['mouseDownRight']).toEqual(true);
    });

    it('AssigneColor should assign the color to the right main color', () => {
        service['r'] = 0;
        service['g'] = 0;
        service['b'] = 0;
        service['a'] = 0;

        service['assignColor'](mouseEvent1);
        expect(service['mouseDownLeft']).toEqual(true);
    });

    it('AssigneColor should assign the color to the right main color', () => {
        service['r'] = 0;
        service['g'] = 0;
        service['b'] = 0;
        service['a'] = 0;

        service['assignColor'](mouseEvent2);
        expect(service['mouseDownRight']).toEqual(true);
    });

    it(' mouseDown should set currentMousePosition to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent1);
        expect(service['currentMousePosition']).toEqual(expectedResult);
    });
});
