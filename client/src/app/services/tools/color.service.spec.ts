import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import * as colorConstants from '@app/services/tools/tools-constants/color-service-constants';
import { ColorService } from './color.service';

// tslint:disable: no-magic-numbers
describe('ColorService', () => {
    let service: ColorService;
    let mouseLeftEvent: MouseEvent;
    let mouseRightEvent: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(ColorService);

        // Configuration du spy du service
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;

        mouseLeftEvent = {
            buttons: 1,
        } as MouseEvent;

        mouseRightEvent = {
            buttons: 2,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('selecColor should change currentColor to its parameter passed color if it is equal to 0 or 1', () => {
        service.selectColor(1);
        expect(service.currentColor).toEqual(1);
    });

    it('selecColor should not change currentColor to its parameter passed color if it is not equal to 0 or 1', () => {
        service.selectColor(2);
        expect(service.currentColor).toEqual(0);
    });

    it('onColorChange should push a color to the previous colors stack ', () => {
        service.onColorChange('rgba(255,255,00,1)');
        expect(service.previousColors.length).toEqual(10);
    });

    it('onColorChange should change the current color to color parameter ', () => {
        service.currentColor = 1;
        service.onColorChange('rgba(255,255,00,1)');
        expect(service.mainColors[1]).toEqual('rgba(255,255,00,1)');
    });

    it('onColorChange should set previousColors last element to the color parameter', () => {
        service.onColorChange('rgba(255,255,00,1)');
        // tslint:disable-next-line: no-magic-numbers
        expect(service.previousColors[9]).toEqual('rgba(255,255,00,1)');
    });

    it('switchColors should switch the main and secondary color', () => {
        const mainColor = 'rgba(255,255,00,1)';
        const secondaryColor = 'rgba(255,00,00,1)';
        service.mainColors[0] = mainColor;
        service.mainColors[1] = secondaryColor;
        service.switchColors();
        expect(service.mainColors[0]).toEqual(secondaryColor);
        expect(service.mainColors[1]).toEqual(mainColor);
    });

    it('switchColors should switch the colors ', () => {
        service.mainColors[colorConstants.MAIN_COLOR_POS] = colorConstants.RGBA_BLACK;
        service.mainColors[colorConstants.SECONDARY_COLOR_POS] = colorConstants.RGBA_WHITE;
        service.switchColors();
        expect(service.mainColors[colorConstants.MAIN_COLOR_POS]).toEqual(colorConstants.RGBA_WHITE);
    });

    it('previousColorSelection should set the mainColor to the color parameter when it is a leftMouseButton', () => {
        service.previousColorSelection(mouseLeftEvent, 'rgba(255,0,0,1)');
        expect(service.mainColors[0]).toEqual('rgba(255,0,0,1)');
    });

    it('previousColorSelection should set the secondaryColor to the color parameter when it is a rightMouseButton', () => {
        service.previousColorSelection(mouseRightEvent, 'rgba(255,0,0,1)');
        expect(service.mainColors[1]).toEqual('rgba(255,0,0,1)');
    });

    it('previousColorSelection should not set the secondaryColor or the mainColor to the color parameter when it is a not a right/left click', () => {
        service.previousColorSelection(
            {
                buttons: 4,
            } as MouseEvent,
            'rgba(255,0,0,1)',
        );
        expect(service.mainColors[0]).not.toEqual('rgba(255,0,0,1)');
        expect(service.mainColors[1]).not.toEqual('rgba(255,0,0,1)');
    });
});
