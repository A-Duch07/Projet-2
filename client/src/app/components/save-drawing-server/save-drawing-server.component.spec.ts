import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { HttpRequestService } from '@app/services/http-request/http-request.service';
import { of } from 'rxjs';
import { SaveDrawingServerComponent } from './save-drawing-server.component';

// tslint:disable: no-string-literal
describe('SaveDrawingServerComponent', () => {
    let component: SaveDrawingServerComponent;
    let fixture: ComponentFixture<SaveDrawingServerComponent>;

    let httpSpy: jasmine.SpyObj<HttpRequestService>;

    let event1: MatChipInputEvent;
    let event2: MatChipInputEvent;
    let event3: MatChipInputEvent;
    let htmlInput: HTMLInputElement;

    beforeEach(async(() => {
        httpSpy = jasmine.createSpyObj('HttpRequestService', ['postImageToServeur', 'postImageToServeur.subscribe']);

        TestBed.configureTestingModule({
            declarations: [SaveDrawingServerComponent],
            providers: [{ provide: HttpRequestService, useValue: httpSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        event1 = { input: htmlInput, value: '1234' };
        event2 = { input: htmlInput, value: '' };
        event3 = { input: htmlInput, value: '12345678910121314' };

        fixture = TestBed.createComponent(SaveDrawingServerComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getErrorMessageTags should return Létiquette est invalide.', () => {
        expect(component.getErrorMessageTags()).toEqual("L'étiquette est invalide.");
    });

    it('addTag should add the tag to the stack', () => {
        const expectedResult = 1;
        component.addTag(event1);
        expect(component.tags.length).toEqual(expectedResult);
    });

    it('addTag should not add the tag to the stack if the value is empty', () => {
        const expectedResult = 0;
        component.addTag(event2);
        expect(component.tags.length).toEqual(expectedResult);
    });

    it('addTag should not add the tag to the stack if the tag is longer than 16 characters', () => {
        const expectedResult = 0;
        component.addTag(event3);
        expect(component.tags.length).toEqual(expectedResult);
    });

    it('removeTag should remove the tag from the stack', () => {
        const tag = '1234';
        component.tags.push(tag);
        component.removeTag(tag);
        const expectedResult = 0;
        expect(component.tags.length).toEqual(expectedResult);
    });

    it('postImageToServeur should not call httpRequestService.postImageToServeur with invalid name', () => {
        component.postImageToServeur();
        expect(component.serverError).toEqual(false);
        expect(component.savingImage).toEqual(false);
        expect(component['httpRequestService'].postImageToServeur).not.toHaveBeenCalled();
    });

    it('postImageToServeur should call httpRequestService.postImageToServeur with valid name', () => {
        component.name = new FormControl('test');
        httpSpy.postImageToServeur.and.callFake(() => {
            return of();
        });
        component.postImageToServeur();
        expect(component.serverError).toEqual(false);
        expect(component.savingImage).toEqual(false);
        // tslint:disable-next-line: no-string-literal
        expect(component['httpRequestService'].postImageToServeur).toHaveBeenCalled();
    });

    // tslint:disable-next-line: max-line-length
    it('postImageToServeur should set serverError and serverErrorMessage to expected values on error of httpRequestService.postImageToServeur', () => {
        component.name = new FormControl('test');
        httpSpy.postImageToServeur.and.callFake(() => {
            throw new Error('test error');
        });
        component.postImageToServeur();
        expect(component.serverError).toEqual(true);
        expect(component.savingImage).toEqual(false);
        expect(component.serverErrorMessage).toEqual("Erreur du lors de l'ajout de l'image du côté serveur");
        expect(component['httpRequestService'].postImageToServeur).toHaveBeenCalled();
    });
});
