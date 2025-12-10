import store from './store.js';

// Elementy DOM
const board = document.getElementById('board');
const cntSquaresEl = document.getElementById('cntSquares');
const cntCirclesEl = document.getElementById('cntCircles');

const addSquareBtn = document.getElementById('addSquare');
const addCircleBtn = document.getElementById('addCircle');
const recolorSquaresBtn = document.getElementById('recolorSquares');
const recolorCirclesBtn = document.getElementById('recolorCircles');

// Funkcja tworząca element DOM dla kształtu
function createShapeElement(shapeObj) {
    const el = document.createElement('div');
    el.className = `shape ${shapeObj.type}`;
    el.style.backgroundColor = shapeObj.color;
    el.dataset.id = shapeObj.id; // Zapisujemy ID w atrybucie
    return el;
}

export const UI = {
    init() {
        // Podpięcie zdarzeń przycisków -> wywołują metody Store
        addSquareBtn.addEventListener('click', () => store.addShape('square'));
        addCircleBtn.addEventListener('click', () => store.addShape('circle'));
        recolorSquaresBtn.addEventListener('click', () =>
            store.recolor('square')
        );
        recolorCirclesBtn.addEventListener('click', () =>
            store.recolor('circle')
        );

        // Usuwanie kształtów
        board.addEventListener('click', (e) => {
            // Sprawdzamy czy kliknięto w element z klasą shape
            if (e.target.classList.contains('shape')) {
                const id = e.target.dataset.id;
                store.removeShape(id);
            }
        });

        // Zapis zmian w Store
        store.subscribe(this);

        // Pierwsze renderowanie (jeśli coś jest w localStorage)
        this.update();
    },

    // Metoda wymagana przez wzorzec Obserwator
    update() {
        const shapes = store.getShapes();
        const counts = store.getCounts();

        // Aktualizacja liczników
        cntSquaresEl.textContent = counts.squares;
        cntCirclesEl.textContent = counts.circles;

        // Aktualizacja listy kształtów

        // Dodawanie nowych i aktualizacja kolorów istniejących
        shapes.forEach((shapeObj) => {
            // Szukamy czy taki element już jest w DOM
            let el = document.querySelector(`.shape[data-id="${shapeObj.id}"]`);

            if (!el) {
                // Jeśli nie ma - tworzymy i dodajemy
                el = createShapeElement(shapeObj);
                board.appendChild(el);
            } else {
                // Jeśli jest - sprawdzamy czy trzeba zaktualizować kolor
                if (el.style.backgroundColor !== shapeObj.color) {
                    el.style.backgroundColor = shapeObj.color;
                }
            }
        });

        // Usuwanie elementów, których nie ma już w Store
        const allDomShapes = document.querySelectorAll('.shape');
        allDomShapes.forEach((domEl) => {
            const id = domEl.dataset.id;
            // Sprawdzamy czy id z DOM istnieje w tablicy ze Store
            const existsInStore = shapes.find((s) => s.id === id);
            if (!existsInStore) {
                domEl.remove();
            }
        });
    },
};
