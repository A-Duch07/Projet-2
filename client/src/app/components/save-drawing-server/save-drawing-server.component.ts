import { Component, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import { HttpRequestService } from '@app/services/http-request/http-request.service';
import * as constants from './save-drawing-constants';

@Component({
    selector: 'app-save-drawing-server',
    templateUrl: './save-drawing-server.component.html',
    styleUrls: ['./save-drawing-server.component.scss'],
})
export class SaveDrawingServerComponent {
    name: FormControl;
    tags: string[];
    serverError: boolean;
    serverErrorMessage: string;
    savingImage: boolean;
    saved: boolean;
    @ViewChild('chipList') chipList: MatChipList;
    readonly selectable: boolean;
    readonly removable: boolean;
    readonly addOnBlur: boolean;
    readonly separatorKeysCodes: number[] = [constants.COMMA, constants.SPACEBAR, constants.ENTER];

    constructor(private httpRequestService: HttpRequestService) {
        this.name = new FormControl('', [Validators.required]);
        this.tags = [];
        this.selectable = true;
        this.removable = true;
        this.addOnBlur = true;
        this.serverError = false;
        this.serverErrorMessage = '';
        this.savingImage = false;
    }

    getErrorMessageName(): string {
        return this.name.hasError('required') ? 'Le nom de votre dessin ne peut pas être vide.' : '';
    }

    getErrorMessageTags(): string {
        return "L'étiquette est invalide.";
    }

    // Ajout du tag au array tags
    addTag(event: MatChipInputEvent): void {
        const input = event.input;
        const tag = event.value;

        // Validate then add tag
        const validTag: RegExp = /^\w{1,15}$/;
        if (tag) {
            // Verifie le contenu de chaque tag
            if (tag.length > 0 && tag.length < 16 && validTag.test(tag)) {
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

    postImageToServeur(): void {
        this.savingImage = true;
        this.serverError = false;
        // Pas besoin de verifier pour les tags, comme on ajoute pas les tags invalides
        if (!this.name.invalid) {
            // TODO add try catch and display the error if necessary in the component
            try {
                // Issue relatif a une nouvelle version de TypeScript, comme on peut le voir ici :
                // https://github.com/microsoft/TypeScript/issues/43053
                // Issue relativement recent que je ne recontrais pas au sprint 1, donc je disable
                // la deprecation comme ca semble etre une erreur du cote de typescript
                // Ici la methode subscribe prend un param error de type any, donc je disable tslint
                // tslint:disable-next-line: deprecation no-any
                this.httpRequestService.postImageToServeur(this.name.value, this.tags).subscribe();
            } catch (error) {
                // Affiche le message d'erreur pour le client
                this.serverError = true;
                this.serverErrorMessage = "Erreur du lors de l'ajout de l'image du côté serveur";
            }
        }
        this.savingImage = false;
    }
}
