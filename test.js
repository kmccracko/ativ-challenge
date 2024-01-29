/*

Integration Testing: UI:state interactions

While end-to-end and unit testing are worthwhile for this application, I believe integration testing for key components and effects is the most effective means of ensuring things are working as they should.

Of course, more coverage is always better, but this should suffice for now!

*/

const {
  buildProgress,
  buildPrompt,
  buildInput,
  buildActions,
  setStateBlank,
  updateState,
  saveImgToState,
  goToNextStep,
  goToPreviousStep,
  handleCancel,
  handleFileUpload,
  updateFileName,
  checkFileSize,
  addEventHandlers,
  createNextStep,
  updateActive,
  animateNext,
  saveStateToLocalStorage,
  loadImgFromState,
} = require('./project.js');
const { JSDOM } = require('jsdom');

let state;
let document;

beforeEach(() => {
  state = setStateBlank();
  document = new JSDOM(`
    <!DOCTYPE html>
        <html lang="en">
        <head></head>
        <body>
            <div id="hello"></div>
            <header>ATIV Software</header>
            <main id="main" aria-live="polite">
                <section id="start"></section>
            </main>
            <script src="./project.js"></script>
        </body>
    </html>
  `).window.document;
});

test('Page 1 Inputs Validation', () => {
  // Setup
  state.currentStep = 1;
  createNextStep();

  const form = document.querySelector('form');
  const { exhibition, company, name, email } = form.elements;
  const continueBtn = document.getElementById('continue');

  // Assertion: fail because input missing
  expect(form.checkValidity()).toEqual(false);

  // Action
  exhibition.value = 'Test Exhibition';

  // Assertion: fail because input missing
  expect(form.checkValidity()).toEqual(false);

  // Action
  company.value = 'Test Company';

  // Assertion: fail because input missing
  expect(form.checkValidity()).toEqual(false);

  // Action
  name.value = 'Test Name';

  // Assertion: fail because input missing
  expect(form.checkValidity()).toEqual(false);

  // Action
  email.value = 'Test Email';

  // Assertion: fail because invalid email address
  expect(form.checkValidity()).toEqual(false);

  // Action
  exhibition.value = 'test@email.com';
  continueBtn.click();

  // Assertion: pass
  expect(form.checkValidity()).toEqual(true);
  expect(state.currentStep).toEqual(2);
});

test('Page 2 Inputs Validation', () => {
  // Setup
  state.currentStep = 2;
  createNextStep();

  const form = document.querySelector('form');
  const { logo } = form.elements;
  const continueBtn = document.getElementById('continue');

  // Assertion: fail because input missing
  expect(form.checkValidity()).toEqual(false);

  // Action
  logo.files[0] = new File('abc', 'file.png');
  logo.files[0].size = 1024 * 1024 * 2; // 2 MB
  continueBtn.click();

  // Assertion: fail because file larger than 1MB
  expect(state.currentStep).toEqual(2);

  // Action
  logo.files[0].size = 1024 * 1024 * 0.5; // 500 KB
  continueBtn.click();

  // Assertion: pass
  expect(form.checkValidity()).toEqual(true);
  expect(state.currentStep).toEqual(3);
});

test('Page 3 Inputs Validation', () => {
  // Setup
  state.currentStep = 3;
  createNextStep();

  const form = document.querySelector('form');
  const { description } = form.elements;
  const continueBtn = document.getElementById('continue');

  // Assertion: fail because input missing
  expect(form.checkValidity()).toEqual(false);

  // Action
  description.textArea = 'Hello World!';
  continueBtn.click();

  // Assertion: pass
  expect(form.checkValidity()).toEqual(true);
  expect(state.currentStep).toEqual(4);
});

test('Back button', () => {
  // Setup
  state.currentStep = 4;
  createNextStep();
  let backBtn = document.getElementById('back');

  // Action
  backBtn.click();

  // Assertion: pass
  expect(state.currentStep).toEqual(3);

  // Setup
  backBtn = document.getElementById('back');

  // Action
  backBtn.click();

  // Assertion: pass
  expect(state.currentStep).toEqual(2);

  // Setup
  backBtn = document.getElementById('back');

  // Action
  backBtn.click();

  // Assertion: pass
  expect(state.currentStep).toEqual(1);

  // Setup
  backBtn = document.getElementById('back');

  // Action
  backBtn.click();

  // Assertion: pass
  expect(state.currentStep).toEqual(0);
});

test('Cancel button', () => {
  // Setup
  state.currentStep = 3;
  createNextStep();
  let cancelBtn = document.getElementById('cancel');

  // Action
  cancelBtn.click();

  // Assertion: pass
  expect(state.currentStep).toEqual(0);

  // Setup
  state.currentStep = 0;
  createNextStep();
  cancelBtn = document.getElementById('cancel');

  // Action
  cancelBtn.click();

  // Assertion: pass
  expect(state.currentStep).toEqual(0);
});

test('Save to local storage', () => {
  // Setup
  state.currentStep = 4;
  state.data = {
    test: 'test value',
    imageUrl: 'image url goes here __--__',
  };
  createNextStep();
  let continueBtn = document.getElementById('continue');

  // Action
  continueBtn.click();

  // Assertion: pass
  expect(window.localStorage.getItem('test')).toEqual('test value');
});
