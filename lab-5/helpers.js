export function randomHsl() {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 75%)`;
}

export function generateId() {
    // generator unikalnego ID (timestamp + losowa końcówka)
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
