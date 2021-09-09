export class Node<Type> {
    nextNode: Node<Type> | null;
    value: Type | null;

    constructor(nextNode: Node<Type> | null = null, value: Type | null = null) {
        this.nextNode = nextNode;
        this.value = value;
    }
}
