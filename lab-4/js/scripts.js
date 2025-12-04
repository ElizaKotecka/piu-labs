document.addEventListener('DOMContentLoaded', () => {
    // Stan aplikacji
    let boardState = {
        todo: [],
        inprogress: [],
        done: [],
    };

    const storageKey = 'kanbanBoardData';

    // Generowanie losowego jasnego koloru
    function getRandomColor() {
        const h = Math.floor(Math.random() * 360);
        return `hsl(${h}, 70%, 90%)`;
    }

    // Generowanie unikalnego ID
    function generateId() {
        return 'card-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }

    // Zapis do LocalStorage
    function saveState() {
        localStorage.setItem(storageKey, JSON.stringify(boardState));
        updateCounters();
    }

    // Odczyt z LocalStorage
    function loadState() {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            boardState = JSON.parse(saved);
            renderBoard();
        }
        updateCounters();
    }

    // Aktualizacja liczników w nagłówkach
    function updateCounters() {
        document.querySelector('#col-todo .count').innerText =
            boardState.todo.length;
        document.querySelector('#col-inprogress .count').innerText =
            boardState.inprogress.length;
        document.querySelector('#col-done .count').innerText =
            boardState.done.length;
    }

    // Tworzenie elementu HTML karty
    function createCardElement(cardObj) {
        const card = document.createElement('div');
        card.className = 'card';
        card.id = cardObj.id;
        card.style.backgroundColor = cardObj.color;

        card.innerHTML = `
            <button class="btn-delete" title="Usuń">✕</button>
            <div class="card-content" contenteditable="true">${cardObj.content}</div>
            <div class="card-actions">
                <button class="btn-prev">←</button>
                <button class="btn-card-color" title="Zmień kolor">🎨</button>
                <button class="btn-next">→</button>
            </div>
        `;
        return card;
    }

    // Renderowanie całej tablicy na podstawie stanu
    function renderBoard() {
        ['todo', 'inprogress', 'done'].forEach((colId) => {
            const listContainer = document.querySelector(
                `#col-${colId} .card-list`
            );
            listContainer.innerHTML = ''; // Czyścimy
            boardState[colId].forEach((cardData) => {
                const cardEl = createCardElement(cardData);
                listContainer.appendChild(cardEl);
            });
        });
    }

    // Sortowanie kolumny (alfabetycznie)
    function sortColumn(colKey) {
        boardState[colKey].sort((a, b) => a.content.localeCompare(b.content));
        renderBoard();
        saveState();
    }

    // 1. Obsługa przycisków w nagłówkach kolumn (Dodaj, Koloruj, Sortuj)
    document.querySelectorAll('.column').forEach((column) => {
        column.addEventListener('click', (e) => {
            const colKey = column.dataset.column;

            // Dodaj kartę
            if (e.target.classList.contains('btn-add')) {
                const newCard = {
                    id: generateId(),
                    content: 'Nowe zadanie...',
                    color: getRandomColor(),
                };
                boardState[colKey].push(newCard);
                // Dodajemy bezpośrednio do DOM
                const list = column.querySelector('.card-list');
                list.appendChild(createCardElement(newCard));
                saveState();
            }

            // Koloruj całą kolumnę
            if (e.target.classList.contains('btn-color')) {
                const newColColor = getRandomColor();
                // Zaktualizuj stan
                boardState[colKey].forEach(
                    (card) => (card.color = newColColor)
                );
                // Zaktualizuj widok
                column
                    .querySelectorAll('.card')
                    .forEach(
                        (card) => (card.style.backgroundColor = newColColor)
                    );
                saveState();
            }

            // Sortuj kolumnę
            if (e.target.classList.contains('btn-sort')) {
                sortColumn(colKey);
            }
        });
    });

    // 2. Obsługa zdarzeń na kartach (Usuń, Edycja, Przesuń, Koloruj pojedynczo)
    // Delegujemy zdarzenia na kontener całej tablicy #board
    const board = document.getElementById('board');

    board.addEventListener('click', (e) => {
        const cardEl = e.target.closest('.card');
        if (!cardEl) return;

        const columnEl = cardEl.closest('.column');
        const colKey = columnEl.dataset.column;
        const cardId = cardEl.id;

        // Usuwanie
        if (e.target.classList.contains('btn-delete')) {
            boardState[colKey] = boardState[colKey].filter(
                (c) => c.id !== cardId
            );
            cardEl.remove();
            saveState();
        }

        // Przesuwanie w prawo
        if (e.target.classList.contains('btn-next')) {
            let targetCol = null;
            if (colKey === 'todo') targetCol = 'inprogress';
            else if (colKey === 'inprogress') targetCol = 'done';

            if (targetCol) {
                moveCardData(cardId, colKey, targetCol);
            }
        }

        // Przesuwanie w lewo
        if (e.target.classList.contains('btn-prev')) {
            let targetCol = null;
            if (colKey === 'done') targetCol = 'inprogress';
            else if (colKey === 'inprogress') targetCol = 'todo';

            if (targetCol) {
                moveCardData(cardId, colKey, targetCol);
            }
        }

        // Kolorowanie pojedynczej karty
        if (e.target.classList.contains('btn-card-color')) {
            const newColor = getRandomColor();
            cardEl.style.backgroundColor = newColor;
            // Aktualizacja stanu
            const cardData = boardState[colKey].find((c) => c.id === cardId);
            if (cardData) {
                cardData.color = newColor;
                saveState();
            }
        }
    });

    // 3. Obsługa edycji treści (input)
    board.addEventListener('input', (e) => {
        if (e.target.classList.contains('card-content')) {
            const cardEl = e.target.closest('.card');
            const colKey = cardEl.closest('.column').dataset.column;
            const cardId = cardEl.id;
            const newText = e.target.innerText;

            const cardData = boardState[colKey].find((c) => c.id === cardId);
            if (cardData) {
                cardData.content = newText;
                // Zapisujemy przy każdej zmianie
                localStorage.setItem(storageKey, JSON.stringify(boardState));
            }
        }
    });

    // Logika przenoszenia danych między tablicami
    function moveCardData(cardId, fromCol, toCol) {
        // Znajdź kartę
        const cardIndex = boardState[fromCol].findIndex((c) => c.id === cardId);
        if (cardIndex > -1) {
            const [cardToMove] = boardState[fromCol].splice(cardIndex, 1);
            boardState[toCol].push(cardToMove);
            saveState();
            renderBoard();
        }
    }

    // Inicjalizacja
    loadState();
});
