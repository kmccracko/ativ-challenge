// create state blank
let state = {};
setStateBlank();

try {
  document.addEventListener('DOMContentLoaded', () => {
    createNextStep();
  });
} catch (error) {}

/*

HTML Builder Functions

*/

function buildProgress() {
  return `
    <div id="progress" aria-hidden="true">
        <label class="step">Info</label>
        <label class="step">Logo</label>
        <label class="step">About</label>
        <label class="step">Summary</label>
    </div>
    `;
}

function buildPrompt(prompt, matchingId) {
  return `
    <label class="prompt" for="${matchingId || ''}">${prompt}</label>
`;
}

function buildInput({
  value,
  type,
  placeHolder,
  id,
  name,
  autocomplete,
  accept,
  notRequired,
}) {
  return `
    <input 
    id="${id || ''}" 
    name="${name || ''}" 
    value="${value || ''}" 
    type="${type || 'text'}" 
    ${placeHolder ? `placeholder="${placeHolder}"` : ''}
    ${accept ? `accept="${accept}"` : ''}
    autocomplete="${autocomplete || 'off'}" 
    aria-label="${name}-input-field" 
    ${notRequired ? '' : 'required'}>
`;
}

function buildActions(s) {
  return `
      <div id="actions">
          <div id="actions-primary">
              <input id="back" class="border-btn" type="button" value="Back" />
              <input 
                  type="submit" 
                  value="${s === 4 ? 'Submit' : 'Continue'}" 
                  id="continue" 
                  class="border-btn" 
                  
              ></input>
          </div>
          <input id="cancel" type="reset" value="Cancel"/>
      </div>
      `;
}

const buildPages = {
  0: function () {
    return `
        <form>
            <input type="submit" id="continue" class="border-btn" value="New Exhibitor"></button>
        </form>
    `;
  },
  1: function () {
    return `
        ${buildPrompt('First things first.')}
        ${buildPrompt('Exhibition Name', 'exhibition-name-input')}
        ${buildInput({
          id: 'exhibition-name-input',
          name: 'exhibition',
          value: state.data.exhibition || '',
          type: 'text',
        })}
        ${buildPrompt('Company', 'company-name-input')}
        ${buildInput({
          id: 'company-name-input',
          name: 'company',
          value: state.data.company || '',
          type: 'text',
        })}
        ${buildPrompt('Presenter', 'presenter-name-input')}
        ${buildInput({
          id: 'presenter-name-input',
          name: 'name',
          value: state.data.name || '',
          type: 'name',
          autocomplete: 'on',
        })}
        ${buildPrompt('Presenter Email', 'presenter-email-input')}
        ${buildInput({
          id: 'presenter-email-input',
          name: 'email',
          value: state.data.email || '',
          type: 'email',
          autocomplete: 'on',
        })}
      `;
  },
  2: function () {
    return `
        ${buildPrompt('Thanks for that. Do you have a logo file?')}
        <div class="file-select">
            <span class="file-name">${
              state.data.imageName || 'No file selected'
            }</span>
            ${buildInput({
              id: 'logo-input',
              name: 'logo',
              type: 'file',
              accept: '.jpg,.jpeg,.png',
              notRequired: state.data.logo || '',
            })}
            <label for="logo-input" class="file-button" role="button">
                Choose a file...
            </label>
        </div>
        `;
  },
  3: function () {
    return `
        ${buildPrompt(
          'Nice logo. What should visitors know about your exhibition?'
        )}
        ${buildPrompt('Exhibition Description', 'description')}
        <textarea id="input" placeholder="Tell us more!" name="description" required>${
          state.data.description || ''
        }</textarea>
    `;
  },
  4: function () {
    return `
        ${buildPrompt("All set. Here's your preview:")}
    
        <div id="exhibitor-preview">
            <div id="img-container">
                <img id="exhibitor-image" src="" alt="Exhibitor Logo"/>
            </div>
            <h2>${state.data.exhibition}</h2>
            <h3>${state.data.company}</h3>
            <p>${state.data.description}</p>
        </div>
    `;
  },
  5: function () {
    return `
        ${buildPrompt(
          'Registration successful. We look forward to seeing you!'
        )}
        ${buildPrompt(
          'You should receive an email from us shortly regarding your registration. Keep an eye out for more emails as the conference date gets closer!'
        )}
        <input id="cancel" type="reset" value="Back to Home"/>
    `;
  },
};

/*

State Modifier Functions

*/

function setStateBlank(stateForce) {
  // Added for testing
  if (stateForce) state = stateForce;

  state = Object.assign(state, {
    data: {},
    currentStep: 0,
  });
  return state;
}

function updateState(s, dataObj) {
  const pick = (obj, keys) =>
    keys.reduce(
      (result, key) => (key in obj && (result[key] = obj[key].value), result),
      {}
    );

  switch (s) {
    case 1:
      const newObj = pick(dataObj, ['email', 'name', 'company', 'exhibition']);

      state.data = { ...state.data, ...newObj };
      break;
    case 2:
      saveImgToState(dataObj.logo.files[0]);
      break;
    case 3:
      state.data.description = dataObj.description.value;
      break;
    default:
      console.log('step ', s, 'not recognized!');
      break;
  }
}

function saveImgToState(imageFile) {
  if (imageFile) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const imageDataUrl = e.target.result;
      console.log({ imageDataUrl });
      if (imageDataUrl) {
        state.data.logo = imageDataUrl;
        state.data.imageName = imageFile.name;
      }
    };

    reader.readAsDataURL(imageFile);
  }
}

/*

Event Handler Functions

*/

function goToNextStep(e) {
  e.preventDefault();
  const s = state.currentStep;
  const dataObj = e.target.elements;

  // If moving from start, skip data collection
  if (s === 0) return animateNext(1);
  // If moving from summary, just save everything
  else if (s === 4) saveStateToLocalStorage();
  // If moving from a data page, update state
  else updateState(s, dataObj);

  animateNext(1);
}

function goToPreviousStep() {
  if (state.currentStep === 1) handleCancel();
  else animateNext(-1);
}

function handleCancel() {
  setStateBlank();
  animateNext(0);
}

function handleFileUpload(e) {
  updateFileName(checkFileSize(e.target.files[0]));
}

function updateFileName(file) {
  const fileNameEl = document.querySelector('.file-name');
  fileNameEl.className = `file-name ${file ? '' : 'bad-file'}`;
  fileNameEl.textContent = file ? file.name : 'File size of 1MB exceeded!';
}

function checkFileSize(file) {
  const maxSize = 1024 * 1024; // 1 MB
  const submitButton = document.getElementById('continue');

  /* If file is too large, return undefined to inform 'updateFileName' function.
  Else, return the file for the 'updateFileName' function to use
  */

  if (file.size > maxSize) {
    submitButton.disabled = true;
    return;
  }
  submitButton.disabled = false;
  return file;
}

/*

DOM Manipulation Functions

*/

function addEventHandlers() {
  const form = document.querySelector('form');
  const backBtn = document.getElementById('back');
  const cancelBtn = document.getElementById('cancel');

  // If form accessible, update submit listener
  // If form has 'logo' input, add listener for file selection
  if (form) {
    form.addEventListener('submit', goToNextStep);
    if (form.elements.logo) {
      form.elements.logo.addEventListener('change', handleFileUpload);
    }
  }

  if (backBtn) backBtn.addEventListener('click', goToPreviousStep);
  if (cancelBtn) cancelBtn.addEventListener('click', handleCancel);
}

function createNextStep() {
  const s = state.currentStep;

  // Get section and update its id
  const section = document.querySelector('section');
  section.id = s ? `section-${s}` : 'start';

  // Start screen or success page
  if (s === 0 || s === 5) {
    section.innerHTML = `
    ${buildPages[s]()}
    `;
  }
  // Main pages (Info, Logo, Details, Summary)
  else {
    section.innerHTML = `
    ${buildProgress()}
    <form>
    ${buildPages[s]()}
    ${buildActions(s)}
    </form>
    `;

    if (s === 4) loadImgFromState();
  }

  addEventHandlers();
}

function updateActive() {
  // Get all progress elements and highlight the active one

  if (state.currentStep === 0) return;
  const s = state.currentStep;

  const stepElements = document.querySelectorAll('.step');
  stepElements.forEach((el, i) => {
    el.className = `step ${s === i + 1 ? 'active' : ''}`;
  });
}

function animateNext(change) {
  // 1: add screenFade class to div, starting the animation
  const transitioner = document.getElementById('transitioner');
  transitioner.classList.toggle('screenFade');
  // 2: 300ms later, update the DOM to create the next page
  setTimeout(() => {
    state.currentStep += change;
    createNextStep();
    updateActive();
    // 3: 600ms after animation started, it will end. Now remove the class so the animation can be started again in the future
    setTimeout(() => {
      document.querySelector('#transitioner').classList.toggle('screenFade');
    }, 300);
  }, 300);
}

function saveStateToLocalStorage() {
  for (let key in state.data) {
    window.localStorage.setItem(key, state.data[key] || '');
  }
}

function loadImgFromState() {
  const imgElement = document.getElementById('exhibitor-image');
  const imgUrl = state.data.logo;
  imgElement.src = imgUrl;
}

// module.exports = {
//   buildProgress,
//   buildPrompt,
//   buildInput,
//   buildActions,
//   setStateBlank,
//   updateState,
//   saveImgToState,
//   goToNextStep,
//   goToPreviousStep,
//   handleCancel,
//   handleFileUpload,
//   updateFileName,
//   checkFileSize,
//   addEventHandlers,
//   createNextStep,
//   updateActive,
//   animateNext,
//   saveStateToLocalStorage,
//   loadImgFromState,
// };
