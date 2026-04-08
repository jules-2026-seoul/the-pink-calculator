// Calculator State
let displayValue = '0';
let firstOperand = null;
let waitingForSecondOperand = false;
let operator = null;

const display = document.getElementById('calc-display');

function updateDisplay() {
  display.value = displayValue;
}

// Handle number clicks
const numberButtons = document.querySelectorAll('.btn-num');
numberButtons.forEach(button => {
  button.addEventListener('click', () => {
    const digit = button.textContent;
    if (waitingForSecondOperand) {
      displayValue = digit;
      waitingForSecondOperand = false;
    } else {
      displayValue = displayValue === '0' ? digit : displayValue + digit;
    }
    updateDisplay();
  });
});

// Handle operations
const operators = {
  'btn-op-add': '+',
  'btn-op-sub': '-',
  'btn-op-mul': '*',
  'btn-op-div': '/'
};

Object.entries(operators).forEach(([id, op]) => {
  const button = document.getElementById(id);
  if (button) {
    button.addEventListener('click', () => {
      const inputValue = parseFloat(displayValue);

      if (firstOperand === null) {
        firstOperand = inputValue;
      } else if (operator) {
        const result = performCalculation(operator, firstOperand, inputValue);
        displayValue = String(result);
        firstOperand = result;
        updateDisplay();
      }

      waitingForSecondOperand = true;
      operator = op;
    });
  }
});

// Handle equals
const equalBtn = document.getElementById('btn-op-equal');
if (equalBtn) {
  equalBtn.addEventListener('click', () => {
    if (operator === null || waitingForSecondOperand) return;

    const inputValue = parseFloat(displayValue);
    const result = performCalculation(operator, firstOperand, inputValue);

    displayValue = String(result);
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = true;
    updateDisplay();
  });
}

// Handle clear
const clearBtn = document.getElementById('btn-op-clear');
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    displayValue = '0';
    firstOperand = null;
    waitingForSecondOperand = false;
    operator = null;
    updateDisplay();
  });
}

function performCalculation(op, a, b) {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return b === 0 ? 0 : a / b;
    default:
      return b;
  }
}

// Tip functionality with long press and LocalStorage customization
const tipButtons = document.querySelectorAll('.btn-tip');
const tipAmountValue = document.getElementById('tip-amount-value');

// Load initial tips from LocalStorage or use defaults
tipButtons.forEach((btn, index) => {
  const key = `custom_tip_${index}`;
  const savedTip = localStorage.getItem(key);
  if (savedTip) {
    btn.dataset.tip = savedTip;
    btn.textContent = `${savedTip}%`;
  } else {
    const defaultVal = btn.dataset.default;
    btn.dataset.tip = defaultVal;
    btn.textContent = `${defaultVal}%`;
  }

  let pressTimer;

  // Setup long press for customization
  btn.addEventListener('pointerdown', (e) => {
    pressTimer = setTimeout(() => {
      const newTip = prompt('Enter new tip percentage:', btn.dataset.tip);
      if (newTip !== null && !isNaN(newTip) && newTip.trim() !== '') {
        const validTip = parseFloat(newTip);
        btn.dataset.tip = validTip;
        btn.textContent = `${validTip}%`;
        localStorage.setItem(key, validTip);
        calculateTip(validTip);
      }
    }, 600);
  });

  const cancelTimer = () => {
    if (pressTimer) clearTimeout(pressTimer);
  };

  btn.addEventListener('pointerup', (e) => {
    cancelTimer();
    // Only trigger normal click if it wasn't a long press
    calculateTip(parseFloat(btn.dataset.tip));
  });
  btn.addEventListener('pointerleave', cancelTimer);
});

function calculateTip(percentage) {
  const currentVal = parseFloat(displayValue);
  if (!isNaN(currentVal)) {
    const tip = (currentVal * percentage) / 100;
    tipAmountValue.textContent = `$${tip.toFixed(2)}`;
  }
}
