import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { imgurData } from '@app/classes/imgur';
import { DrawingService } from '@app/services/drawing/drawing.service';
import * as filterConstants from './export-constants';

@Component({
    selector: 'app-export',
    templateUrl: './export.component.html',
    styleUrls: ['./export.component.scss'],
})
export class ExportComponent {
    fileFormat: string;
    fileName: string;
    selectedFilter: string;
    exportCanvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    image: string = this.drawingService.canvas.toDataURL();
    modifiedImage: string;
    private uploadUrl: string = 'https://api.imgur.com/3/image';
    private clientID: string = 'ae18989b39f0f06';
    imageUrl: string;

    constructor(private drawingService: DrawingService, private http: HttpClient) {}

    applyFilter(): void {
        this.exportCanvas = document.createElement('canvas');
        this.ctx = this.exportCanvas.getContext('2d') as CanvasRenderingContext2D;
        this.exportCanvas.width = this.drawingService.canvas.width;
        this.exportCanvas.height = this.drawingService.canvas.height;
        this.ctx.drawImage(this.drawingService.canvas, 0, 0);
        switch (this.selectedFilter) {
            case 'blur':
                this.ctx.filter = filterConstants.BLUR;
                break;
            case 'brightness':
                this.ctx.filter = filterConstants.BRIGHTNESS;
                break;
            case 'invert':
                this.ctx.filter = filterConstants.INVERT;
                break;
            case 'grayscale':
                this.ctx.filter = filterConstants.GRAYSCALE;
                break;
            case 'saturate':
                this.ctx.filter = filterConstants.SATURATE;
                break;
        }
        this.ctx.drawImage(this.exportCanvas, 0, 0);
        this.modifiedImage = this.exportCanvas.toDataURL('image/' + this.fileFormat);
        this.ctx.clearRect(0, 0, this.drawingService.canvas.height, this.drawingService.canvas.height);
    }

    download(): void {
        this.applyFilter();
        const image = this.modifiedImage;
        const link = document.createElement('a');
        link.download = this.fileName;
        link.href = image;
        link.click();
    }

    postImageToImgur(): void {
        this.applyFilter();
        const base64Data: string = this.modifiedImage.split(',')[1];
        const data = new FormData();
        data.append('image', base64Data);

        const httpOptions = {
            headers: new HttpHeaders({
                Authorization: 'Client-ID ' + this.clientID,
            }),
        };

        this.http
            .post(this.uploadUrl, data, httpOptions)
            .toPromise()
            .then((res: imgurData) => {
                console.log(res);
                this.imageUrl = res.data.link;
            });
    }
}
