import { fail } from 'assert';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { InsertOneWriteOpResult } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ImageMetaData } from '../../../common/communication/image-meta-data';
import { DatabaseService } from './database.service';

chai.use(chaiAsPromised); // this allows us to test for rejection

// Nous avons installe chai-as-promised et mongodb-memory-server pour tester le serveur sans reellement le modifier
// et pour simplifier les tests avec les promesses

// On disable la regle no string literal comme on veut acceder a certains attributs privees de databaseService
// On disable no-unused-expression pour les chai.expect().to.equal, comme ils ne sont pas relleement inutilise
// Disable any pour InsertOneWriteOpResult
// tslint:disable: no-string-literal no-unused-expression no-any

describe('DatabaseService', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;
    const mockImageMetaDatas: ImageMetaData[] = [
        {
            _id: 'mock1',
            name: 'mock1',
            tags: [],
        },
        {
            _id: 'mock2',
            name: 'mock2',
            tags: ['t1', 't2'],
        },
        {
            _id: 'mock3',
            name: 'mock3',
            tags: ['t3'],
        },
    ];

    beforeEach(async () => {
        // Nouvelle instance de database service
        databaseService = new DatabaseService();

        // Nouveau mongo memory server
        mongoServer = new MongoMemoryServer();
    });

    afterEach(async () => {
        if (databaseService['client'] && databaseService['client'].isConnected()) {
            await databaseService['client'].close();
        }
    });

    // On ne test pas le cas avec le vrai url, pour ne pas modifier notre bd
    it('should connect to the database when start is called', async () => {
        // Prend l'uri de notre mongoServer local et s'y connecte
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);

        // Verifie l'instantiation du client, de la db et de la collection
        chai.expect(databaseService['client']).to.not.be.undefined;
        chai.expect(databaseService['db']).to.not.be.undefined;
        chai.expect(databaseService['collection']).to.not.be.undefined;

        // Verifie le db name et le collection name
        chai.expect(databaseService['db'].databaseName).to.equal('ClusterLOG2990');
        chai.expect(databaseService['collection'].collectionName).to.equal('ImageMetaData');
    });

    it('should not connect to the database when start is called with wrong URL', async () => {
        try {
            await chai.expect(databaseService.start('is no bueno')).to.be.rejected;
            // On lance le fail ici pour verifier que le client de databaseService est undefined
            fail();
        } catch {
            chai.expect(databaseService['client']).to.be.undefined;
        }
    });

    it('should no longer be connected if close is called', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService.closeConnection();
        chai.expect(databaseService['client'].isConnected()).to.be.false;
    });

    it('should return all the images meta data from the mock mongo database', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService['collection'].insertMany(mockImageMetaDatas);
        const resultImageMetaData: ImageMetaData[] = await databaseService.getAllImages();
        chai.expect(resultImageMetaData).to.eql(mockImageMetaDatas);
    });

    it('should return all images meta data in accordance to searched tags', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService['collection'].insertMany(mockImageMetaDatas);
        const tags: string[] = ['t3'];
        const expectedResult: ImageMetaData[] = [
            {
                _id: 'mock3',
                name: 'mock3',
                tags: ['t3'],
            },
        ];
        const resultImageMetaData: ImageMetaData[] = await databaseService.searchImage(tags);
        chai.expect(resultImageMetaData).to.eql(expectedResult);
    });

    it('should return no images as no image matches tags', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService['collection'].insertMany(mockImageMetaDatas);
        const tags: string[] = ['t5'];
        const resultImageMetaData: ImageMetaData[] = await databaseService.searchImage(tags);
        chai.expect(resultImageMetaData).to.eql([]);
    });

    it('should delete the image in accordance to id parameter and promise should be fulfilleed', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        const mockDocument: ImageMetaData = {
            name: 'mock1',
            tags: ['t0'],
        };
        const resp: InsertOneWriteOpResult<any> = await databaseService['collection'].insertOne(mockDocument);
        const id: string = resp.insertedId as string;

        await databaseService.deleteImage(id);
        const deletedElem: ImageMetaData[] = await databaseService['collection'].find({ _id: id }).toArray();
        chai.expect(deletedElem).to.eql([]);
    });

    it('should throw error if no image was deleted and promise should be rejected with Error', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);
        await databaseService['collection'].insertMany(mockImageMetaDatas);
        await chai.expect(databaseService.deleteImage('test')).to.be.rejectedWith(Error);
    });

    it('should add exactly a single image meta data to the mock database with correct data', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.start(mongoUri);

        // Ajoute une image a la bd, retourne son id et puis retourne tous les documents de la bd
        const id: string = await databaseService.addToDB(mockImageMetaDatas[0]);
        const result: ImageMetaData[] = await databaseService['collection'].find().toArray();

        chai.expect(id).to.equal('mock1');
        chai.expect(result.length).to.equal(1);
        chai.expect(result[0]).to.eql(mockImageMetaDatas[0]);
    });
});
