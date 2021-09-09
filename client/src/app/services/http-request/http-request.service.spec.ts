import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Image } from '@common/communication/image';
import * as testConstants from '@common/communication/request-test-constants';
import { DrawingService } from '../drawing/drawing.service';
import { HttpRequestService } from './http-request.service';

// Disabled pour acceder a BASE_URL et any pour les spy de jasmine
// tslint:disable: no-string-literal no-any
describe('HttpRequestService', () => {
    let service: HttpRequestService;
    let httpMock: HttpTestingController;
    let baseUrl: string;
    let images: Image[];
    let drawingSpy: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;
    let dataUrlSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawingSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingSpy }],
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(HttpRequestService);
        httpMock = TestBed.inject(HttpTestingController);

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service['drawingService'].canvas = canvasTestHelper.canvas;
        service['drawingService'].baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service['drawingService'].previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        baseUrl = service['BASE_URL'];
        images = testConstants.images;

        dataUrlSpy = spyOn<any>(service['drawingService'].canvas, 'toDataURL');
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should return all the images from the server (HttpClient called once)', () => {
        service.getAllImagesFromServer().subscribe((response: Image[]) => {
            expect(response).toEqual(images, 'Array of images check');
            expect(response.length).toEqual(images.length, 'Array length check');
            for (let i = 0; i < response.length; i++) {
                expect(response[i].metaData).toEqual(images[i].metaData, 'Metadata check');
                expect(response[i].data).toEqual(images[i].data, 'Data check');
            }
        }, fail);

        const req = httpMock.expectOne(baseUrl);
        expect(req.request.method).toBe('GET');
        // Envoie la requete avec notre reponse voulue
        req.flush(images);
    });

    it('should call deleteImageFromServer only once', () => {
        service.deleteImageFromServer('test').subscribe(() => {}, fail);

        const req = httpMock.expectOne(baseUrl + 'delete/test');
        expect(req.request.method).toBe('DELETE');
        // Envoie la requete avec notre reponse voulue
        req.flush({});
    });

    it('should return the correct researched images from the server (HttpClient called once)', () => {
        const expected: Image[] = [images[1]];
        service.getSearchImageFromServer(images[1].metaData.tags).subscribe((response: Image[]) => {
            expect(response).toEqual(expected, 'Array of images check');
            expect(response.length).toEqual(expected.length, 'Array length check');
            for (let i = 0; i < response.length; i++) {
                expect(response[i].metaData).toEqual(expected[i].metaData, 'Metadata check');
                expect(response[i].data).toEqual(expected[i].data, 'Data check');
            }
        }, fail);

        const req = httpMock.expectOne(baseUrl + 'search/t1,t2');
        expect(req.request.method).toBe('GET');
        // Envoie la requete avec notre reponse voulue
        req.flush(expected);
    });

    it('should return the correct researched images from the server (HttpClient called once)', () => {
        const _id: string = images[0].metaData._id as string;
        const name: string = images[0].metaData.name;
        const tags: string[] = images[0].metaData.tags;
        const data: string = images[0].data;
        const expected: Image = {
            metaData: { name: name, tags: tags },
            data: data,
        };
        dataUrlSpy.and.callFake(() => {
            return data;
        });

        service.postImageToServeur(name, tags).subscribe((response: string) => {
            expect(response).toEqual(_id, 'Id string to check');
        }, fail);

        const req = httpMock.expectOne(baseUrl + 'add');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(expected);
        // Envoie la requete avec notre reponse voulue
        req.flush(_id);
    });

    it('should throw an error when data is null', () => {
        const name: string = images[0].metaData.name;
        const tags: string[] = images[0].metaData.tags;
        dataUrlSpy.and.callFake(() => {
            return null;
        });

        expect(() => {
            service.postImageToServeur(name, tags);
        }).toThrowError("Erreur dans l'envoie de l'image au serveur : Impossible de convertir le canvas en image.");
    });
});
