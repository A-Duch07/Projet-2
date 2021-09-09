import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ExportComponent } from './export.component';

describe('ExportComponent', () => {
    let service: DrawingService;
    let component: ExportComponent;
    let fixture: ComponentFixture<ExportComponent>;
    let canvasTestHelper: CanvasTestHelper;
    let httpTestingController: HttpTestingController;
    let backend: HttpTestingController;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ExportComponent],
            imports: [HttpClientTestingModule],
            providers: [ExportComponent],
        }).compileComponents();
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        backend = TestBed.inject(HttpTestingController);
        httpTestingController = TestBed.inject(HttpTestingController);
        service.canvas = canvasTestHelper.canvas;
        service.previewCanvas = canvasTestHelper.canvas;
        service.baseCtx = service.canvas.getContext('2d') as CanvasRenderingContext2D;
        service.previewCtx = service.previewCanvas.getContext('2d') as CanvasRenderingContext2D;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should apply the blur filter', () => {
        component.fileFormat = 'png';
        component.selectedFilter = 'blur';
        component.applyFilter();
        expect(component.ctx.filter).toEqual('blur(4px)');
    });

    it('should apply the brightness filter', () => {
        component.fileFormat = 'png';
        component.selectedFilter = 'brightness';
        component.applyFilter();
        expect(component.ctx.filter).toEqual('brightness(0.30)');
    });

    it('should apply the invert filter', () => {
        component.fileFormat = 'png';
        component.selectedFilter = 'invert';
        component.applyFilter();
        expect(component.ctx.filter).toEqual('invert(100%)');
    });

    it('should apply the grayscale filter', () => {
        component.fileFormat = 'png';
        component.selectedFilter = 'grayscale';
        component.applyFilter();
        expect(component.ctx.filter).toEqual('grayscale(100%)');
    });

    it('should apply the saturate filter', () => {
        component.fileFormat = 'png';
        component.selectedFilter = 'saturate';
        component.applyFilter();
        expect(component.ctx.filter).toEqual('saturate(7)');
    });

    it('should download the exportCanva', () => {
        const spy = spyOn(component, 'applyFilter');
        component.download();
        expect(spy).toHaveBeenCalled();
    });

    it('should post the image to Imgur', () => {
        const spy = spyOn(component, 'applyFilter');
        component.modifiedImage = 'fakestring';
        component.postImageToImgur();
        backend.expectOne('https://api.imgur.com/3/image');
        expect(spy).toHaveBeenCalled();
    });
});
