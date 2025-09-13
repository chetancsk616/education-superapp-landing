// Simple test runner for UI component logic
function test(name, fn) {
  try {
    fn();
    console.log('✔️', name);
  } catch (e) {
    console.error('❌', name, e);
  }
}

// Modal tests
if (window.Modal) {
  test('Modal opens and closes', () => {
    const m = new Modal();
    m.show('<button>Test</button>');
    if (!m.isOpen()) throw 'Modal should be open';
    m.hide();
    if (m.isOpen()) throw 'Modal should be closed';
  });
}

// Tabs tests
if (window.Tabs) {
  test('Tabs activateTab works', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="tablist">
        <button class="tab" id="tab1">Tab 1</button>
        <button class="tab" id="tab2">Tab 2</button>
      </div>
      <div class="tabpanel" id="panel1">Panel 1</div>
      <div class="tabpanel" id="panel2">Panel 2</div>
    `;
    document.body.appendChild(container);
    const tabs = new Tabs({container});
    tabs.activateTab(1);
    if (container.querySelector('#panel2').style.display !== 'block') throw 'Panel 2 should be visible';
    document.body.removeChild(container);
  });
}

// Carousel tests
if (window.Carousel) {
  test('Carousel next/prev', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="slide">A</div>
      <div class="slide">B</div>
      <button class="carousel-prev"></button>
      <button class="carousel-next"></button>
    `;
    document.body.appendChild(container);
    const carousel = new Carousel({container});
    carousel.next();
    if (container.querySelectorAll('.slide')[1].style.display !== 'block') throw 'Second slide should be visible';
    carousel.prev();
    if (container.querySelectorAll('.slide')[0].style.display !== 'block') throw 'First slide should be visible';
    document.body.removeChild(container);
  });
}
