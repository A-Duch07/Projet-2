// tslint:disable: no-string-literal
// Justification : On a besoin de string literals pour tester et acceder a certains attributs privees de notre component/service
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { StampInformation } from '@app/classes/stamp-information';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { EtampeService } from './etampe.service';

describe('EtampeService', () => {
    let service: EtampeService;
    let canvasTestHelper: CanvasTestHelper;
    let drawingService: DrawingService;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let keyboardEvent: KeyboardEvent;
    let mouseEvent1: MouseEvent;
    let wheelEvent1: WheelEvent;
    let wheelEvent2: WheelEvent;
    let selectedTampStub: StampInformation;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(EtampeService);
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
        wheelEvent1 = { deltaY: 100 } as WheelEvent;
        wheelEvent2 = { deltaY: -100 } as WheelEvent;
        selectedTampStub = { id: 1, name: 'Heart', src: '../../../assets/stamp-images/heart.PNG' } as StampInformation;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onAngleChange should correctly change the angle', () => {
        service.angle = 0;
        const testValue = 20;
        service.onAngleChange(testValue);
        expect(service.angle).toEqual(testValue);
    });

    it('onMiseAEchelleChange should correctly change the emission miseAEchelle', () => {
        service.miseAEchelle = 0;
        const testValue = 2;
        service.onMiseAEchelleChange(testValue);
        expect(service.miseAEchelle).toEqual(testValue);
    });

    it('onStampChange should correctly change the stamp', () => {
        service.onStampChange(selectedTampStub);
        expect(service.fileName).toEqual(selectedTampStub.src);
    });

    it(' mouseDown should put currentMousePosition to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent1);
        expect(service['currentMousePosition']).toEqual(expectedResult);
    });

    it('onKeyDown should set altEvent to true if key is Alt', () => {
        keyboardEvent = {
            key: 'Alt',
        } as KeyboardEvent;
        service.onKeyDown(keyboardEvent);
        const expectedResult = true;
        expect(service.altEvent).toEqual(expectedResult);
    });

    it('onKeyUp should not set altEvent to false if key is not Alt', () => {
        keyboardEvent = {
            key: 'Alt',
        } as KeyboardEvent;
        service.onKeyUp(keyboardEvent);
        const expectedResult = false;
        expect(service.altEvent).toEqual(expectedResult);
    });

    it('onWheel should decrement angle by 1 if altEvent is true and deltaY is bigger then 0', () => {
        service.altEvent = true;
        service.angle = 0;
        const expectedResult = -1;
        service.onWheel(wheelEvent1);
        expect(service.angle).toEqual(expectedResult);
    });

    it('onWheel should add 1 to the angle if altEvent is true and deltaY is smaller then 0', () => {
        service.altEvent = true;
        service.angle = 0;
        const expectedResult = 1;
        service.onWheel(wheelEvent2);
        expect(service.angle).toEqual(expectedResult);
    });

    it('onWheel should decrement angle by 15 if altEvent is false and deltaY is bigger then 0', () => {
        service.altEvent = false;
        service.angle = 0;
        const expectedResult = -15;
        service.onWheel(wheelEvent1);
        expect(service.angle).toEqual(expectedResult);
    });

    it('onWheel should add 15 to the angle if altEvent is false and deltaY is smaller then 0', () => {
        service.altEvent = false;
        service.angle = 0;
        const expectedResult = 15;
        service.onWheel(wheelEvent2);
        expect(service.angle).toEqual(expectedResult);
    });
});
