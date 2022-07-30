import onChange from 'on-change';
import i18next from 'i18next';
import resources from './locales/index';
import { successInput, dangerInput } from './view';
import checkInputValid from './controller';

const app = () => {
  const i18 = i18next.createInstance();
  i18
    .init({
      lng: 'ru',
      debug: true,
      resources,
    })
    .then(() => {
      const state = {
        uiState: {
          inputForm: {
            valid: '',
            url: '',
          },
          feedbackStatus: '',
        },
        elements: {
          input: document.querySelector('#url-input'),
          inputForm: document.querySelector('.rss-form'),
          feedback: document.querySelector('.feedback'),
        },
        rssUrls: [],
      };
      const watchedState = onChange(state, () => {
        if (state.uiState.inputForm.valid === false) {
          dangerInput(state);
        } else {
          successInput(state);
        }
      });

      state.elements.inputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        checkInputValid(i18, watchedState, e);
      });
    });
};

export default app;
