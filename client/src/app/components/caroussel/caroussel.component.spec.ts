import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatChipInputEvent } from '@angular/material/chips';
import { RouterTestingModule } from '@angular/router/testing';
import { CarousselComponent } from './caroussel.component';

// tslint:disable: no-magic-numbers

describe('CarousselComponent', () => {
    let component: CarousselComponent;
    let fixture: ComponentFixture<CarousselComponent>;
    let event1: MatChipInputEvent;
    let event2: MatChipInputEvent;
    let event3: MatChipInputEvent;
    // tslint:disable-next-line: prefer-const
    let htmlInput: HTMLInputElement;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule],
            declarations: [CarousselComponent],
        }).compileComponents();
        event1 = { input: htmlInput, value: '1234' };
        event2 = { input: htmlInput, value: '' };
        event3 = { input: htmlInput, value: '12345678910121314' };
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CarousselComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('if next-slide is array lenght, should equal 0', () => {
        component.currentSlide = 4;
        component.onPreviousClick();
        expect(component.nextSlide).toEqual(4);
    });

    it('if previous-slide is < 0, should equal slides.lenght - 1', () => {
        component.currentSlide = 4;
        component.onPreviousClick();
        expect(component.previousSlide).toEqual(2);
    });

    it('if next-slide is array lenght, should equal 0', () => {
        component.currentSlide = 4;
        component.onNextClick();
        expect(component.nextSlide).toEqual(6);
    });

    it('if previous-slide is array lenght, should equal 0', () => {
        component.currentSlide = 4;
        component.onNextClick();
        expect(component.previousSlide).toEqual(4);
    });

    it('onKeyDown left arrow should call the method onPreviousClick ', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowLeft',
        });
        const spy = spyOn(component, 'onPreviousClick');
        component.onKeyDown(event);
        expect(spy).toHaveBeenCalled();
    });

    it('onKeyDown right arrow should call the method onNextClick ', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowRight',
        });
        const spy = spyOn(component, 'onNextClick');
        component.onKeyDown(event);
        expect(spy).toHaveBeenCalled();
    });

    it('should filter the good drawing', () => {
        component.searchForDrawing();
        expect(component.isEmpty).toEqual(false);
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

    it('if next-slide is array lenght, should equal 0', () => {
        component.currentSlide = 4;
        component.onPreviousClick();
        expect(component.nextSlide).toEqual(4);
    });

    it('if previous-slide is < 0, should equal slides.lenght - 1', () => {
        component.currentSlide = 4;
        component.onPreviousClick();
        expect(component.previousSlide).toEqual(2);
    });

    it('if nextSlide is < 0, should equal slides.lenght - 1', () => {
        component.slides.length = 5;
        component.onPreviousClick();
        expect(component.nextSlide).toEqual(1);
    });

    it('if previousSlide is equal array.lenght, should equal 0', () => {
        component.slides.length = 3;
        component.onNextClick();
        expect(component.nextSlide).toEqual(0);
    });

    it('if next-slide is array lenght, should equal 0', () => {
        component.currentSlide = 4;
        component.onNextClick();
        expect(component.nextSlide).toEqual(6);
    });

    it('if previous-slide is array lenght, should equal 0', () => {
        component.currentSlide = 4;
        component.onNextClick();
        expect(component.previousSlide).toEqual(4);
    });

    it('onKeyDown left arrow should call the method onPreviousClick ', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowLeft',
        });
        const spy = spyOn(component, 'onPreviousClick');
        component.onKeyDown(event);
        expect(spy).toHaveBeenCalled();
    });

    it('onKeyDown right arrow should call the method onNextClick ', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'ArrowRight',
        });
        const spy = spyOn(component, 'onNextClick');
        component.onKeyDown(event);
        expect(spy).toHaveBeenCalled();
    });

    it('should filter the good drawing', () => {
        component.searchForDrawing();
        expect(component.isEmpty).toEqual(false);
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
});
