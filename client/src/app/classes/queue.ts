import { Injectable } from '@angular/core';
import { Node } from './node';

@Injectable({
    providedIn: 'root',
})
export class Queue<Type> {
    private head: Node<Type>;
    private tail: Node<Type>;
    private length: number;

    constructor() {
        this.clear();
    }

    enqueue(value: Type): void {
        const node: Node<Type> = new Node<Type>(null, value);
        if (this.isEmpty()) {
            this.head = node;
        } else if (this.length === 1) {
            this.tail = node;
            this.head.nextNode = node;
        } else {
            const oldTail: Node<Type> = this.tail;
            this.tail = node;
            oldTail.nextNode = this.tail;
        }
        this.length++;
    }

    dequeue(): Type | null {
        let node: Node<Type> | undefined;
        if (this.length > 0) {
            node = this.head;
            this.length--;
            this.head = node.nextNode as Node<Type>;
        }
        return node ? node.value : null;
    }

    isEmpty(): boolean {
        return this.length === 0;
    }

    clear(): void {
        this.head = new Node<Type>();
        this.tail = new Node<Type>();
        this.length = 0;
    }
}
