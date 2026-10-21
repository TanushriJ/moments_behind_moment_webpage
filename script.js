'use strict';

(() => {
  // Same Google Apps Script destination used by the original waitlist page.
  const SIGNUP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxuOnVVExywvc3Sl5enVZxZkv3QHW3LzKKU9rLxTxkuUpPuD6LUuMNJkonee0A-7zQG/exec';
  const euro = new Intl.NumberFormat('en-IE', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  });
  const money = (value) => euro.format(value);
  const examples = [
    { month: 'June', income: 3200, spending: 2240, story: 'A little more breathing room.', note: 'Everyday spending left €960 available for savings and plans.' },
    { month: 'July', income: 3200, spending: 2410, story: 'A summer with a few extras.', note: 'A few more days out brought spending to €2,410. There was still €790 left over.' },
    { month: 'August', income: 3200, spending: 2290, story: 'Back to a familiar rhythm.', note: 'Spending settled at €2,290, leaving €910 for whatever comes next.' },
    { month: 'September', income: 3200, spending: 2520, story: 'A busier start to the season.', note: 'Spending rose to €2,520. Looking at the transactions gives the change some context.' },
    { month: 'October', income: 3200, spending: 2350, story: 'Small changes, a little more space.', note: 'Spending eased back to €2,350, leaving €850 available.' },
    { month: 'November', income: 3200, spending: 2860, story: 'A new home. A different kind of month.', note: 'Shopping rose with purchases for a move. A life change, with context—not just a spending spike.' },
  ];

  const figure = document.querySelector('.heroFigure');
  const spendingChart = figure.querySelector('svg.chart');
  const monthGroups = Array.from(spendingChart.querySelectorAll('g')).slice(-6);
  const monthButtons = Array.from(document.querySelectorAll('.monthPicker button'));
  monthButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      const example = examples[index];
      monthButtons.forEach((other, i) => other.setAttribute('aria-pressed', String(i === index)));
      monthGroups.forEach((group, i) => {
        group.setAttribute('opacity', i === index ? '1' : '0.55');
        group.querySelector('.chartHighlight')?.remove();
        if (i === index) {
          const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          Object.entries({ x: 57 + i * 76, y: 13, width: 65, height: 188, rx: 7, class: 'chartHighlight' })
            .forEach(([key, value]) => highlight.setAttribute(key, String(value)));
          group.prepend(highlight);
        }
      });
      figure.querySelector('.monthLabel').textContent = `${example.month.toUpperCase()} / THE BIGGER PICTURE`;
      figure.querySelector('.figureTitle h2').textContent = index === 5 ? 'A month of making space.' : example.story;
      const metrics = figure.querySelectorAll('.metrics strong');
      [example.income, example.spending, example.income - example.spending]
        .forEach((value, i) => { metrics[i].textContent = money(value); });
      figure.querySelector('.storyNote strong').textContent = example.story;
      figure.querySelector('.storyNote p').textContent = example.note;
      spendingChart.querySelector('desc').textContent = `Fictional income and spending from June to November. ${example.month} is highlighted: income ${money(example.income)}, spending ${money(example.spending)}, left over ${money(example.income - example.spending)}. Full figures are available in the chart data table.`;
    });
  });

  const slider = document.getElementById('welcome-contribution');
  const savingsCard = document.querySelector('.savingsCard');
  const savingsChart = savingsCard.querySelector('svg.chart');
  function updateSavings() {
    const contribution = Number(slider.value);
    const y = (amount) => 190 - amount / 3000 * 160;
    const points = Array.from({ length: 7 }, (_, month) => `${52 + month * 65},${y(300 + contribution * month)}`).join(' ');
    savingsChart.querySelector('.savingsLine').setAttribute('points', points);
    savingsChart.querySelector('.savingsArea').setAttribute('points', `52,190 ${points} 442,190`);
    savingsChart.querySelectorAll('.savingsPoint').forEach((point, month) => {
      point.setAttribute('cy', String(y(300 + contribution * month)));
    });
    savingsChart.querySelector('title').textContent = `Example savings over six months at ${money(contribution)} per month`;
    savingsChart.querySelector('desc').textContent = `Starting with €300, saving ${money(contribution)} per month gives ${money(300 + contribution * 6)} after six months. The comparison saves €150 per month. The target is €1,800. No interest or withdrawals assumed.`;
    savingsCard.querySelector('output').textContent = money(contribution);
    const result = savingsCard.querySelector('.savingsResult');
    const checkmark = result.querySelector('svg');
    result.replaceChildren(checkmark, document.createTextNode(`${Math.ceil(1500 / contribution)} months to your example goal`));
  }
  slider.addEventListener('input', updateSavings);
  slider.addEventListener('change', updateSavings);
  updateSavings();

  const privacyButtons = Array.from(document.querySelectorAll('.privacySwitch button'));
  const privacyData = document.querySelector('.privacyData');
  const privacyValues = privacyData.querySelectorAll('dd');
  privacyButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      const protectedView = index === 1;
      privacyButtons.forEach((other, i) => other.setAttribute('aria-pressed', String(i === index)));
      const heading = privacyData.querySelector('.dataHeader');
      const badge = heading.querySelector('span');
      heading.replaceChildren(document.createTextNode(protectedView ? 'TRANSFORMED CHAT DATA' : 'YOUR ORIGINAL DETAILS'), badge);
      const values = protectedView
        ? ['IBAN..6789', 'Merchant_1', '€160.00']
        : ['NL00 DEMO 0123 4567 89', 'Example Wellness Studio', '€80.00'];
      values.forEach((value, i) => { privacyValues[i].textContent = value; });
      privacyData.querySelector('.dataFootnote').textContent = protectedView
        ? 'Account masked · merchant aliased · amount scaled'
        : 'Your original view · fictional data only';
    });
  });

  const form = document.getElementById('waitlist-form');
  const nameInput = document.getElementById('name-input');
  const emailInput = document.getElementById('email-input');
  const nameMessage = document.getElementById('name-message');
  const emailMessage = document.getElementById('email-message');
  const status = document.getElementById('signup-status');
  const submit = form.querySelector('button[type="submit"]');
  let sending = false;
  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  function validation(input, message, invalid) {
    input.setAttribute('aria-invalid', String(invalid));
    message.hidden = !invalid;
  }
  nameInput.addEventListener('input', () => validation(nameInput, nameMessage, !nameInput.value.trim()));
  emailInput.addEventListener('input', () => validation(emailInput, emailMessage, !isValidEmail(emailInput.value.trim())));
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const invalidName = !name;
    const invalidEmail = !isValidEmail(email) || !emailInput.validity.valid;
    validation(nameInput, nameMessage, invalidName);
    validation(emailInput, emailMessage, invalidEmail);
    status.textContent = '';
    delete status.dataset.state;
    if (invalidName || invalidEmail) {
      (invalidName ? nameInput : emailInput).focus();
      return;
    }
    sending = true;
    submit.disabled = true;
    submit.textContent = 'Sending your request…';
    form.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch(SIGNUP_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ name, email }),
      });
      if (response.type !== 'opaque' && !response.ok) throw new Error('Signup request failed');
      // no-cors responses cannot confirm whether the service stored a signup.
      status.textContent = 'Your signup request was sent. Thank you for your interest in MBM.';
      form.reset();
    } catch {
      status.dataset.state = 'error';
      status.textContent = 'We couldn’t send your request. Please try again in a moment.';
    } finally {
      sending = false;
      submit.disabled = false;
      submit.textContent = 'Join the waitlist →';
      form.removeAttribute('aria-busy');
    }
  });
})();
