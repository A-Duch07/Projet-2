import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import * as supertest from 'supertest';
import { Image } from '../../../common/communication/image';
import * as testConstants from '../../../common/communication/request-test-constants';
import { Stubbed, testingContainer } from '../../test/test-utils';
import { Application } from '../app';
import * as HttpStatusCodes from '../classes/http-status-codes';
import { HttpException } from '../classes/http.exception';
import { ImageService } from '../services/images.service';
import { TYPES } from '../types';
chai.use(chaiAsPromised); // this allows us to test for rejection

// On disable no-unused-expression pour les chai.expect().to.equal, comme ils ne sont pas relleement inutilise
// any type pour les responses des http tested request
// tslint:disable: no-unused-expression no-any

describe('ImageController', () => {
    let imageService: Stubbed<ImageService>;
    let app: Express.Application;
    let responseImages: Image[];

    beforeEach(async () => {
        responseImages = testConstants.images;
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.ImageService).toConstantValue({
            getAllImages: sandbox.stub().resolves(responseImages),
            searchImage: sandbox.stub().resolves([responseImages[1]]),
            deleteImage: sandbox.stub().resolves(),
            addImage: sandbox.stub().resolves('mock1'),
        });
        imageService = container.get(TYPES.ImageService);
        app = container.get<Application>(TYPES.Application).app;
    });

    it('should return images from images service on valid get request to root (/api/images)', async () => {
        return supertest(app)
            .get('/api/images')
            .expect(HttpStatusCodes.OK)
            .then((response: any) => {
                chai.expect(response.body).to.eql(responseImages);
            });
    });

    it('should return an error from images service with service fail on valid get request to root (/api/images)', async () => {
        imageService.getAllImages.rejects(new HttpException('This is a test error'));
        return supertest(app).get('/api/images').expect(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return correct image from images service on valid get request to /api/images/search/t1', async () => {
        return supertest(app)
            .get('/api/images/search/t1')
            .expect(HttpStatusCodes.OK)
            .then((response: any) => {
                chai.expect(response.body).to.eql([responseImages[1]]);
            });
    });

    it('should return an error on invalid get request to /api/images/search/t1 (without tags params)', async () => {
        return supertest(app).get('/api/images/search').expect(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return an error from images service with service fail on valid get request to /api/images/search/t1', async () => {
        imageService.searchImage.rejects(new HttpException('This is a test error'));
        return supertest(app).get('/api/images/search/t1').expect(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should set status to No content on valid request to /api/images/delete/mock1', async () => {
        return supertest(app).delete('/api/images/delete/mock1').expect(HttpStatusCodes.NO_CONTENT);
    });

    it('should return an error on invalid request to /api/images/delete/ (without the id)', async () => {
        return supertest(app).delete('/api/images/delete/').expect(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return an error from images service with service fail on valid request to /api/images/delete/mock1', async () => {
        imageService.deleteImage.rejects(new HttpException('This is a test error'));
        return supertest(app).delete('/api/images/delete/mock1').expect(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should set status to Created on valid request to /api/images/add/', async () => {
        return supertest(app).post('/api/images/add').send(responseImages[0]).expect(HttpStatusCodes.CREATED);
    });

    it('should return an error from images service with service fail on valid request to /api/images/add', async () => {
        imageService.addImage.rejects(new HttpException('This is a test error'));
        return supertest(app).post('/api/images/add').send(responseImages[0]).expect(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    });
});
