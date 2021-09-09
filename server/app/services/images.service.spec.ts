import { fail } from 'assert';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as fs from 'fs';
import { describe } from 'mocha';
import { Image } from '../../../common/communication/image';
import { ImageMetaData } from '../../../common/communication/image-meta-data';
import * as testConstants from '../../../common/communication/request-test-constants';
import { Stubbed, testingContainer } from '../../test/test-utils';
import { TYPES } from '../types';
import { DatabaseService } from './database.service';
import { ImageService } from './images.service';
chai.use(chaiAsPromised); // this allows us to test for rejection

// Nous avons installe chai-as-promised et mongodb-memory-server pour tester le serveur sans reellement le modifier
// et pour simplifier les tests avec les promesses

// On disable no-unused-expression pour les chai.expect().to.equal, comme ils ne sont pas relleement inutilise
// tslint:disable: no-unused-expression

describe('ImagesService', () => {
    let imageService: ImageService;
    let databaseService: Stubbed<DatabaseService>;
    let expectedImages: Image[];
    let mockImageMetaDatas: ImageMetaData[];

    beforeEach(async () => {
        expectedImages = testConstants.images;
        mockImageMetaDatas = testConstants.imageMetaData;
        const [container, sandbox] = await testingContainer();
        container.rebind(TYPES.DatabaseService).toConstantValue({
            getAllImages: sandbox.stub().resolves(mockImageMetaDatas),
            searchImage: sandbox.stub().resolves([mockImageMetaDatas[1]]),
            deleteImage: sandbox.stub().resolves(),
            addToDB: sandbox.stub().resolves('mock1'),
        });
        databaseService = container.get(TYPES.DatabaseService);
        imageService = container.get<ImageService>(TYPES.ImageService);

        // Verifie que le fichier existe sur le serveur, sinon les creer
        if (!fs.existsSync('./images/mock1.png')) {
            fs.writeFileSync('./images/mock1.png', Buffer.from(expectedImages[0].data, 'base64'));
        }
        if (!fs.existsSync('./images/mock2.png')) {
            fs.writeFileSync('./images/mock2.png', Buffer.from(expectedImages[1].data, 'base64'));
        }
    });

    it('should return all the images when calling getAllImages()', async () => {
        const result: Image[] = await imageService.getAllImages();
        chai.expect(result).to.eql(expectedImages);
    });

    it('should handle an error from DatabaseService when calling searchImage()', async () => {
        databaseService.getAllImages.rejects(new Error('This is a test error'));
        await chai.expect(imageService.getAllImages()).to.be.rejectedWith(Error, 'This is a test error');
    });

    it('should return specified images when calling searchImage(tags)', async () => {
        const result: Image[] = await imageService.searchImage(['t1']);
        chai.expect(result).to.eql([expectedImages[1]]);
    });

    it('should handle an error from DatabaseService when calling searchImage(tags)', async () => {
        databaseService.searchImage.rejects(new Error('This is a test error'));
        await chai.expect(imageService.searchImage(['t1'])).to.be.rejectedWith(Error, 'This is a test error');
    });

    it('should delete the specified image from the server when calling delete(id)', async () => {
        await imageService.deleteImage('mock1');
        const result: boolean = fs.existsSync('./images/mock1.png');
        chai.expect(result).to.be.false;
    });

    it('should handle error when calling delete(id) and the id doesnt exist', async () => {
        await chai.expect(imageService.deleteImage('test')).to.be.rejectedWith(Error);
    });

    it('should handle an error from DatabaseService when calling delete(id)', async () => {
        databaseService.deleteImage.rejects(new Error('This is a test error'));
        await chai.expect(imageService.deleteImage('mock1')).to.be.rejectedWith(Error, 'This is a test error');
    });

    it('should add the specified image to the server when calling add(image)', async () => {
        // Delete the image before trying to add it to the server, fail the test if an error is encountered
        try {
            if (fs.existsSync('./images/mock1.png')) {
                fs.unlinkSync('./images/mock1.png');
            }
        } catch {
            fail();
        }
        const id: string = await imageService.addImage(expectedImages[0]);
        const result: boolean = fs.existsSync('./images/mock1.png');
        chai.expect(result).to.be.true;
        chai.expect(id).to.equal('mock1');
    });

    it('should handle error when calling addImage(image) and the image has empty data', async () => {
        // Delete the image before trying to add it to the server, fail the test if an error is encountered
        try {
            if (fs.existsSync('./images/mock1.png')) {
                fs.unlinkSync('./images/mock1.png');
            }
        } catch {
            fail();
        }
        const image: Image = {
            metaData: mockImageMetaDatas[0],
            data: '',
        };
        await chai.expect(imageService.addImage(image)).to.be.rejectedWith(Error, 'Empty data');
    });

    it('should handle an error from DatabaseService when calling addImage(image)', async () => {
        // Delete the image before trying to add it to the server, fail the test if an error is encountered
        try {
            if (fs.existsSync('./images/mock1.png')) {
                fs.unlinkSync('./images/mock1.png');
            }
        } catch {
            fail();
        }

        databaseService.addToDB.rejects(new Error('This is a test error'));
        await chai.expect(imageService.addImage(expectedImages[0])).to.be.rejectedWith(Error, 'This is a test error');
    });

    it('should handle an error from DatabaseService when calling addImage(image) if response is an empty id', async () => {
        // Delete the image before trying to add it to the server, fail the test if an error is encountered
        try {
            if (fs.existsSync('./images/mock1.png')) {
                fs.unlinkSync('./images/mock1.png');
            }
        } catch {
            fail();
        }

        databaseService.addToDB.resolves(null);
        await chai.expect(imageService.addImage(expectedImages[0])).to.be.rejectedWith(Error, 'Failed to add image meta data to database');
    });

    it('should handle error when metaData.name is null for validateImageMetaData(metaData)', async () => {
        // Utilise addImage pour tester l'appel interne a validateMetaData
        const metaData: object = {
            name: null,
            tags: null,
        };
        const image: object = {
            metaData,
            data: expectedImages[0].data,
        };
        await chai.expect(imageService.addImage(image as Image)).to.be.rejectedWith(Error, 'Invalid image name');
    });

    it('should handle error when metaData.name is empty string for validateImageMetaData(metaData)', async () => {
        // Utilise addImage pour tester l'appel interne a validateMetaData
        const metaData: object = {
            name: '',
            tags: null,
        };
        const image: object = {
            metaData,
            data: expectedImages[0].data,
        };
        await chai.expect(imageService.addImage(image as Image)).to.be.rejectedWith(Error, 'Invalid image name');
    });

    it('should handle error when metaData.tags is null validateImageMetaData(metaData)', async () => {
        // Utilise addImage pour tester l'appel interne a validateMetaData
        const metaData: object = {
            name: 'name',
            tags: null,
        };
        const image: object = {
            metaData,
            data: expectedImages[0].data,
        };
        await chai.expect(imageService.addImage(image as Image)).to.be.rejectedWith(Error, 'Invalid tags');
    });

    it('should handle error when metaData.tags is comprised of an empty string for validateImageMetaData(metaData)', async () => {
        // Utilise addImage pour tester l'appel interne a validateMetaData
        const metaData: object = {
            name: 'name',
            tags: [''],
        };
        const image: object = {
            metaData,
            data: expectedImages[0].data,
        };
        await chai.expect(imageService.addImage(image as Image)).to.be.rejectedWith(Error, 'Invalid tags');
    });

    it('should handle error when metaData.tags is comprised of a string longer than 15 chars for validateImageMetaData(metaData)', async () => {
        // Utilise addImage pour tester l'appel interne a validateMetaData
        const metaData: object = {
            name: 'name',
            tags: ['12345678912345678912'],
        };
        const image: object = {
            metaData,
            data: expectedImages[0].data,
        };
        await chai.expect(imageService.addImage(image as Image)).to.be.rejectedWith(Error, 'Invalid tags');
    });

    it('should handle error when metaData.tags is comprised of a an invalid string (like "&^") for validateImageMetaData(metaData)', async () => {
        // Utilise addImage pour tester l'appel interne a validateMetaData
        const metaData: object = {
            name: 'name',
            tags: ['&^'],
        };
        const image: object = {
            metaData,
            data: expectedImages[0].data,
        };
        await chai.expect(imageService.addImage(image as Image)).to.be.rejectedWith(Error, 'Invalid tags');
    });
});
