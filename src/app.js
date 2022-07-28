import onChange from 'on-change';
import addRedFrame from './view';
import checkInputValid from './controller';

const app = () => {
  const state = {
    uiState: {
      inputForm: {
        valid: false,
        url: '',
      },
    },
    elements: {
      input: document.querySelector('#url-input'),
      inputForm: document.querySelector('.rss-form'),
    },
  };

  const watchedState = onChange(state, (path, value) => {
    console.log('smth changed', 'watchedState from app = ', watchedState);
    if (state.inputForm.valid === false) {
      addRedFrame(watchedState);
    }
  });

  state.elements.inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    checkInputValid(state, e);
  });
};

export default app;
