let activeTab = 'calc-tab';

// Load history from local storage on startup
window.onload = () => {
    const savedHistory = JSON.parse(localStorage.getItem('calcHistory')) || [];
    const historyList = document.getElementById('historyList');
    savedHistory.forEach(item => {
        const li = document.createElement('li');
        li.innerText = item;
        historyList.appendChild(li);
    });
};

// --- TAB MANAGEMENT ---
function switchTab(tabId) {
    activeTab = tabId;
    const wrapper = document.getElementById('app-wrapper');
    
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    
    // Add active class to the button that triggered the event
    const btnId = tabId === 'calc-tab' ? 'calc-tab-btn' : 'convert-tab-btn';
    document.getElementById(btnId).classList.add('active');

    const display = document.getElementById('resultDisplay');
    display.innerText = 'Result: --';
    display.classList.remove('error-state', 'success-state');

    if (tabId === 'convert-tab') {
        wrapper.classList.add('converter-mode');
    } else {
        wrapper.classList.remove('converter-mode');
    }
}

// --- TOKEN PARSING ---
function parseTokens(expr) {
    let normalized = expr.replace(/--/g, '+').replace(/\+-/g, '-');
    let tokens = normalized.split(/([+\-*/%])/).map(t => t.trim()).filter(t => t !== "");
    
    if (tokens[0] === "-" && tokens.length > 1) {
        tokens = ["-" + tokens[1], ...tokens.slice(2)];
    }

    const fixedTokens = [];
    for (let i = 0; i < tokens.length; i++) {
        if (["*", "/", "+", "-", "%"].includes(tokens[i]) && tokens[i+1] === "-") {
            fixedTokens.push(tokens[i]);
            fixedTokens.push("-" + tokens[i+2]); 
            i += 2; 
        } else {
            fixedTokens.push(tokens[i]);
        }
    }
    return fixedTokens;
}

// ============================================================
// PARADIGM 1: PROCEDURAL
// ============================================================
function evaluateProcedural(tokens) {
    let res = parseFloat(tokens[0]);
    for (let i = 1; i < tokens.length; i += 2) {
        let op = tokens[i], next = parseFloat(tokens[i+1]);
        if ((op === '/' || op === '%') && next === 0) throw new Error("DivZero");
        if (op === '+') res += next;
        else if (op === '-') res -= next;
        else if (op === '*') res *= next;
        else if (op === '/') res /= next;
        else if (op === '%') res %= next;
    }
    return res;
}

function convertProcedural(type, val) {
    if (type === 'length') return (val * 3.28084).toFixed(2) + " ft";
    if (type === 'temp') return ((val * 1.8) + 32).toFixed(2) + " °F";
    if (type === 'weight') return (val * 2.20462).toFixed(2) + " lbs";
}

// ============================================================
// PARADIGM 2: OBJECT-ORIENTED (OOP)
// ============================================================
class SmartCalculator {
    calculate(tokens) {
        let res = parseFloat(tokens[0]);
        for (let i = 1; i < tokens.length; i += 2) {
            let op = tokens[i], next = parseFloat(tokens[i+1]);
            if ((op === '/' || op === '%') && next === 0) throw new Error("DivZero");
            switch(op) {
                case '+': res += next; break;
                case '-': res -= next; break;
                case '*': res *= next; break;
                case '/': res /= next; break;
                case '%': res %= next; break;
            }
        }
        return res;
    }

    convert(type, val) {
        const units = {
            length: { rate: 3.28084, label: " ft" },
            temp: { rate: 1.8, offset: 32, label: " °F" },
            weight: { rate: 2.20462, label: " lbs" }
        };
        const config = units[type];
        let res = (val * config.rate) + (config.offset || 0);
        return res.toFixed(2) + config.label;
    }
}

// ============================================================
// PARADIGM 3: FUNCTIONAL
// ============================================================
const functionalOps = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => b === 0 ? (() => { throw new Error("DivZero") })() : a / b,
    '%': (a, b) => b === 0 ? (() => { throw new Error("DivZero") })() : a % b
};

const evaluateFunctional = (tokens) => 
    tokens.reduce((acc, curr, idx) => {
        if (idx === 0) return parseFloat(curr);
        if (idx % 2 !== 0) return acc; 
        return functionalOps[tokens[idx - 1]](acc, parseFloat(curr));
    }, 0);

const convertFunctional = (type, val) => {
    const formulaMap = {
        length: v => v * 3.28084,
        temp: v => (v * 1.8) + 32,
        weight: v => v * 2.20462
    };
    const labels = { length: " ft", temp: " °F", weight: " lbs" };
    return formulaMap[type](val).toFixed(2) + labels[type];
};

// ============================================================
// PARADIGM 4: EVENT-DRIVEN 
// ============================================================

document.getElementById('calc-tab-btn').addEventListener('click', () => switchTab('calc-tab'));
document.getElementById('convert-tab-btn').addEventListener('click', () => switchTab('convert-tab'));

document.querySelectorAll('#numpad button').forEach(button => {
    button.addEventListener('click', () => {
        const text = button.innerText;
        if (button.classList.contains('btn-delete')) {
            deleteLast();
        } else if (button.classList.contains('btn-ans')) {
            copyResult();
        } else {
            const value = text.replace('÷', '/').replace('×', '*').replace('−', '-');
            appendValue(value);
        }
    });
});

document.querySelector('.btn-clear').addEventListener('click', clearUI);
document.querySelector('.btn-equal').addEventListener('click', handleMainAction);

document.querySelector('.btn-history-clear').addEventListener('click', clearHistory);

document.getElementById('convertType').addEventListener('change', runConversion);

document.addEventListener('keydown', (event) => {
    const key = event.key;
    const operators = ['+', '-', '*', '/', '.', '%', '(', ')'];
    if (!isNaN(key) || operators.includes(key)) appendValue(key);
    else if (key === 'Enter') handleMainAction();
    else if (key === 'Backspace') deleteLast();
    else if (key === 'Escape') clearUI();
});


// --- CORE ACTION HANDLER ---
function handleMainAction() {
    if (activeTab === 'convert-tab') {
        runConversion();
        return;
    }

    const input = document.getElementById('expressionInput');
    const display = document.getElementById('resultDisplay');
    const mode = document.getElementById('paradigmChoice').value;
    
    display.classList.remove('error-state', 'success-state');

    try {
        if (!input.value || !/^[0-9+\-*/.%()]+$/.test(input.value)) throw new Error("Invalid");
        
        let result;
        if (input.value.includes('(')) {
            result = Function(`"use strict"; return (${input.value})`)();
        } else {
            const tokens = parseTokens(input.value);
            if (mode === 'procedural') result = evaluateProcedural(tokens);
            else if (mode === 'oop') result = new SmartCalculator().calculate(tokens);
            else result = evaluateFunctional(tokens);
        }

        if (isNaN(result) || !isFinite(result)) throw new Error("MathError");

        display.innerText = `Result: ${result}`;
        display.classList.add('success-state');
        addToHistory(`${input.value} = ${result}`);
        input.value = '';
    } catch (e) {
        let errorMsg = "Error";
        if (e.message === "DivZero") errorMsg = "Cannot be divided by 0!";
        if (e.message === "MathError") errorMsg = "Invalid Math";
        triggerError(errorMsg);
    }
}

// --- CONVERTER LOGIC ---
function runConversion() {
    const type = document.getElementById('convertType').value;
    const val = parseFloat(document.getElementById('convertInput').value);
    const mode = document.getElementById('paradigmChoice').value; 
    const display = document.getElementById('resultDisplay');
    
    if (isNaN(val)) { 
        triggerError("Invalid Input"); 
        return; 
    }

    let res;
    if (mode === 'procedural') res = convertProcedural(type, val);
    else if (mode === 'oop') res = new SmartCalculator().convert(type, val);
    else res = convertFunctional(type, val);

    display.innerText = `Result: ${res}`;
    display.classList.remove('error-state');
    display.classList.add('success-state');
    
    const typeLabels = { length: "m to ft", temp: "°C to °F", weight: "kg to lb" };
    addToHistory(`${val} (${typeLabels[type]}) = ${res}`);
}

// --- UI HELPERS ---
function triggerError(msg) {
    const display = document.getElementById('resultDisplay');
    display.innerText = `Result: ${msg}`;
    display.classList.remove('success-state', 'error-state');
    void display.offsetWidth; 
    display.classList.add('error-state');
}

function appendValue(v) {
    const id = activeTab === 'calc-tab' ? 'expressionInput' : 'convertInput';
    const input = document.getElementById(id);
    if (v === '.' && input.value.includes('.')) return;
    input.value += v;
}

function clearUI() {
    document.getElementById('expressionInput').value = '';
    document.getElementById('convertInput').value = '';
    const display = document.getElementById('resultDisplay');
    display.innerText = 'Result: --';
    display.classList.remove('error-state', 'success-state');
}

function deleteLast() {
    const id = activeTab === 'calc-tab' ? 'expressionInput' : 'convertInput';
    const el = document.getElementById(id);
    el.value = el.value.slice(0, -1);
}

// --- HISTORY & STORAGE ---
function addToHistory(entry) {
    const li = document.createElement('li');
    li.innerText = entry;
    document.getElementById('historyList').prepend(li);
    
    const savedHistory = JSON.parse(localStorage.getItem('calcHistory')) || [];
    savedHistory.unshift(entry);
    localStorage.setItem('calcHistory', JSON.stringify(savedHistory.slice(0, 50))); 
}

function clearHistory() { 
    document.getElementById('historyList').innerHTML = ''; 
    localStorage.removeItem('calcHistory');
}

function copyResult() {
    const res = document.getElementById('resultDisplay').innerText.replace('Result: ', '');
    if (!res.includes('--') && !res.includes('Error')) {
        appendValue(parseFloat(res));
    }
}
