let lastResult = 0;
let memory = 0;
let justCalculated = false;

// --- TAB SYSTEM ---
function switchTab(id) {
    document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.currentTarget.classList.add('active');
}

// --- PARSER ---
function parseTokens(expr) {
    let t = expr.split(/(\*\*|[+\-*/%]|sqrt|abs)/).map(s => s.trim()).filter(s => s !== "");
    if (t[0] === "-") t = ["-" + t[1], ...t.slice(2)];
    return t;
}

// --- PARADIGM 1: PROCEDURAL ---
function evaluateProcedural(expr) {
    const tokens = parseTokens(expr);
    let i = 0;
    const getVal = () => {
        let t = tokens[i++];
        if (t === 'sqrt') return Math.sqrt(parseFloat(tokens[i++]));
        if (t === 'abs') return Math.abs(parseFloat(tokens[i++]));
        return parseFloat(t);
    };
    let res = getVal();
    while (i < tokens.length) {
        let op = tokens[i++], v = getVal();
        if (op === '+') res += v;
        else if (op === '-') res -= v;
        else if (op === '*') res *= v;
        else if (op === '/') {
            if (v === 0) throw new Error();
            res /= v;
        }
        else if (op === '%') {
            if (v === 0) throw new Error();
            res %= v;
        }
        else if (op === '**') res = Math.pow(res, v);
    }
    return res;
}

// --- PARADIGM 2: OOP ---
class SmartCalculator {
    calculate(expr) {
        this.tokens = parseTokens(expr);
        this.ptr = 0;
        let res = this.next();
        while (this.ptr < this.tokens.length) {
            let op = this.tokens[this.ptr++], v = this.next();
            res = this.apply(op, res, v);
        }
        return res;
    }
    next() {
        let t = this.tokens[this.ptr++];
        if (t === 'sqrt') return Math.sqrt(parseFloat(this.tokens[this.ptr++]));
        if (t === 'abs') return Math.abs(parseFloat(this.tokens[this.ptr++]));
        return parseFloat(t);
    }
    apply(op, a, b) {
        if ((op === '/' || op === '%') && b === 0) throw new Error();
        const m = { '+': a+b, '-': a-b, '*': a*b, '/': a/b, '%': a%b, '**': Math.pow(a,b) };
        return m[op];
    }
}

// --- PARADIGM 3: FUNCTIONAL ---
function evaluateFunctional(expr) {
    const tokens = parseTokens(expr);
    const pre = [];
    for(let i=0; i<tokens.length; i++) {
        if(tokens[i]==='sqrt') pre.push(Math.sqrt(parseFloat(tokens[++i])));
        else if(tokens[i]==='abs') pre.push(Math.abs(parseFloat(tokens[++i])));
        else pre.push(tokens[i]);
    }
    const ops = { 
        '+':(a,b)=>a+b, '-':(a,b)=>a-b, '*':(a,b)=>a*b, 
        '/':(a,b)=> { if(b===0) throw new Error(); return a/b; },
        '%':(a,b)=> { if(b===0) throw new Error(); return a%b; },
        '**':(a,b)=>Math.pow(a,b) 
    };
    return pre.slice(1).reduce((acc, val, idx, arr) => {
        if (idx % 2 === 0) return acc;
        return ops[val](acc, parseFloat(arr[idx+1]));
    }, parseFloat(pre[0]));
}

// --- CONVERTER LOGIC ---
const convLib = {
    km_m: v => v * 1000, m_ft: v => v * 3.2808,
    kg_lb: v => v * 2.2046, c_f: v => (v * 9/5) + 32
};
function appendConv(v) { document.getElementById('convertInput').value += v; }
function clearConv() { 
    document.getElementById('convertInput').value = ""; 
    document.getElementById('converterResult').innerText = "Result: --";
}
function runConversion() {
    const v = parseFloat(document.getElementById('convertInput').value);
    const type = document.getElementById('convertType').value;
    if (isNaN(v)) return;
    document.getElementById('converterResult').innerText = `Result: ${convLib[type](v).toFixed(2)}`;
    document.getElementById('converterResult').className = "result success-state";
}

// --- UI HELPERS ---
function appendValue(v) {
    const input = document.getElementById('expressionInput');
    if (justCalculated && !isNaN(v)) input.value = v;
    else input.value += v;
    justCalculated = false;
}

function handleAction() {
    const inputField = document.getElementById('expressionInput');
    const expr = inputField.value;
    const mode = document.getElementById('paradigmChoice').value;
    const disp = document.getElementById('resultDisplay');
    if (!expr) return;
    try {
        let res;
        if (expr.includes('(')) {
            const processed = expr.replace(/sqrt/g, 'Math.sqrt').replace(/abs/g, 'Math.abs');
            res = Function(`"use strict"; return (${processed})`)();
        } else {
            if (mode === 'procedural') res = evaluateProcedural(expr);
            else if (mode === 'oop') res = new SmartCalculator().calculate(expr);
            else res = evaluateFunctional(expr);
        }
        if (!isFinite(res)) throw new Error();
        disp.innerText = `Result: ${res}`;
        disp.className = "result success-state";
        addToHistory(expr, res);
        lastResult = res; justCalculated = true;
        inputField.value = "";
    } catch { 
        disp.innerText = "Result: Error"; 
        disp.className = "result error-state"; 
    }
}

function memoryAction(t) {
    let v = parseFloat(document.getElementById('expressionInput').value) || lastResult;
    if (t === 'M+') memory += v;
    else if (t === 'MR') appendValue(memory);
}

function deleteLast() { document.getElementById('expressionInput').value = document.getElementById('expressionInput').value.slice(0,-1); }
function clearCalculator() { 
    document.getElementById('expressionInput').value = ""; 
    document.getElementById('resultDisplay').innerText = "Result: --";
    document.getElementById('resultDisplay').className = "result";
}
function addToHistory(e, r) {
    const li = document.createElement('li');
    li.innerText = `${e} = ${r}`;
    document.getElementById('historyList').prepend(li);
}
function clearHistory() { document.getElementById('historyList').innerHTML = ""; }