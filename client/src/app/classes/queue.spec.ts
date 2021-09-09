import { TestBed } from '@angular/core/testing';
import { Node } from './node';
import { Queue } from './queue';

// tslint:disable:no-string-literal no-any no-magic-numbers
describe('Queue', () => {
    let queue: Queue<number>;
    let enqueueSpy: jasmine.Spy<any>;
    let dequeueSpy: jasmine.Spy<any>;
    let isEmptySpy: jasmine.Spy<any>;
    let clearSpy: jasmine.Spy<any>;

    beforeEach(() => {
        queue = TestBed.inject(Queue);
        enqueueSpy = spyOn<any>(queue, 'enqueue').and.callThrough();
        dequeueSpy = spyOn<any>(queue, 'dequeue').and.callThrough();
        isEmptySpy = spyOn<any>(queue, 'isEmpty').and.callThrough();
        clearSpy = spyOn<any>(queue, 'clear').and.callThrough();
    });

    it('should be created', () => {
        expect(queue).toBeTruthy();
    });

    it('enqueue method should call enqueue with correct parameters', () => {
        queue.enqueue(10);
        expect(enqueueSpy).toHaveBeenCalledWith(10);
    });

    it('enqueue method should set the head to the correct value on enqueue of empty queue', () => {
        queue.enqueue(10);
        expect(enqueueSpy).toHaveBeenCalledWith(10);
        expect(queue['head'].value).toEqual(10);
    });

    it('enqueue method should set the head and tail to the correct values and next Nodes on enqueue of queue of length 1', () => {
        queue.enqueue(10);
        expect(enqueueSpy).toHaveBeenCalledWith(10);
        queue.enqueue(20);
        expect(enqueueSpy).toHaveBeenCalledWith(20);

        expect(queue['head'].value).toEqual(10);
        expect(queue['head'].nextNode).toEqual(queue['tail']);
        expect(queue['tail'].value).toEqual(20);
        expect(queue['tail'].nextNode).toEqual(null);
    });

    it('enqueue method should set the head and tail to the correct values and next Nodes on enqueue of queue of length > 1', () => {
        queue.enqueue(10);
        expect(enqueueSpy).toHaveBeenCalledWith(10);
        queue.enqueue(20);
        expect(enqueueSpy).toHaveBeenCalledWith(20);
        queue.enqueue(30);
        expect(enqueueSpy).toHaveBeenCalledWith(30);

        const middleNode: Node<number> = queue['head'].nextNode as Node<number>;

        expect(queue['head'].value).toEqual(10);
        expect(queue['head'].nextNode).toEqual(middleNode);
        expect(middleNode.value).toEqual(20);
        expect(middleNode.nextNode).toEqual(queue['tail']);
        expect(queue['tail'].value).toEqual(30);
        expect(queue['tail'].nextNode).toEqual(null);
    });

    it('dequeue method should call dequeue and return null on empty queue', () => {
        const result: number | null = queue.dequeue();
        expect(dequeueSpy).toHaveBeenCalled();
        expect(result).toEqual(null);
    });

    it('dequeue method should call dequeue and return the correct value on not empty queue', () => {
        queue.enqueue(10);
        expect(enqueueSpy).toHaveBeenCalledWith(10);
        const result: number | null = queue.dequeue();
        expect(dequeueSpy).toHaveBeenCalled();
        expect(result).toEqual(10);
    });

    it('isEmpty method should return true on empty queue', () => {
        const result: boolean = queue.isEmpty();
        expect(isEmptySpy).toHaveBeenCalled();
        expect(result).toEqual(true);
    });

    it('isEmpty method should return false on not empty queue', () => {
        queue.enqueue(10);
        expect(enqueueSpy).toHaveBeenCalledWith(10);
        const result: boolean = queue.isEmpty();
        expect(isEmptySpy).toHaveBeenCalled();
        expect(result).toEqual(false);
    });

    it('clear method should clear the head, tail and length of the queue when called', () => {
        queue.enqueue(10);
        expect(enqueueSpy).toHaveBeenCalledWith(10);
        queue.enqueue(20);
        expect(enqueueSpy).toHaveBeenCalledWith(20);
        const head: Node<number> = queue['head'];
        const tail: Node<number> = queue['tail'];
        const length: number = queue['length'];
        queue.clear();
        expect(clearSpy).toHaveBeenCalled();
        expect(head).not.toEqual(queue['head']);
        expect(tail).not.toEqual(queue['tail']);
        expect(length).not.toEqual(queue['length']);
        expect(queue['length']).toEqual(0);
    });
});
