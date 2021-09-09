import * as HttpStatusCodes from '@app/classes/http-status-codes';
import { HttpException } from '@app/classes/http.exception';
import { ImageMetaData } from '@common/communication/image-meta-data';
import { injectable } from 'inversify';
import { Collection, Db, InsertOneWriteOpResult, MongoClient, MongoClientOptions, ObjectId } from 'mongodb';
import 'reflect-metadata';
// CHANGE the URL for your database information
// Is it a good practice to hard code the password and id of the admin in the code?
const DATABASE_URL = 'mongodb+srv://Admin:Admin@clusterlog2990.t0r4d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const DATABASE_NAME = 'ClusterLOG2990';
const DATABASE_COLLECTION = 'ImageMetaData';

@injectable()
export class DatabaseService {
    private db: Db;
    private client: MongoClient;
    private collection: Collection;

    private options: MongoClientOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    constructor() {
        (async () => {
            try {
                await this.start();
                console.log('Database connection successful !');
            } catch (error) {
                console.error('Database connection failed !');
            }
        })();
    }

    // Pris de l'exemple sur les BD du cours
    // Le parametre de l'url est pratique a des fins de tests
    // Connect au client et instantie this.bd et this.collection
    async start(url: string = DATABASE_URL): Promise<MongoClient | null> {
        try {
            const client = await MongoClient.connect(url, this.options);
            this.client = client;
            this.db = client.db(DATABASE_NAME);
            this.collection = this.db.collection(DATABASE_COLLECTION);
        } catch {
            throw new Error();
        }
        return this.client;
    }

    async closeConnection(): Promise<void> {
        return this.client.close();
    }

    // Retourne toutes les images metadatas de la BD
    async getAllImages(): Promise<ImageMetaData[]> {
        return this.collection
            .find()
            .toArray()
            .then((images: ImageMetaData[]) => {
                return images;
            });
    }

    // Recherche pour toutes les images qui respectent les tags rechercher
    async searchImage(tags: string[]): Promise<ImageMetaData[]> {
        // Construit la query avec les parametres de recherche
        const searchParams: object[] = [];
        for (const tag of tags) {
            searchParams.push({ tags: tag });
        }
        const query: object = { $or: searchParams };

        return this.collection
            .find(query)
            .toArray()
            .then((images: ImageMetaData[]) => {
                return images;
            });
    }

    // Delete un element de la bd en fonction de son id
    async deleteImage(id: string): Promise<void> {
        this.collection.deleteOne({ _id: new ObjectId(id) }).catch((error: Error) => {
            throw new HttpException('Failed to delete image meta data from database', HttpStatusCodes.NOT_FOUND);
        });
    }

    // Ajout d'un objet a la bd
    async addToDB(imageMetaData: ImageMetaData): Promise<string> {
        // Tente d'ajouter le meta data de l'image au serveur et lance une erreur en cas d'erreur
        return (
            this.collection
                .insertOne(imageMetaData)

                // Utilisation de any ici puisque le type de retour de insertOne est InsertOneWriteOpResult,
                // avec comme type assignable pour l'id de any
                // tslint:disable-next-line: no-any
                .then((res: InsertOneWriteOpResult<any>) => {
                    return res.insertedId as string;
                })
                .catch(() => {
                    throw new Error('Failed to add image meta data to database');
                })
        );
    }
}
