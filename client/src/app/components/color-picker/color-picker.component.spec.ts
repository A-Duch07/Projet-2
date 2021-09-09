import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import { ColorService } from '@app/services/tools/color.service';
import { ColorPickerComponent } from './color-picker.component';

describe('ColorPickerComponent', () => {
    let component: ColorPickerComponent;
    let fixture: ComponentFixture<ColorPickerComponent>;
    let colorServiceSpy: jasmine.SpyObj<ColorService>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ColorPickerComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        colorServiceSpy = jasmine.createSpyObj('ColorService', ['onColorChange']);

        TestBed.configureTestingModule({
            providers: [{ provide: ColorService, useValue: colorServiceSpy }],
        });
        fixture = TestBed.createComponent(ColorPickerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('alpha property should change on alphaChange from MatSliderChange event if value is defined', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        // Comme c'est un test, valeur arbitraire est testé
        // tslint:disable-next-line: no-magic-numbers
        matSliderChange.value = 0.8;
        component.alphaChange(matSliderChange);
        expect(component.alpha).toEqual(matSliderChange.value + '');
    });

    it('alpha property should not change on alphaChange from MatSliderChange event', () => {
        const matSliderChange: MatSliderChange = new MatSliderChange();
        component.alpha = '0.3';
        component.alphaChange(matSliderChange);
        expect(component.alpha).toEqual('0.3');
    });

    it('color property should change on colorChange from color event', () => {
        const color = 'rgba(0,0,0,1)';
        component.colorChange(color);
        expect(component.color).toEqual('rgba(0,0,0,1)');
    });

    it('colorChange should call parseColor method', () => {
        const color = 'rgba(0,0,0,1)';
        const spy = spyOn(component, 'parseColor');
        component.colorChange(color);
        expect(spy).toHaveBeenCalled();
    });

    it('inputChange should call sanitizeInput method', () => {
        const hexColor = 'ff';
        const spy = spyOn(component, 'sanitizeInput');
        component.inputChange(hexColor, 0);
        expect(spy).toHaveBeenCalled();
    });

    it('inputChange set color property to the new color if it is valid hex', () => {
        const color = 'FF';
        component.inputChange(color, 0);
        expect(component.color).toEqual('rgba(255,0,0,1)');
    });

    it('inputChange does not set color property to the new color if it is not valid hex', () => {
        const color = 'Z6';
        component.inputChange(color, 0);
        expect(component.color).toEqual('rgba(0,0,0,1)');
    });

    it('selectColors call colorService onColorChange method', () => {
        component.selectColor();
        expect(colorServiceSpy.onColorChange).toHaveBeenCalled();
    });

    it('parseColor should parse color correctly and set unsanitizedRgbValues to the corresponding sanitized hex string', () => {
        component.color = 'rgba(255,255,255,1)';
        component.parseColor();
        expect(component.unsanitizedRgbValues).toEqual(['FF', 'FF', 'FF']);
    });

    it('parseColor should parse color correctly and set sanitizedRgbValues to the corresponding sanitized hex string', () => {
        component.color = 'rgba(267,255,255,1)';
        // tslint:disable-next-line: no-string-literal
        component['sanitizedRgbValues'] = ['00', '00', '00'];
        component.parseColor();
        // tslint:disable-next-line: no-string-literal
        expect(component['sanitizedRgbValues']).toEqual(['00', 'FF', 'FF']);
    });

    it('parseColor should call sanitizeInput', () => {
        const spy = spyOn(component, 'sanitizeInput');
        component.parseColor();
        expect(spy).toHaveBeenCalled();
    });

    it('parseColor should not call sanitizeInput if there is not a match with color', () => {
        const spy = spyOn(component, 'sanitizeInput');
        component.color = 'NoMatch';
        component.parseColor();
        expect(spy).not.toHaveBeenCalled();
    });

    it('sanitizeInput should save only valid hex string as sanitizedRgbValues, if not reset to the most recent sanitizedRgbValues', () => {
        component.unsanitizedRgbValues = ['ZC', 'FF', 'T9'];
        component.sanitizeInput();
        expect(component.unsanitizedRgbValues).toEqual(['00', 'FF', '00']);
        // tslint:disable-next-line: no-string-literal
        expect(component['sanitizedRgbValues']).toEqual(['00', 'FF', '00']);
    });
});
