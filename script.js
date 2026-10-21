'use strict';

(() => {
  // Google Apps Script waitlist destination
  const SIGNUP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzN-gL5IUZfLPTnKhvhTfR8y5G2M-e2yZxqsLCXt9_M3lc9Y46PaEesDW7e_P4yi1h_gg/exec';

  const euro = new Intl.NumberFormat('en-IE', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  });
  const money = (value) => euro.format(value);
  const isReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════════════════════════════════════════
     UTILITY: NUMERIC COUNT-UP & TEXT SCRAMBLE
     ═══════════════════════════════════════════ */
  function countNumber(el, start, end, duration = 800) {
    if (!el) return;
    if (isReducedMotion()) {
      el.textContent = money(end);
      return;
    }
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * ease);
      el.textContent = money(current);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = money(end);
      }
    }
    requestAnimationFrame(tick);
  }

  const CIPHER_CHARS = 'ABCDEF0123456789#@$%&*!?';
  function scrambleText(element, targetText, duration = 650) {
    if (!element) return;
    if (isReducedMotion()) {
      element.textContent = targetText;
      return;
    }
    const startTime = performance.now();
    const length = targetText.length;
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const fixedChars = Math.floor(progress * length);
      let output = targetText.slice(0, fixedChars);
      for (let i = fixedChars; i < length; i++) {
        if (targetText[i] === ' ' || targetText[i] === '€' || targetText[i] === '.') {
          output += targetText[i];
        } else {
          output += CIPHER_CHARS.charAt(Math.floor(Math.random() * CIPHER_CHARS.length));
        }
      }
      element.textContent = output;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = targetText;
      }
    }
    requestAnimationFrame(update);
  }

  /* ═══════════════════════════════════════════
     1. HERO MONTH PICKER & FIGURE MICRO-ANIMATIONS
     ═══════════════════════════════════════════ */
  const examples = [
    { month: 'June', income: 3200, spending: 2240, story: 'A little more breathing room.', note: 'Everyday spending left €960 available for savings and plans.' },
    { month: 'July', income: 3200, spending: 2410, story: 'A summer with a few extras.', note: 'A few more days out brought spending to €2,410. There was still €790 left over.' },
    { month: 'August', income: 3200, spending: 2290, story: 'Back to a familiar rhythm.', note: 'Spending settled at €2,290, leaving €910 for whatever comes next.' },
    { month: 'September', income: 3200, spending: 2520, story: 'A busier start to the season.', note: 'Spending rose to €2,520. Looking at the transactions gives the change some context.' },
    { month: 'October', income: 3200, spending: 2350, story: 'Small changes, a little more space.', note: 'Spending eased back to €2,350, leaving €850 available.' },
    { month: 'November', income: 3200, spending: 2860, story: 'A new home. A different kind of month.', note: 'Shopping rose with purchases for a move. A life change, with context—not just a spending spike.' },
  ];

  let currentMetrics = [3200, 2860, 340];
  const figure = document.querySelector('.heroFigure');
  if (figure) {
    const spendingChart = figure.querySelector('svg.chart');
    const monthGroups = spendingChart ? Array.from(spendingChart.querySelectorAll('g')).slice(-6) : [];
    const monthButtons = Array.from(figure.querySelectorAll('.monthPicker button'));

    // Scroll trigger for initial hero bar chart entrance and number count-up
    if ('IntersectionObserver' in window) {
      let heroAnimated = false;
      const heroObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !heroAnimated) {
            heroAnimated = true;
            figure.classList.add('chart-animated');
            const metricsEls = figure.querySelectorAll('.metrics strong');
            if (metricsEls.length >= 3) {
              countNumber(metricsEls[0], 0, currentMetrics[0], 900);
              countNumber(metricsEls[1], 0, currentMetrics[1], 900);
              countNumber(metricsEls[2], 0, currentMetrics[2], 900);
            }
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      heroObserver.observe(figure);
    }

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

        // Smoothly animate count-up from old values to new values
        const metricsEls = figure.querySelectorAll('.metrics strong');
        if (metricsEls.length >= 3) {
          const newValues = [example.income, example.spending, example.income - example.spending];
          countNumber(metricsEls[0], currentMetrics[0], newValues[0], 500);
          countNumber(metricsEls[1], currentMetrics[1], newValues[1], 500);
          countNumber(metricsEls[2], currentMetrics[2], newValues[2], 500);
          currentMetrics = newValues;
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
     4. WALKTHROUGH CONTROLLER & AUTO-PLAY ON SCROLL
     ═══════════════════════════════════════════ */
  const walkthroughSection = document.getElementById('welcome-demo');
  const stepButtons = Array.from(document.querySelectorAll('.walkthroughStepBtn'));
  const panels = [
    document.getElementById('panel-upload'),
    document.getElementById('panel-chat'),
    document.getElementById('panel-privacy')
  ];
  const nextStepBtns = Array.from(document.querySelectorAll('[data-next-step]'));

  let activeWalkthroughStep = 0;
  let autoPlayActive = false;
  let autoPlayCancelled = false;
  let stepTimer = null;
  let progressRaf = null;

  const STEP_DURATIONS = [4000, 7000, 5000]; // Duration per step in ms

  function setWalkthroughStep(index, isAuto = false) {
    if (!isAuto) {
      autoPlayCancelled = true;
      cancelAnimationFrame(progressRaf);
      clearTimeout(stepTimer);
      // Reset all progress fills
      stepButtons.forEach((btn) => {
        const fill = btn.querySelector('.stepFill');
        if (fill) fill.style.width = '0%';
      });
    }

    activeWalkthroughStep = index;

    // Update buttons
    stepButtons.forEach((btn, i) => {
      const isActive = i === index;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    // Update panels
    panels.forEach((panel, i) => {
      if (!panel) return;
      const isCurrent = i === index;
      panel.style.display = isCurrent ? 'block' : 'none';
      panel.classList.toggle('active', isCurrent);
      panel.setAttribute('aria-hidden', String(!isCurrent));
    });

    // Specific triggers per panel
    if (index === 1) {
      playChatScenario(0);
    } else if (index === 2) {
      // Trigger scramble on privacy preview
      const ibanEl = document.getElementById('walkthrough-mask-iban');
      const merchantEl = document.getElementById('walkthrough-mask-merchant');
      const amountEl = document.getElementById('walkthrough-mask-amount');
      if (ibanEl) scrambleText(ibanEl, 'IBAN..4300', 650);
      if (merchantEl) scrambleText(merchantEl, 'Merchant_1', 600);
      if (amountEl) scrambleText(amountEl, '€175.00', 500);
    }
  }

  function startStepProgress(stepIndex) {
    if (autoPlayCancelled || isReducedMotion()) return;
    const btn = stepButtons[stepIndex];
    if (!btn) return;
    const fill = btn.querySelector('.stepFill');
    if (!fill) return;

    // Reset fills of all buttons
    stepButtons.forEach((b, i) => {
      const f = b.querySelector('.stepFill');
      if (f) f.style.width = i < stepIndex ? '100%' : '0%';
    });

    const duration = STEP_DURATIONS[stepIndex] || 5000;
    const startTime = performance.now();

    function stepTick(now) {
      if (autoPlayCancelled) return;
      const elapsed = now - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      fill.style.width = `${pct}%`;

      if (elapsed < duration) {
        progressRaf = requestAnimationFrame(stepTick);
      } else {
        fill.style.width = '100%';
        const next = (stepIndex + 1) % 3;
        setWalkthroughStep(next, true);
        startStepProgress(next);
      }
    }
    progressRaf = requestAnimationFrame(stepTick);
  }

  stepButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const stepIdx = parseInt(btn.dataset.step, 10) || 0;
      setWalkthroughStep(stepIdx, false);
    });
  });

  nextStepBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const nextIdx = parseInt(btn.dataset.nextStep, 10) || 1;
      setWalkthroughStep(nextIdx, false);
    });
  });

  // Auto-play walkthrough when scrolled into view
  if (walkthroughSection && 'IntersectionObserver' in window) {
    let observedOnce = false;
    const walkthroughObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !observedOnce) {
          observedOnce = true;
          autoPlayActive = true;
          setWalkthroughStep(0, true);
          startStepProgress(0);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    walkthroughObserver.observe(walkthroughSection);
  }

  /* ═══════════════════════════════════════════
     5. CHAT MOCKUP SCENARIOS & TYPING
     ═══════════════════════════════════════════ */
  const userMsgEl = document.getElementById('demo-user-msg');
  const loadingEl = document.getElementById('demo-loading');
  const aiResponseEl = document.getElementById('demo-ai-response');
  const aiTextEl = document.getElementById('demo-ai-text');
  const demoChartEl = document.getElementById('demo-chart');
  const demoSuggestionsEl = document.getElementById('demo-suggestions');
  const sessionItems = Array.from(document.querySelectorAll('.chatMockSession'));
  const newChatBtn = document.querySelector('.chatMockNewBtn');

  const scenarios = [
    {
      title: 'October spending',
      meta: 'Dissecting transactions & visualizing answers',
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

  let isChatPlaying = false;
  let chatToken = 0;

  function typeChatText(element, text, speed = 20, token) {
    return new Promise((resolve) => {
      if (isReducedMotion()) {
        element.textContent = text;
        return resolve();
      }
      let i = 0;
      element.textContent = '';
      const timer = setInterval(() => {
        if (token !== chatToken) {
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

  async function playChatScenario(index, manual = false) {
    if (isChatPlaying && !manual) return;
    isChatPlaying = true;
    const token = ++chatToken;
    const data = scenarios[index] || scenarios[0];

    sessionItems.forEach((session, i) => {
      session.classList.toggle('active', i === index);
    });

    const headerTitle = document.querySelector('.chatMockHeader h3');
    const headerSub = document.querySelector('.chatMockHeader p');
    if (headerTitle) headerTitle.textContent = data.title;
    if (headerSub) headerSub.textContent = data.meta;

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
      await typeChatText(userMsgEl, data.userQuestion, 20, token);
      if (token !== chatToken) return;
    }

    // Step 2: Show loading dots
    await wait(280, token);
    if (token !== chatToken) return;
    if (loadingEl) loadingEl.style.display = 'flex';

    // Step 3: Reveal AI message
    await wait(700, token);
    if (token !== chatToken) return;
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
          pEl.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
          aiTextEl.appendChild(pEl);
          await wait(60, token);
          pEl.style.opacity = '1';
          pEl.style.transform = 'translateY(0)';
          await wait(280, token);
        }
      }
    }

    // Step 4: Show inline chart and animate bars
    await wait(200, token);
    if (token !== chatToken) return;
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
            if (token === chatToken) {
              fillEl.style.width = `${barData.width}%`;
              fillEl.classList.add('animated');
            }
          }, 120);
        }
      });
    }

    // Step 5: Suggestions
    await wait(350, token);
    if (token !== chatToken) return;
    if (demoSuggestionsEl) {
      demoSuggestionsEl.innerHTML = '';
      data.suggestions.forEach((text) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = text;
        btn.addEventListener('click', () => {
          autoPlayCancelled = true;
          if (text.includes('September')) playChatScenario(1, true);
          else if (text.includes('trip') || text.includes('afford')) playChatScenario(2, true);
          else playChatScenario(0, true);
        });
        demoSuggestionsEl.appendChild(btn);
      });
      demoSuggestionsEl.style.display = 'flex';
    }

    isChatPlaying = false;
  }

  sessionItems.forEach((session, index) => {
    session.addEventListener('click', () => {
      autoPlayCancelled = true;
      playChatScenario(index, true);
    });
  });

  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      autoPlayCancelled = true;
      playChatScenario(0, true);
    });
  }

  /* ═══════════════════════════════════════════
     6. SECTION 04: PRIVACY COMPARISON & SCRAMBLE
     ═══════════════════════════════════════════ */
  const privacySplit = document.getElementById('privacy-split');
  const shield = document.getElementById('privacy-shield');
  const arrows = Array.from(document.querySelectorAll('.privacyArrow'));
  const maskIban = document.getElementById('mask-iban');
  const maskMerchant = document.getElementById('mask-merchant');
  const maskAmount = document.getElementById('mask-amount');

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
            }, 160 * (i + 1));
          });

          // Animate scramble and morphing
          setTimeout(() => {
            if (maskIban) {
              maskIban.classList.add('highlight');
              scrambleText(maskIban, 'IBAN..4300', 700);
            }
          }, 250);

          setTimeout(() => {
            if (maskMerchant) {
              maskMerchant.classList.add('highlight');
              scrambleText(maskMerchant, 'Merchant_1', 650);
            }
          }, 450);

          setTimeout(() => {
            if (maskAmount) {
              maskAmount.classList.add('highlight');
              scrambleText(maskAmount, '€175.00', 500);
            }
          }, 650);

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    privacyObserver.observe(privacySplit);
  } else {
    arrows.forEach((arr) => arr.classList.add('visible'));
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
     7. WAITLIST SIGNUP FORM
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
        status.textContent = 'Your signup request was sent. Thank you for your interest in this app.';
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
