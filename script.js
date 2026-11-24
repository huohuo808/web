const display = document.querySelector("#display");
const expression = document.querySelector("#expression");
const keypad = document.querySelector(".keypad");

let currentValue = "0";
let storedValue = null;
let pendingOperator = null;
let shouldStartNewValue = false;

const symbols = {
  "+": "+",
  "−": "−",
  "×": "×",
  "÷": "÷",
};

function render() {
  display.textContent = currentValue;
  expression.textContent =
    storedValue !== null && pendingOperator
      ? `${formatNumber(storedValue)} ${pendingOperator}`
      : "";
}

function formatNumber(value) {
  return Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 10,
    useGrouping: false,
  });
}

function enterDigit(digit) {
  if (shouldStartNewValue || currentValue === "0" || currentValue === "错误") {
    currentValue = digit;
    shouldStartNewValue = false;
  } else if (currentValue.replace("-", "").length < 14) {
    currentValue += digit;
  }
}

function enterDecimal() {
  if (shouldStartNewValue || currentValue === "错误") {
    currentValue = "0.";
    shouldStartNewValue = false;
  } else if (!currentValue.includes(".")) {
    currentValue += ".";
  }
}

function calculate(left, operator, right) {
  switch (operator) {
    case "+":
      return left + right;
    case "−":
      return left - right;
    case "×":
      return left * right;
    case "÷":
      return right === 0 ? null : left / right;
    default:
      return right;
  }
}

function enterOperator(operator) {
  const value = Number(currentValue);

  if (storedValue !== null && pendingOperator && !shouldStartNewValue) {
    const result = calculate(storedValue, pendingOperator, value);
    if (result === null || !Number.isFinite(result)) {
      showError();
      return;
    }
    currentValue = formatNumber(result);
    storedValue = result;
  } else {
    storedValue = value;
  }

  pendingOperator = operator;
  shouldStartNewValue = true;
}

function showError() {
  currentValue = "错误";
  storedValue = null;
  pendingOperator = null;
  shouldStartNewValue = true;
}

function enterEquals() {
  if (storedValue === null || !pendingOperator || shouldStartNewValue) return;

  const left = storedValue;
  const right = Number(currentValue);
  const operator = pendingOperator;
  const result = calculate(left, operator, right);

  if (result === null || !Number.isFinite(result)) {
    showError();
    return;
  }

  currentValue = formatNumber(result);
  storedValue = null;
  pendingOperator = null;
  shouldStartNewValue = true;
}

function handleAction(action, value) {
  switch (action) {
    case "digit":
      enterDigit(value);
      break;
    case "decimal":
      enterDecimal();
      break;
    case "operator":
      enterOperator(value);
      break;
    case "equals":
      enterEquals();
      break;
    case "clear":
      currentValue = "0";
      storedValue = null;
      pendingOperator = null;
      shouldStartNewValue = false;
      break;
    case "delete":
      if (!shouldStartNewValue && currentValue !== "错误") {
        currentValue =
          currentValue.length > 1 ? currentValue.slice(0, -1) : "0";
        if (currentValue === "-") currentValue = "0";
      }
      break;
    case "sign":
      if (currentValue !== "0" && currentValue !== "错误") {
        currentValue = currentValue.startsWith("-")
          ? currentValue.slice(1)
          : `-${currentValue}`;
      }
      break;
    default:
      return;
  }

  render();
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  handleAction(button.dataset.action, button.dataset.value);
});

document.addEventListener("keydown", (event) => {
  if (/^\d$/.test(event.key)) {
    handleAction("digit", event.key);
  } else if (event.key === ".") {
    handleAction("decimal");
  } else if (event.key === "+") {
    handleAction("operator", "+");
  } else if (event.key === "-") {
    handleAction("operator", "−");
  } else if (event.key === "*") {
    handleAction("operator", "×");
  } else if (event.key === "/") {
    event.preventDefault();
    handleAction("operator", "÷");
  } else if (event.key === "Enter" || event.key === "=") {
    handleAction("equals");
  } else if (event.key === "Backspace") {
    handleAction("delete");
  } else if (event.key === "Escape") {
    handleAction("clear");
  }
});

render();
