import { randomHsl, generateId } from './helpers.js';

class Store {
    constructor() {
        this.observers = [];
        this.state = {
            shapes: [],
        };

        this.loadFromStorage();
    }

    subscribe(observer) {
        this.observers.push(observer);
    }

    notify() {
        this.observers.forEach((observer) => observer.update(this.state));
        this.saveToStorage();
    }

    saveToStorage() {
        localStorage.setItem(
            'shapes-app-state',
            JSON.stringify(this.state.shapes)
        );
    }

    loadFromStorage() {
        const data = localStorage.getItem('shapes-app-state');
        if (data) {
            this.state.shapes = JSON.parse(data);
        }
    }

    // Zmiana stanu

    addShape(type) {
        const shape = {
            id: generateId(),
            type: type, // square lub circle
            color: randomHsl(),
        };
        this.state.shapes.push(shape);
        this.notify();
    }

    removeShape(id) {
        this.state.shapes = this.state.shapes.filter((s) => s.id !== id);
        this.notify();
    }

    recolor(targetType) {
        this.state.shapes.forEach((shape) => {
            if (shape.type === targetType) {
                shape.color = randomHsl();
            }
        });
        this.notify();
    }

    getShapes() {
        return this.state.shapes;
    }

    // Dynamiczne wyliczanie statystyk
    getCounts() {
        return this.state.shapes.reduce(
            (acc, shape) => {
                if (shape.type === 'square') acc.squares++;
                if (shape.type === 'circle') acc.circles++;
                return acc;
            },
            { squares: 0, circles: 0 }
        );
    }
}

export default new Store(); // Eksportujemy gotową instancję (Singleton)
