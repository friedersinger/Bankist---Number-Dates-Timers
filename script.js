'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-08-24T17:01:17.194Z',
    '2022-08-25T19:36:17.929Z',
    '2022-08-26T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  // console.log(daysPassed);

  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // old way without INTERNATIONAL
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: `currency`,
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formatedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  // labelSumOut.textContent = `${Math.abs(out.toFixed(2))}€`;
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // IN each call, print the remainig time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Login to get started`;
      containerApp.style.opacity = 0;
    }

    // Decrese 1s
    time--;
  };
  // Set time to 5 minutes (in sec)
  let time = 30;
  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  // to clear the timer, we need the timer varible
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // creat current date and time
    const now = new Date();
    const options = {
      hour: `numeric`,
      minute: `numeric`,
      day: `numeric`,
      // numeric: 8, long: August, 2-digit: 08
      month: `numeric`,
      year: `numeric`,
      // short, long ...
      // weekday: `long`,
    };
    // takes the language from the browser
    // const locale = navigator.language;
    // console.log(locale);

    // en-US, en-GB, ar-SY -> Google ISO language code Table -> lingoes.net
    // labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(
    //   now
    // );

    // takes the language from the account that is logged in
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // The `old` way to get the date formated
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // ADD LOAN DATE
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// Converting and Checking Numbers

/*
console.log(23 === 23.0);

// Base 10 - 0 to 9. 1/10 = 0.1. 3/10 = 3.333333333
// Binary base 2 - 0 1
console.log(0.1 + 0.2);
// it's true but in JS not!!! It's an error
console.log(0.1 + 0.2 === 0.3);

// Conversion
console.log(Number(`23`));
console.log(+`23`);

// Parsing - has to start with a number
// getting rid of everthing expect numbers
// working with base - thats why it's a 10
console.log(Number.parseInt(`30px`, 10));
// NaN
console.log(Number.parseInt(`e23`, 10));

console.log(Number.parseInt(`   2.5rem`));
// reading a number out of a string / from CSS
console.log(Number.parseFloat(`2.5rem`));

// console.log(parseFloat(`2.5rem`));

// Check if value is NaN (not a number)
console.log(Number.isNaN(20));
console.log(Number.isNaN(`20`));
console.log(Number.isNaN(+`20X`));
// will crash the code because infinite
// console.log(Number.isNaN((23/0));

// Checking if value is number
// best way to check
console.log(Number.isFinite(20));
console.log(Number.isFinite(`20`));
console.log(Number.isFinite(+`20`));
console.log(Number.isFinite(23 / 0));

console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));
console.log(Number.isInteger(23 / 0));
*/

/////////////////////////////////////////////////
// Math and Rounding
/*
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

console.log(Math.max(5, 18, 11, 2));
console.log(Math.max(5, 18, `23`, 11, 2));
console.log(Math.max(5, 18, `23px`, 11, 2));

console.log(Math.min(5, 18, `23px`, 11, 2));

console.log(Math.PI * Number.parseFloat(`10`) ** 2);

console.log(Math.trunc(Math.random() * 6) + 1);

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
// 0...1 -> 0...(max - min) -> min...max
console.log(randomInt(10, 20));

// Rounding intergers
console.log(Math.trunc(23.3));

console.log(Math.round(23.3));
console.log(Math.round(23.9));

console.log(Math.ceil(23.3));
console.log(Math.ceil(23.9));

console.log(Math.floor(23.3));
console.log(Math.floor(`23.9`));

console.log(Math.trunc(23.3));

console.log(Math.trunc(-23.3));
// floor works better in all situations
console.log(Math.floor(-23.3));

// Rounding decimals
// to fix always returns a string
// toFix will add decimal with 2 or whatever is inside the () decimal
console.log((2.7).toFixed(0));
console.log((2.7).toFixed(3));
console.log((2.345).toFixed(2));
// + converts a string to a number
console.log(+(2.345).toFixed(2));
*/

/////////////////////////////////////////////////
// The Remainder Operator
/*
console.log(5 % 2);
console.log(5 / 2); // 5 = 2 * 2 +1

console.log(8 % 3);
console.log(8 / 3); // 8 = 2 * 3 + 2

console.log(6 % 2);
console.log(6 / 2);

console.log(7 % 2);
console.log(7 / 2);

const isEven = n => n % 2 === 0;
console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(514));

labelBalance.addEventListener(`click`, function () {
  // creating a new array and spread operator to impliment the forEach method
  [...document.querySelectorAll(`.movements__row`)].forEach(function (row, i) {
    // 0, 2, 4, 6
    if (i % 2 === 0) row.style.backgroundColor = `orangered`;
    // 0, 3, 4, 6 ,9
    if (i % 3 === 0) row.style.backgroundColor = `blue`;
  });
});
*/

/////////////////////////////////////////////////
// Numeric Separators
/*
// 287,460,000,000
const diameter = 287_460_000_000;
// without separators in Console
console.log(diameter);

const priceCents = 345_99;
console.log(priceCents);

const transferFee1 = 15_00;
const transferFee2 = 1_500;

const PI = 3.14_15;
console.log(PI);

// Doesn't work like that in a string
console.log(Number(`230_000`));
// only 230
console.log(parseInt(`230_000`));
*/

/////////////////////////////////////////////////
// Working with BigInt
/*
console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 1);
console.log(2 ** 53 + 2);
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);

// with the n it's a BigInts
console.log(9123859819345018409581904859013124n);
// only with smaller numbers
console.log(BigInt(9123859819345018409581904859013124));

// OPERATIONS
console.log(10000n + 10000n);
console.log(17458975038917893275891374847n * 8132754823745897312894738947n);
// console.log(Math.sqrt(16n)); // do NOT work

const huge = 498570821743895713489571985n;
const num = 23;
console.log(huge * BigInt(num));

// Exeptions
console.log(20n > 15); // true
console.log(20n === 20); // false
console.log(typeof 20n); // BigInt
console.log(20n == 20); // true
console.log(20n == `20`); // true

console.log(huge + ` is REALLY big!!!`);

// Divisions
console.log(10n / 3n);
console.log(11n / 3n);
console.log(12n / 3n);
console.log(10 / 3);
*/

/////////////////////////////////////////////////
// Creating Dates

// Create a Date
/*
const now = new Date();
console.log(now);

console.log(new Date(`Aug 27 2022 08:29:22`));
console.log(new Date(`December 24, 2015`));
console.log(new Date(account1.movementsDates[0]));

// Month is 0 based
console.log(new Date(2037, 10, 19, 15, 23, 5));
// Will autocorrect to the next day
console.log(new Date(2037, 10, 31));

// Thu Jan 01 1970 01:00:00
console.log(new Date(0));
// 3 Days * 24 hours * 60 min * 60 sec * 1000 millisec = 3 days later
console.log(new Date(3 * 24 * 60 * 60 * 1000));
*/
/*
// Working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
// It's the day of the week
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.getMilliseconds());
console.log(future.toISOString());
// 2142253380000 millisec since Thu Jan 01 1970 01:00:00
console.log(future.getTime());

console.log(new Date(2142253380000));

console.log(Date.now());

future.setFullYear(2040);
console.log(future);
*/

/////////////////////////////////////////////////
// Operations with Dates
/*
const future = new Date(2037, 10, 19, 15, 23);
// converting in millisec
console.log(Number(future));
console.log(+future);

// Millisec in Days = (1000 * 60 * 60 * 24)
const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

const days1 = calcDaysPassed(new Date(2037, 3, 4), new Date(2037, 3, 14));
console.log(days1);
*/

/////////////////////////////////////////////////
// Internationalizing Numbers (Intl)
/*
const num = 32480384.23;

// Check out mdn
const options = {
  // percentes, currency (plus currrency)
  style: `currency`,
  // celsius, miles-per-hour (will be ignored with currency)
  unit: `mile-per-hour`,
  currency: `EUR`,
  // useGrouping: false,
};

console.log(`Us: `, new Intl.NumberFormat(`en-Us`, options).format(num));
console.log(`Germany: `, new Intl.NumberFormat(`de-DE`, options).format(num));
console.log(`Syria: `, new Intl.NumberFormat(`ar-SY`, options).format(num));
console.log(
  `Browser (navigator.language): `,
  new Intl.NumberFormat(navigator.language, options).format(num)
);
*/

/////////////////////////////////////////////////
// Timers: setTimeout and setInterval
/*
// setTimeout
const ingredients = [`olives`, `spinach`];
// 3000 millisec = 3 sec
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your Pizza with ${ing1} and ${ing2}!`),
  3000,
  ...ingredients
);
console.log(`Waiting...`);

if (ingredients.includes(`spinach`)) clearTimeout(pizzaTimer);

// SetInterval- every sec a new log
setInterval(function () {
  const now = new Date();
  console.log(now);
}, 1000);
*/
