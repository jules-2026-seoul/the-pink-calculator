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
  let isEditing = false;

  // Setup long press for inline customization
  btn.addEventListener('pointerdown', (e) => {
    if (isEditing) return;
    pressTimer = setTimeout(() => {
      isEditing = true;
      const currentTip = btn.dataset.tip;
      const input = document.createElement('input');
      input.type = 'number';
      input.value = currentTip;
      input.style.width = '100%';
      input.style.height = '100%';
      input.style.background = 'transparent';
      input.style.border = 'none';
      input.style.color = 'inherit';
      input.style.font = 'inherit';
      input.style.textAlign = 'center';
      input.style.outline = 'none';

      btn.textContent = '';
      btn.appendChild(input);
      input.focus();
      input.select();

      const saveVal = () => {
        const newTip = input.value;
        if (newTip !== null && !isNaN(newTip) && newTip.trim() !== '') {
          const validTip = parseFloat(newTip);
          btn.dataset.tip = validTip;
          btn.textContent = `${validTip}%`;
          localStorage.setItem(key, validTip);
          calculateTip(validTip);
        } else {
          btn.textContent = `${btn.dataset.tip}%`;
        }
        // Small timeout to prevent immediate pointerup click handling
        setTimeout(() => { isEditing = false; }, 100);
      };

      input.addEventListener('blur', saveVal);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          saveVal();
        }
      });
    }, 600);
  });

  const cancelTimer = () => {
    if (pressTimer) clearTimeout(pressTimer);
  };

  btn.addEventListener('pointerup', (e) => {
    cancelTimer();
    if (!isEditing) {
      calculateTip(parseFloat(btn.dataset.tip));
    }
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
