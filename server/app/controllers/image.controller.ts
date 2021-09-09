import * as HttpStatusCodes from '@app/classes/http-status-codes';
import { HttpException } from '@app/classes/http.exception';
import { ImageService } from '@app/services/images.service';
import { Image } from '@common/communication/image';
import { Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';

@injectable()
export class ImageController {
    router: Router;

    constructor(@inject(TYPES.ImageService) private imageService: ImageService) {
        this.configureRouter();
        // this.imageService.getAllMessages();
    }

    private configureRouter(): void {
        this.router = Router();

        /**
         * @swagger
         *
         * definitions:
         *   ImageMetaData:
         *     type: object
         *     properties:
         *       name:
         *         type: string
         *       tags:
         *         type: array
         *         items:
         *           type: string
         *   Image:
         *     type: object
         *     properties:
         *       metaData:
         *         type: Object
         *         $ref: '#/definitions/ImageMetaData'
         *       data:
         *         type: string
         */

        /**
         * @swagger
         * tags:
         *   - name: Images
         *     description: Images endpoints
         */

        /**
         * @swagger
         *
         * /api/images:
         *   get:
         *     description: Return all the images from the server
         *     tags:
         *       - Images
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         schema:
         *           $ref: '#/definitions/Image'
         */

        this.router.get('/', async (req: Request, res: Response) => {
            this.imageService
                .getAllImages()
                .then((images: Image[]) => {
                    res.json(images);
                })
                .catch((error: HttpException) => {
                    res.status(error.status).send(error.message);
                });
        });

        /**
         * @swagger
         *
         * /api/images/search:
         *   get:
         *     description: Returns the images corresponding to the searched tags
         *     tags:
         *       - Images
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         schema:
         *           $ref: '#/definitions/Image'
         */

        this.router.get('/search/:tags', async (req: Request, res: Response) => {
            const tagsList: string[] = req.params.tags.split(',');

            this.imageService
                .searchImage(tagsList)
                .then((images: Image[]) => {
                    res.json(images);
                })
                .catch((err: HttpException) => {
                    res.status(err.status).send(err.message);
                });
        });

        /**
         * @swagger
         *
         * /api/images/delete:
         *   delete:
         *     description: Deletes the specified image from the database and the serveur
         *     tags:
         *       - Images
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: Ok
         */

        this.router.delete('/delete/:id', async (req: Request, res: Response) => {
            this.imageService
                .deleteImage(req.params.id)
                .then(() => {
                    res.sendStatus(HttpStatusCodes.NO_CONTENT);
                })
                .catch((error: HttpException) => {
                    res.status(error.status).send(error.message);
                });
        });

        /**
         * @swagger
         *
         * /api/images/add:
         *   post:
         *     description: Send a message
         *     tags:
         *       - Images
         *       - ImageMetaData
         *     requestBody:
         *         description: message object
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/definitions/Image'
         *     produces:
         *       - application/json
         *     responses:
         *       201:
         *         description: Created
         */

        this.router.post('/add', async (req: Request, res: Response) => {
            this.imageService
                .addImage(req.body)
                .then((imageID: string) => {
                    res.status(HttpStatusCodes.CREATED).send(imageID);
                })
                .catch((error: HttpException) => {
                    res.status(error.status).send(error.message);
                });
        });
    }
}
