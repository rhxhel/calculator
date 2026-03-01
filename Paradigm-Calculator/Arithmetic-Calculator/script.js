let memoryValue = 0;
let activeTab = 'calc-tab';

// --- TAB MANAGEMENT ---
function switchTab(tabId) {
    activeTab = tabId;
    const wrapper = document.getElementById('app-wrapper');
    
    // UI Tab Updates
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

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
}

// ============================================================
// PARADIGM 3: FUNCTIONAL
// ============================================================
function evaluateFunctional(tokens) {
    return tokens.slice(1).reduce((acc, val, idx) => {
        if (idx % 2 === 0) return acc;
        let op = tokens[idx], next = parseFloat(tokens[idx+1]);
        if ((op === '/' || op === '%') && next === 0) throw new Error("DivZero");
        if (op === '+') return acc + next;
        if (op === '-') return acc - next;
        if (op === '*') return acc * next;
        if (op === '/') return acc / next;
        if (op === '%') return acc % next;
    }, parseFloat(tokens[0]));
}

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
        addToHistory(input.value, result);
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
    const display = document.getElementById('resultDisplay');
    
    if (isNaN(val)) { 
        triggerError("Invalid Input"); 
        return; 
    }

    let res;
    if (type === 'length') res = (val * 3.28084).toFixed(2) + " ft";
    else if (type === 'temp') res = ((val * 9/5) + 32).toFixed(2) + " °F";
    else res = (val * 2.20462).toFixed(2) + " lbs";

    display.innerText = `Result: ${res}`;
    display.classList.add('success-state');
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

// --- MEMORY ---
function memoryClear() { memoryValue = 0; }
function memoryRecall() { appendValue(memoryValue); }
function memoryAdd() {
    const res = parseFloat(document.getElementById('resultDisplay').innerText.replace('Result: ', ''));
    if (!isNaN(res)) memoryValue += res;
}
function memorySubtract() {
    const res = parseFloat(document.getElementById('resultDisplay').innerText.replace('Result: ', ''));
    if (!isNaN(res)) memoryValue -= res;
}

// --- HISTORY & UTILS ---
function addToHistory(e, r) {
    const li = document.createElement('li');
    li.innerText = `${e} = ${r}`;
    document.getElementById('historyList').prepend(li);
}

function clearHistory() { document.getElementById('historyList').innerHTML = ''; }

function copyResult() {
    const res = document.getElementById('resultDisplay').innerText.replace('Result: ', '');
    if (!res.includes('--') && !res.includes('Error')) {
        appendValue(parseFloat(res));
    }
}