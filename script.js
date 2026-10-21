'use strict';

(() => {
  // Google Apps Script waitlist destination
  const SIGNUP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxuOnVVExywvc3Sl5enVZxZkv3QHW3LzKKU9rLxTxkuUpPuD6LUuMNJkonee0A-7zQG/exec';

  const euro = new Intl.NumberFormat('en-IE', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  });
  const money = (value) => euro.format(value);
  const isReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════════════════════════════════════════
     1. HERO MONTH PICKER & FIGURE
     ═══════════════════════════════════════════ */
  const examples = [
    { month: 'June', income: 3200, spending: 2240, story: 'A little more breathing room.', note: 'Everyday spending left €960 available for savings and plans.' },
    { month: 'July', income: 3200, spending: 2410, story: 'A summer with a few extras.', note: 'A few more days out brought spending to €2,410. There was still €790 left over.' },
    { month: 'August', income: 3200, spending: 2290, story: 'Back to a familiar rhythm.', note: 'Spending settled at €2,290, leaving €910 for whatever comes next.' },
    { month: 'September', income: 3200, spending: 2520, story: 'A busier start to the season.', note: 'Spending rose to €2,520. Looking at the transactions gives the change some context.' },
    { month: 'October', income: 3200, spending: 2350, story: 'Small changes, a little more space.', note: 'Spending eased back to €2,350, leaving €850 available.' },
    { month: 'November', income: 3200, spending: 2860, story: 'A new home. A different kind of month.', note: 'Shopping rose with purchases for a move. A life change, with context—not just a spending spike.' },
  ];

  const figure = document.querySelector('.heroFigure');
  if (figure) {
    const spendingChart = figure.querySelector('svg.chart');
    const monthGroups = spendingChart ? Array.from(spendingChart.querySelectorAll('g')).slice(-6) : [];
    const monthButtons = Array.from(figure.querySelectorAll('.monthPicker button'));

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
        const monthLabel = figure.querySelector('.monthLabel');
        if (monthLabel) monthLabel.textContent = `${example.month.toUpperCase()} / THE BIGGER PICTURE`;
        const titleEl = figure.querySelector('.figureTitle h2');
        if (titleEl) titleEl.textContent = index === 5 ? 'A month of making space.' : example.story;
        const metrics = figure.querySelectorAll('.metrics strong');
        if (metrics.length >= 3) {
          [example.income, example.spending, example.income - example.spending]
            .forEach((value, i) => { metrics[i].textContent = money(value); });
        }
        const noteStrong = figure.querySelector('.storyNote strong');
        if (noteStrong) noteStrong.textContent = example.story;
        const noteP = figure.querySelector('.storyNote p');
        if (noteP) noteP.textContent = example.note;
        const desc = spendingChart?.querySelector('desc');
        if (desc) {
          desc.textContent = `Fictional income and spending from June to November. ${example.month} is highlighted: income ${money(example.income)}, spending ${money(example.spending)}, left over ${money(example.income - example.spending)}. Full figures are available in the chart data table.`;
        }
      });
    });
  }

  /* ═══════════════════════════════════════════
     2. SAVINGS SCENARIO SLIDER
     ═══════════════════════════════════════════ */
  const slider = document.getElementById('welcome-contribution');
  const savingsCard = document.querySelector('.savingsCard');
  if (slider && savingsCard) {
    const savingsChart = savingsCard.querySelector('svg.chart');
    function updateSavings() {
      const contribution = Number(slider.value);
      const y = (amount) => 190 - (amount / 3000) * 160;
      const points = Array.from({ length: 7 }, (_, month) => `${52 + month * 65},${y(300 + contribution * month)}`).join(' ');
      const line = savingsChart?.querySelector('.savingsLine');
      const area = savingsChart?.querySelector('.savingsArea');
      if (line) line.setAttribute('points', points);
      if (area) area.setAttribute('points', `52,190 ${points} 442,190`);
      savingsChart?.querySelectorAll('.savingsPoint').forEach((point, month) => {
        point.setAttribute('cy', String(y(300 + contribution * month)));
      });
      const title = savingsChart?.querySelector('title');
      if (title) title.textContent = `Example savings over six months at ${money(contribution)} per month`;
      const desc = savingsChart?.querySelector('desc');
      if (desc) desc.textContent = `Starting with €300, saving ${money(contribution)} per month gives ${money(300 + contribution * 6)} after six months. The comparison saves €150 per month. The target is €1,800. No interest or withdrawals assumed.`;
      const out = savingsCard.querySelector('output');
      if (out) out.textContent = money(contribution);
      const result = savingsCard.querySelector('.savingsResult');
      if (result) {
        const checkmark = result.querySelector('svg');
        const months = Math.ceil(1500 / contribution);
        result.replaceChildren(checkmark ? checkmark.cloneNode(true) : '', document.createTextNode(`${months} months to your example goal`));
      }
    }
    slider.addEventListener('input', updateSavings);
    slider.addEventListener('change', updateSavings);
    updateSavings();
  }

  /* ═══════════════════════════════════════════
     3. SCROLL REVEALS
     ═══════════════════════════════════════════ */
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('visible'));
  }

  /* ═══════════════════════════════════════════
     4. INTERACTIVE CHAT DEMO (Auto-play on scroll)
     ═══════════════════════════════════════════ */
  const chatMockup = document.querySelector('.chatMockup');
  const userMsgEl = document.getElementById('demo-user-msg');
  const loadingEl = document.getElementById('demo-loading');
  const aiResponseEl = document.getElementById('demo-ai-response');
  const aiTextEl = document.getElementById('demo-ai-text');
  const demoChartEl = document.getElementById('demo-chart');
  const demoSuggestionsEl = document.getElementById('demo-suggestions');
  const sessionItems = Array.from(document.querySelectorAll('.chatMockSession'));
  const newChatBtn = document.querySelector('.chatMockNewBtn');

  // Grounded demo scenarios matching actual chat queries
  const scenarios = [
    {
      title: 'October spending',
      meta: 'Answers grounded in your transaction data',
      userQuestion: 'How much did I spend on food vs transport last month?',
      aiParagraphs: [
        'In October, you spent <strong>€342</strong> on Food & Groceries and <strong>€127</strong> on Transport & Travel.',
        'Food was your largest expense category, representing about <strong>2.7×</strong> your transport costs.'
      ],
      chartTitle: 'Food vs Transport — October',
      bars: [
        { label: 'Food & Groceries', width: 82, value: '€342', alt: false },
        { label: 'Transport & Travel', width: 31, value: '€127', alt: true }
      ],
      suggestions: ['Compare with September', 'Show top 5 categories']
    },
    {
      title: 'September summary',
      meta: 'Month-over-month comparison',
      userQuestion: 'How does October compare with September?',
      aiParagraphs: [
        'In September, Food was <strong>€318</strong> and Transport was <strong>€145</strong>.',
        'Between months, Food rose by <strong>+€24 (+7.5%)</strong> while Transport dropped by <strong>-€18 (-12.4%)</strong>.'
      ],
      chartTitle: 'September vs October Comparison',
      bars: [
        { label: 'Food (Sep → Oct)', width: 82, value: '+€24', alt: false },
        { label: 'Transport (Sep → Oct)', width: 24, value: '-€18', alt: true }
      ],
      suggestions: ['Can I afford a trip?', 'Reset to October']
    },
    {
      title: 'Can I afford a trip?',
      meta: 'Forward-looking goal projection',
      userQuestion: 'Can I afford a €600 trip in December?',
      aiParagraphs: [
        'With your typical leftover of <strong>€340/month</strong>, setting aside €200/month across the next 3 months reaches <strong>€600</strong> by mid-December.',
        'You’ll still have a <strong>€140/month</strong> buffer for unexpected costs.'
      ],
      chartTitle: 'Trip Goal Progress (€600 Target)',
      bars: [
        { label: 'Projected Savings', width: 100, value: '€600', alt: false },
        { label: 'Safety Buffer', width: 35, value: '€210', alt: true }
      ],
      suggestions: ['Show October spending', 'How does this affect my plan?']
    }
  ];

  let currentScenarioIndex = 0;
  let isPlaying = false;
  let animationToken = 0;

  function typeText(element, text, speed = 24, token) {
    return new Promise((resolve) => {
      if (isReducedMotion()) {
        element.textContent = text;
        return resolve();
      }
      let i = 0;
      element.textContent = '';
      const timer = setInterval(() => {
        if (token !== animationToken) {
          clearInterval(timer);
          return resolve();
        }
        element.textContent += text.charAt(i);
        i++;
        if (i >= text.length) {
          clearInterval(timer);
          resolve();
        }
      }, speed);
    });
  }

  function wait(ms, token) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  async function playScenario(index, manual = false) {
    if (isPlaying && !manual) return;
    isPlaying = true;
    const token = ++animationToken;
    currentScenarioIndex = index;
    const data = scenarios[index] || scenarios[0];

    // Update active sidebar session
    sessionItems.forEach((session, i) => {
      session.classList.toggle('active', i === index);
    });

    // Update header
    const headerTitle = document.querySelector('.chatMockHeader h3');
    const headerSub = document.querySelector('.chatMockHeader p');
    if (headerTitle) headerTitle.textContent = data.title;
    if (headerSub) headerSub.textContent = data.meta;

    // Reset thread elements
    if (userMsgEl) userMsgEl.textContent = '';
    if (loadingEl) loadingEl.style.display = 'none';
    if (aiResponseEl) aiResponseEl.style.display = 'none';
    if (aiTextEl) aiTextEl.innerHTML = '';
    if (demoChartEl) demoChartEl.style.display = 'none';
    if (demoSuggestionsEl) {
      demoSuggestionsEl.style.display = 'none';
      demoSuggestionsEl.innerHTML = '';
    }

    // Step 1: Type user question
    if (userMsgEl) {
      await typeText(userMsgEl, data.userQuestion, 22, token);
      if (token !== animationToken) return;
    }

    // Step 2: Show loading indicator
    await wait(300, token);
    if (token !== animationToken) return;
    if (loadingEl) loadingEl.style.display = 'flex';

    // Step 3: Show AI response
    await wait(750, token);
    if (token !== animationToken) return;
    if (loadingEl) loadingEl.style.display = 'none';
    if (aiResponseEl) aiResponseEl.style.display = 'block';

    if (aiTextEl) {
      if (isReducedMotion()) {
        aiTextEl.innerHTML = data.aiParagraphs.map((p) => `<p>${p}</p>`).join('');
      } else {
        for (const p of data.aiParagraphs) {
          const pEl = document.createElement('p');
          pEl.innerHTML = p;
          pEl.style.opacity = '0';
          pEl.style.transform = 'translateY(6px)';
          pEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          aiTextEl.appendChild(pEl);
          await wait(80, token);
          pEl.style.opacity = '1';
          pEl.style.transform = 'translateY(0)';
          await wait(320, token);
        }
      }
    }

    // Step 4: Show inline chart and animate bars
    await wait(200, token);
    if (token !== animationToken) return;
    if (demoChartEl) {
      demoChartEl.style.display = 'block';
      const chartTitleEl = demoChartEl.querySelector('.chatMockChartTitle');
      if (chartTitleEl) chartTitleEl.textContent = data.chartTitle;

      const barContainers = demoChartEl.querySelectorAll('.chatMockBar');
      data.bars.forEach((barData, i) => {
        const barDiv = barContainers[i];
        if (!barDiv) return;
        const labelEl = barDiv.querySelector('.chatMockBarLabel');
        const fillEl = barDiv.querySelector('.chatMockBarFill');
        if (labelEl) labelEl.textContent = barData.label;
        if (fillEl) {
          fillEl.className = 'chatMockBarFill' + (barData.alt ? ' alt' : '');
          fillEl.style.width = '0%';
          fillEl.setAttribute('data-value', barData.value);
          fillEl.setAttribute('data-width', String(barData.width));
          fillEl.classList.remove('animated');
          setTimeout(() => {
            if (token === animationToken) {
              fillEl.style.width = `${barData.width}%`;
              fillEl.classList.add('animated');
            }
          }, 150);
        }
      });
    }

    // Step 5: Show suggestion chips
    await wait(450, token);
    if (token !== animationToken) return;
    if (demoSuggestionsEl) {
      demoSuggestionsEl.innerHTML = '';
      data.suggestions.forEach((text) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = text;
        btn.addEventListener('click', () => {
          if (text.includes('September')) playScenario(1, true);
          else if (text.includes('trip') || text.includes('afford')) playScenario(2, true);
          else playScenario(0, true);
        });
        demoSuggestionsEl.appendChild(btn);
      });
      demoSuggestionsEl.style.display = 'flex';
    }

    isPlaying = false;
  }

  // Sidebar session clicks
  sessionItems.forEach((session, index) => {
    session.addEventListener('click', () => {
      playScenario(index, true);
    });
  });

  // "New chat" button
  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      playScenario(0, true);
    });
  }

  // Auto-play chat demo when scrolled into view
  if (chatMockup && 'IntersectionObserver' in window) {
    let playedOnce = false;
    const chatObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !playedOnce) {
          playedOnce = true;
          playScenario(0);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    chatObserver.observe(chatMockup);
  } else if (chatMockup) {
    playScenario(0);
  }

  /* ═══════════════════════════════════════════
     5. PRIVACY SECTION ANIMATION & HOVER LINKING
     ═══════════════════════════════════════════ */
  const privacySplit = document.getElementById('privacy-split');
  const shield = document.getElementById('privacy-shield');
  const arrows = Array.from(document.querySelectorAll('.privacyArrow'));
  const maskedElements = [
    document.getElementById('mask-iban'),
    document.getElementById('mask-merchant'),
    document.getElementById('mask-amount'),
  ].filter(Boolean);

  if (privacySplit && 'IntersectionObserver' in window) {
    let animated = false;
    const privacyObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          if (shield) shield.classList.add('pulse');
          arrows.forEach((arr, i) => {
            setTimeout(() => {
              arr.classList.add('visible');
            }, 180 * (i + 1));
          });
          maskedElements.forEach((el, i) => {
            setTimeout(() => {
              el.classList.add('highlight');
            }, 300 + 200 * i);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    privacyObserver.observe(privacySplit);
  } else {
    arrows.forEach((arr) => arr.classList.add('visible'));
    maskedElements.forEach((el) => el.classList.add('highlight'));
  }

  // Side-by-side hover linking
  const userRows = Array.from(document.querySelectorAll('.privacyColUser dl > div'));
  const aiRows = Array.from(document.querySelectorAll('.privacyColAI dl > div'));
  userRows.forEach((row, i) => {
    const aiRow = aiRows[i];
    if (!aiRow) return;
    const onEnter = () => {
      row.classList.add('highlighted');
      aiRow.classList.add('highlighted');
    };
    const onLeave = () => {
      row.classList.remove('highlighted');
      aiRow.classList.remove('highlighted');
    };
    row.addEventListener('mouseenter', onEnter);
    row.addEventListener('mouseleave', onLeave);
    aiRow.addEventListener('mouseenter', onEnter);
    aiRow.addEventListener('mouseleave', onLeave);
  });

  /* ═══════════════════════════════════════════
     6. WAITLIST SIGNUP FORM
     ═══════════════════════════════════════════ */
  const form = document.getElementById('waitlist-form');
  const nameInput = document.getElementById('name-input');
  const emailInput = document.getElementById('email-input');
  const nameMessage = document.getElementById('name-message');
  const emailMessage = document.getElementById('email-message');
  const status = document.getElementById('signup-status');

  if (form && nameInput && emailInput && status) {
    const submit = form.querySelector('button[type="submit"]');
    let sending = false;
    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

    function validation(input, message, invalid) {
      input.setAttribute('aria-invalid', String(invalid));
      if (message) message.hidden = !invalid;
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
      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Sending your request…';
      }
      form.setAttribute('aria-busy', 'true');
      try {
        const response = await fetch(SIGNUP_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ name, email }),
        });
        if (response.type !== 'opaque' && !response.ok) throw new Error('Signup request failed');
        status.textContent = 'Your signup request was sent. Thank you for your interest in MBM.';
        form.reset();
      } catch {
        status.dataset.state = 'error';
        status.textContent = 'We couldn’t send your request. Please try again in a moment.';
      } finally {
        sending = false;
        if (submit) {
          submit.disabled = false;
          submit.innerHTML = 'Join the waitlist <span aria-hidden="true">→</span>';
        }
        form.removeAttribute('aria-busy');
      }
    });
  }
})();
