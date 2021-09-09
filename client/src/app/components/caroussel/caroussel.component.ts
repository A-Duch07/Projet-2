import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { HttpRequestService } from '@app/services/http-request/http-request.service';
import { Image } from '@common/communication/image';
import * as constants from './caroussel-constants';

// tslint:disable-next-line: max-line-length
// Affichage des images dans carousel, HTML et css class inspire de https://medium.com/showpad-engineering/angular-animations-lets-create-a-carousel-with-reusable-animations-81c0dd8847e8

@Component({
    selector: 'app-caroussel',
    templateUrl: './caroussel.component.html',
    styleUrls: ['./caroussel.component.scss'],
})
export class CarousselComponent implements OnInit {
    images: Image[];
    slides: object[] = [];
    currentSlide: number = 1;
    nextSlide: number = 2;
    previousSlide: number = 0;
    isEmpty: boolean = false;
    tags: string[];
    @ViewChild('chipList') chipList: MatChipList;
    readonly selectable: boolean;
    readonly removable: boolean;
    readonly addOnBlur: boolean;
    readonly separatorKeysCodes: number[] = [constants.COMMA, constants.SPACEBAR, constants.ENTER];

    constructor(private httpRequestService: HttpRequestService, private drawingService: DrawingService) {
        this.tags = [];
        this.selectable = true;
        this.removable = true;
        this.addOnBlur = true;
    }

    onPreviousClick(): void {
        const previous = this.currentSlide - 1;
        this.currentSlide = previous < 0 ? this.slides.length - 1 : previous;
        this.nextSlide = this.currentSlide + 1;
        if (this.nextSlide === this.slides.length) {
            this.nextSlide = 0;
        }
        this.previousSlide = this.currentSlide - 1;
        if (this.previousSlide < 0) {
            this.previousSlide = this.slides.length - 1;
        }
    }

    onNextClick(): void {
        const next = this.currentSlide + 1;
        this.currentSlide = next === this.slides.length ? 0 : next;
        this.nextSlide = this.currentSlide + 1;
        if (this.nextSlide === this.slides.length) {
            this.nextSlide = 0;
        }
        this.previousSlide = this.currentSlide - 1;
        if (this.previousSlide < 0) {
            this.previousSlide = this.slides.length - 1;
        }
    }

    ngOnInit(): void {
        this.getAllImagesFromServer();
    }

    private processDrawings(images: Image[]): void {
        this.images = images;

        for (const image of images) {
            const slide: object = {
                src: 'data:image/png;base64,' + image.data,
                id: image.metaData._id,
                nom: image.metaData.name,
                tags: image.metaData.tags,
            };

            this.slides.push(slide);
        }
        if (this.slides.length === 0) {
            this.isEmpty = true;
        }
        if (this.slides.length === 1) {
            this.currentSlide = 0;
            this.nextSlide = 0;
            this.previousSlide = 0;
        }
    }

    private getAllImagesFromServer(): void {
        // Issue relatif a une nouvelle version de TypeScript, comme on peut le voir ici : https://github.com/microsoft/TypeScript/issues/43053
        // Issue relativement recent que je ne recontrais pas au sprint 1, donc je disable la deprecation comme ca semble etre une erreur du cote
        // de typescript
        // tslint:disable-next-line: deprecation
        this.httpRequestService.getAllImagesFromServer().subscribe((images: Image[]) => {
            this.processDrawings(images);
        });
    }

    // Utiliser pour update le caroussel aussi
    searchForDrawing(): void {
        this.isEmpty = false;
        this.slides = [];
        this.currentSlide = 1;
        this.nextSlide = 2;
        this.previousSlide = 0;
        if (this.tags.length !== 0) {
            // Issue relatif a une nouvelle version de TypeScript, comme on peut le voir ici : https://github.com/microsoft/TypeScript/issues/43053
            // Issue relativement recent que je ne recontrais pas au sprint 1, donc je disable la deprecation comme ca semble etre une erreur du cote
            // de typescript
            // tslint:disable-next-line: deprecation
            this.httpRequestService.getSearchImageFromServer(this.tags).subscribe((images: Image[]) => {
                this.processDrawings(images);
            });
        } else {
            this.getAllImagesFromServer();
        }
    }

    deleteCurrentDrawing(): void {
        // Issue relatif a une nouvelle version de TypeScript, comme on peut le voir ici : https://github.com/microsoft/TypeScript/issues/43053
        // Issue relativement recent que je ne recontrais pas au sprint 1, donc je disable la deprecation comme ca semble etre une erreur du cote
        // de typescript
        // tslint:disable-next-line: deprecation
        this.httpRequestService.deleteImageFromServer(this.images[this.currentSlide].metaData._id as string).subscribe(
            () => {
                this.searchForDrawing();
            },
            (error: Error) => {
                window.alert("Le dessin n'a pas pu etre supprimer (erreur du serveur)");
            },
        );
    }

    openDrawing(): void {
        const printedImage = new Image();
        printedImage.src = 'data:image/png;base64,' + this.images[this.currentSlide].data;
        this.drawingService.carouselOpened = true;
        this.drawingService.carouselDrawing = printedImage;
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case 'ArrowLeft':
                this.onPreviousClick();
                break;
            case 'ArrowRight':
                this.onNextClick();
                break;
        }
    }

    // Ajout du tag au array tags
    addTag(event: MatChipInputEvent): void {
        const input = event.input;
        const tag = event.value;

        // Validate then add tag
        const validTag: RegExp = /^\w{1,15}$/;
        if (tag) {
            // Verifie le contenu de chaque tag
            if (tag.length > 0 && tag.length < constants.MAX_LENGTH_TAGS && validTag.test(tag)) {
                this.tags.push(tag);
                this.chipList.errorState = false;
            } else {
                this.chipList.errorState = true;
            }
        } else {
            this.chipList.errorState = false;
        }

        // Reset la valeur du input a vide
        if (input) {
            input.value = '';
        }
    }

    // Retrait d'un tag
    removeTag(tag: string): void {
        const index = this.tags.indexOf(tag);

        if (index >= 0) {
            this.tags.splice(index, 1);
        }
    }
}
