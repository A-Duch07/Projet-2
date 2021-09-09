import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '../drawing/drawing.service';
import { TexteService } from './texte.service';
import * as texteConstants from './tools-constants/texte-service-constants';

describe('TexteService', () => {
    let service: TexteService;
    let texteAreaStub: HTMLTextAreaElement;
    let drawService: DrawingService;
    let canvasTestHelper: CanvasTestHelper;
    let mouseEvent: MouseEvent;

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    beforeEach(() => {
        texteAreaStub = {
            style: {
                fontFamily: 'Arial',
            } as CSSStyleDeclaration,
        } as HTMLTextAreaElement;
        TestBed.configureTestingModule({});
        service = TestBed.inject(TexteService);
        drawService = TestBed.inject(DrawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        drawService.canvas = canvasTestHelper.canvas;
        drawService.previewCanvas = canvasTestHelper.canvas;
        drawService.baseCtx = drawService.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawService.previewCtx = drawService.previewCanvas.getContext('2d') as CanvasRenderingContext2D;
        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            buttons: 1,
        } as MouseEvent;
    });

    it('onAlignerChange should correctly change the align', () => {
        const testValue = 'center';
        service.onAlignerChange(testValue);
        expect(service.align).toEqual(testValue);
    });

    it('onBoldChange should correctly change bold', () => {
        const testValue = true;
        service.onBoldChange(testValue);
        expect(service.bold).toEqual(testValue);
    });

    it('onItaliqueChange should correctly change italique', () => {
        const testValue = true;
        service.onItaliqueChange(testValue);
        expect(service.italique).toEqual(testValue);
    });

    it('onPoliceChange should correctly change the police', () => {
        const testValue = 'Arial';
        service.onPoliceChange(testValue);
        expect(service.police).toEqual(testValue);
    });

    it('onPoliceHeightChange should correctly change the policeHeight', () => {
        const testValue = texteConstants.POLICEHEIGHT_ONSELECT;
        service.onPoliceHeightChange(testValue);
        expect(service.policeHeight).toEqual(testValue);
    });

    it('printText should put the text in bold and italic when bold and italic are true', () => {
        service.bold = true;
        service.italique = true;
        service.policeHeight = 20;
        service.police = 'Arial';
        const exportCanvas = document.createElement('canvas');
        const ctx = exportCanvas.getContext('2d') as CanvasRenderingContext2D;
        service.printText(mouseEvent, ctx);
        expect(ctx.font).toEqual('italic bold ' + 20 + 'px Arial');
    });

    it('printText should put the text in bold when bold is true and italic is false', () => {
        service.bold = true;
        service.italique = false;
        service.policeHeight = 20;
        service.police = 'Arial';
        const exportCanvas = document.createElement('canvas');
        const ctx = exportCanvas.getContext('2d') as CanvasRenderingContext2D;
        service.printText(mouseEvent, ctx);
        expect(ctx.font).toEqual('bold ' + 20 + 'px Arial');
    });

    it('printText should put the text in italique and italic when bold is false and italic is true', () => {
        service.bold = false;
        service.italique = true;
        service.policeHeight = 20;
        service.police = 'Arial';
        const exportCanvas = document.createElement('canvas');
        const ctx = exportCanvas.getContext('2d') as CanvasRenderingContext2D;
        service.printText(mouseEvent, ctx);
        expect(ctx.font).toEqual('italic ' + 20 + 'px Arial');
    });

    it('printText should not put the text in bold and italic when bold and italic are false', () => {
        service.bold = false;
        service.italique = false;
        service.policeHeight = 20;
        service.police = 'Arial';
        const exportCanvas = document.createElement('canvas');
        const ctx = exportCanvas.getContext('2d') as CanvasRenderingContext2D;
        service.printText(mouseEvent, ctx);
        expect(ctx.font).toEqual(20 + 'px Arial');
    });

    it(' onClick should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onClick(mouseEvent);
        expect(service.currentMousePosition).toEqual(expectedResult);
    });

    it('should be created', () => {
        texteAreaStub = {
            style: {
                position: 'initialPosition',
                whiteSpace: 'pre',
                width: '10px',
                lineHeight: '1',
                left: '10px',
                top: '10px',
                color: 'color',
            } as CSSStyleDeclaration,
        } as HTMLTextAreaElement;
        service.textArea = texteAreaStub;
        expect(service).toBeTruthy();
    });
});
