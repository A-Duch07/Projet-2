import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Image } from '@common/communication/image';
import { ImageMetaData } from '@common/communication/image-meta-data';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class HttpRequestService {
    private readonly BASE_URL: string = 'http://localhost:3000/api/images/';

    constructor(private http: HttpClient, private drawingService: DrawingService) {}

    postImageToServeur(name: string, tags: string[]): Observable<string> {
        // Should always be valid metaData, since it is validated in the component
        const metaData: ImageMetaData = {
            name,
            tags,
        };
        let data: string;

        try {
            data = this.drawingService.canvas.toDataURL();

            if (!data) {
                throw new Error();
            }
        } catch {
            throw new Error("Erreur dans l'envoie de l'image au serveur : Impossible de convertir le canvas en image.");
        }

        const image: Image = {
            metaData,
            data,
        };

        return this.http.post<string>(this.BASE_URL + 'add', image);
    }

    getAllImagesFromServer(): Observable<Image[]> {
        return this.http.get<Image[]>(this.BASE_URL);
    }

    deleteImageFromServer(id: string): Observable<void> {
        return this.http.delete<void>(this.BASE_URL + 'delete/' + id);
    }

    getSearchImageFromServer(tags: string[]): Observable<Image[]> {
        return this.http.get<Image[]>(this.BASE_URL + 'search/' + tags.join(','));
    }
}
