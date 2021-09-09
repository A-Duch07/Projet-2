import { HttpException } from '@app/classes/http.exception';
import { Image } from '@common/communication/image';
import { ImageMetaData } from '@common/communication/image-meta-data';
import * as fs from 'fs';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { TYPES } from '../types';
import { DatabaseService } from './database.service';
import * as constants from './images-constants';

@injectable()
export class ImageService {
    private readonly pathToImages: string = './images/';
    constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {}

    async getAllImages(): Promise<Image[]> {
        return this.databaseService
            .getAllImages()
            .then((metaDatas: ImageMetaData[]) => {
                return this.convertMetaDataToImage(metaDatas);
            })
            .catch((error: Error) => {
                throw new HttpException(error.message);
            });
    }

    async searchImage(tags: string[]): Promise<Image[]> {
        return this.databaseService
            .searchImage(tags)
            .then((metaDatas: ImageMetaData[]) => {
                return this.convertMetaDataToImage(metaDatas);
            })
            .catch((error: Error) => {
                throw new HttpException(error.message);
            });
    }

    async deleteImage(id: string): Promise<void> {
        return this.databaseService
            .deleteImage(id)
            .then(() => {
                const path: string = this.pathToImages + id + '.png';

                // Deletes the image for the specified path
                fs.unlinkSync(path);

                // Verifies that the image has truly been deleted, if not throws an error
                if (fs.existsSync(path)) {
                    throw new HttpException('Failed to delete image on the server');
                }
            })
            .catch((error: HttpException) => {
                throw new HttpException(error.message, error.status);
            });
    }

    async addImage(image: Image): Promise<string> {
        const metaData = image.metaData;

        // Buffer.from -> prend le image.data en base64, enleve les portions du string non importante et le converti en buffer
        const data: Buffer = Buffer.from(image.data.replace('data:image/png;base64,', ''), 'base64');

        // Valide les données à mettre sur le serveur
        this.validateImageMetaData(metaData);

        if (!data || data.length === 0) {
            throw new HttpException('Empty data');
        }

        return this.databaseService
            .addToDB(metaData)
            .then((imageID: string) => {
                const path: string = this.pathToImages + imageID + '.png';

                if (imageID) {
                    fs.writeFileSync(path, data);
                } else {
                    throw new HttpException('Failed to add image meta data to database');
                }

                // Valide que l'image a ete creer
                if (!fs.existsSync(path)) {
                    throw new HttpException('Failed to create image on the server');
                }

                return imageID;
            })
            .catch((error: Error) => {
                throw new HttpException(error.message);
            });
    }

    private validateImageMetaData(metaData: ImageMetaData): void {
        const name = metaData.name;
        const tags = metaData.tags;

        // Nom non-null et non-vide
        if (!name) {
            throw new HttpException('Invalid image name');
        }

        // A-Z, a-z, 0-9, _ sont des chars valides
        const validTag: RegExp = /\w/;
        if (tags) {
            for (const tag of tags) {
                // Verifie la longueur de chaque tag
                if (tag.length > 0 && tag.length < constants.MAX_LENGTH_TAG) {
                    // Verifie le contenu de chaque tag
                    if (!validTag.test(tag)) {
                        throw new HttpException('Invalid tags');
                    }
                } else {
                    throw new HttpException('Invalid tags');
                }
            }
        } else {
            throw new HttpException('Invalid tags');
        }
    }

    private convertMetaDataToImage(metaDatas: ImageMetaData[]): Image[] {
        const images: Image[] = [];
        for (const metaData of metaDatas) {
            if (metaData) {
                const path: string = this.pathToImages + metaData._id + '.png';
                const image: Image = {
                    metaData,
                    data: '',
                };

                // Valide que l'image a ete creer
                if (fs.existsSync(path)) {
                    const data: string = fs.readFileSync(path, { encoding: 'base64' });
                    if (data) {
                        image.data = data;
                        images.push(image);
                    }
                }
            }
        }
        return images;
    }
}
