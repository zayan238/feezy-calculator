const currentEl = document.getElementById('current');
const previousEl = document.getElementById('previous');
const historyList = document.getElementById('historyList');
const historyCount = document.getElementById('historyCount');
const themeSelect = document.getElementById('themeSelect');

let current = '0';
let previous = '';
let operator = null;
let shouldReset = false;
let history = [];

function updateDisplay() {
  currentEl.textContent = current;
  previousEl.textContent = previous;
}
function inputNumber(number) {
  if (current === 'Error' || shouldReset) {
    current = number === '.' ? '0.' : number;
    shouldReset = false;
  } else if (number === '.') {
    if (!current.includes('.')) current += '.';
  } else {
    current = current === '0' ? number : current + number;
  }
  if (current.length > 15) current = current.slice(0, 15);
  updateDisplay();
}
function chooseOperator(nextOperator) {
  if (current === 'Error') return;
  if (operator && !shouldReset) calculate();
  previous = current;
  operator = nextOperator;
  shouldReset = true;
  updateDisplay();
}
function calculate() {
  if (!operator || previous === '') return;
  const a = Number(previous);
  const b = Number(current);
  let result;
  switch (operator) {
    case '+': result = a + b; break;
    case '−': result = a - b; break;
    case '×': result = a * b; break;
    case '÷': result = b === 0 ? NaN : a / b; break;
    default: return;
  }
  const expression = `${formatNumber(a)} ${operator} ${formatNumber(b)}`;
  if (!Number.isFinite(result)) {
    current = 'Error';
  } else {
    current = String(Number(result.toPrecision(12)));
    addHistory(expression, current);
  }
  previous = '';
  operator = null;
  shouldReset = true;
  updateDisplay();
}
function formatNumber(n) {
  return Number(n.toPrecision(10)).toString();
}
function addHistory(expression, result) {
  history.unshift({ expression, result });
  history = history.slice(0, 6);
  renderHistory();
}
function renderHistory() {
  historyCount.textContent = history.length;
  historyList.innerHTML = '';
  if (!history.length) {
    const empty = document.createElement('li');
    empty.className = 'empty-history';
    empty.textContent = 'Your calculation history will appear here.';
    historyList.appendChild(empty);
    return;
  }
  history.forEach(item => {
    const li = document.createElement('li');
    const exp = document.createElement('span');
    const res = document.createElement('span');
    exp.className = 'expression';
    res.className = 'result';
    exp.textContent = item.expression;
    res.textContent = `= ${item.result}`;
    li.append(exp, res);
    historyList.appendChild(li);
  });
}
function clearAll() {
  current = '0'; previous = ''; operator = null; shouldReset = false;
  updateDisplay();
}
function performAction(action) {
  if (action === 'clear') clearAll();
  if (action === 'delete') {
    if (current === 'Error' || shouldReset) { current = '0'; shouldReset = false; }
    else current = current.length > 1 ? current.slice(0, -1) : '0';
    updateDisplay();
  }
  if (action === 'percent' && current !== 'Error') {
    current = String(Number(current) / 100); updateDisplay();
  }
  if (action === 'sign' && current !== 'Error') {
    current = String(Number(current) * -1); updateDisplay();
  }
  if (action === 'equals') calculate();
}

document.querySelector('.keypad').addEventListener('click', event => {
  const key = event.target.closest('button');
  if (!key) return;
  if (key.dataset.value !== undefined) {
    const value = key.dataset.value;
    if (['+', '−', '×', '÷'].includes(value)) chooseOperator(value);
    else inputNumber(value);
  } else if (key.dataset.action) performAction(key.dataset.action);
});

document.addEventListener('keydown', event => {
  if (/^[0-9.]$/.test(event.key)) { inputNumber(event.key); return; }
  const operators = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  if (operators[event.key]) { event.preventDefault(); chooseOperator(operators[event.key]); return; }
  if (event.key === 'Enter' || event.key === '=') { event.preventDefault(); calculate(); }
  if (event.key === 'Backspace') performAction('delete');
  if (event.key === 'Escape') clearAll();
  if (event.key === '%') performAction('percent');
});

themeSelect.addEventListener('change', () => {
  document.body.dataset.theme = themeSelect.value;
});
document.getElementById('clearHistory').addEventListener('click', () => {
  history = []; renderHistory();
});

renderHistory();
updateDisplay();
