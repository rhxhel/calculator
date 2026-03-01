let lastResult = null;
let justCalculated = false;

// --- Procedural Logic ---
function evaluateProcedural(expr) {
    return eval(expr);
}

// --- OOP Logic ---
class SmartCalculator {
    constructor(expression) {
        this.expression = expression;
    }

    execute() {
        return eval(this.expression);
    }
}

// --- Functional Logic ---
function evaluateFunctional(expr) {
    const compute = (expression) => eval(expression);
    return compute(expr);
}

// --- MAIN HANDLER ---
function handleAction() {
    const input = document.getElementById('expressionInput');
    const expression = input.value;
    const mode = document.getElementById('paradigmChoice').value;
    const display = document.getElementById('resultDisplay');

    if (!expression) {
        display.innerText = "Result: Enter expression!";
        return;
    }

    try {
        let result;

        if (mode === 'procedural') {
            result = evaluateProcedural(expression);
        } else if (mode === 'oop') {
            result = new SmartCalculator(expression).execute();
        } else if (mode === 'functional') {
            result = evaluateFunctional(expression);
        } else {
            result = eval(expression);
        }

        display.innerText = `Result: ${result}`;
        addToHistory(expression, result);

        // SAVE RESULT
        lastResult = result;
        justCalculated = true;

        // CLEAR INPUT
        input.value = '';

    } catch (err) {
        display.innerText = "Result: Error";
    }
}

// --- Append Button Click / Keyboard Input ---
function appendValue(value) {
    const input = document.getElementById('expressionInput');

    // Continue calculation if operator pressed after result
    if (justCalculated && input.value === '' && ['+', '-', '*', '/'].includes(value)) {
        input.value = lastResult + value;
        justCalculated = false;
        return;
    }

    // Start fresh if typing number after result
    if (justCalculated && /[0-9.]/.test(value)) {
        input.value = value;
        justCalculated = false;
        return;
    }

    input.value += value;
    justCalculated = false;
}

// --- History Management ---
function addToHistory(expr, result) {
    const list = document.getElementById('historyList');
    const entry = document.createElement('li');
    entry.innerText = `${expr} = ${result}`;
    list.prepend(entry);
}

function clearHistory() {
    document.getElementById('historyList').innerHTML = '';
}

// --- Clear / Delete / Copy ---
function clearCalculator() {
    document.getElementById('expressionInput').value = '';
    document.getElementById('resultDisplay').innerText = 'Result: --';
}

function deleteLast() {
    const input = document.getElementById('expressionInput');
    input.value = input.value.slice(0, -1);
}

function copyResult() {
    const display = document.getElementById('resultDisplay');
    const input = document.getElementById('expressionInput');
    const res = display.innerText.replace('Result: ', '');

    if (res !== '--' && res !== 'Error') {
        input.value += res; // append last result
        lastResult = res;
        justCalculated = false;

        // Copy to clipboard
        navigator.clipboard.writeText(res);
    }
}

// --- Restrict Keyboard Input in Field ---
const inputField = document.getElementById('expressionInput');
inputField.addEventListener('input', function () {
    this.value = this.value.replace(/[^0-9+\-*/.]/g, '');
});

// --- Keyboard Support for Calculator ---
document.addEventListener('keydown', (event) => {
    const key = event.key;
    const allowedOperators = ['+', '-', '*', '/'];

    if (!isNaN(key) || key === '.') {
        appendValue(key);
    } else if (allowedOperators.includes(key)) {
        appendValue(key);
    } else if (key === 'Enter') {
        handleAction();
    } else if (key === 'Backspace') {
        deleteLast();
    } else if (key === 'Escape') {
        clearCalculator();
    }

    // Prevent default for handled keys
    if (!isNaN(key) || allowedOperators.includes(key) || ['Enter', 'Backspace', 'Escape'].includes(key)) {
        event.preventDefault();
    }
});