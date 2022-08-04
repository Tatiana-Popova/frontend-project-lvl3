import onChange from 'on-change';
import i18next from 'i18next';
import resources from './locales/index';
import { successInput, dangerInput, renderContent } from './view';
import { checkInputValid, uploadFeed } from './controller';

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
            valid: false,
            url: '',
          },
          feedbackStatus: '',
          errors: [],
        },
        elements: {
          input: document.querySelector('#url-input'),
          inputForm: document.querySelector('.rss-form'),
          feedback: document.querySelector('.feedback'),
          feedsContainer: document.querySelector('.feeds'),
          postsContainer: document.querySelector('.posts'),
        },
        rssUrls: [],
        feeds: [],
        posts: [],
      };
      const watchedState = onChange(state, (path) => {
        if (path === 'uiState.errors') {
          dangerInput(state);
        }
        if (state.uiState.inputForm.valid === false) {
          dangerInput(state);
        } else {
          successInput(state);
          if (path === 'feeds' || path === 'posts') {
            renderContent(state);
          }
        }
      });

      let feedCounter = 0;
      state.elements.inputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        checkInputValid(i18, watchedState, e).then(() => {
          if (state.uiState.inputForm.valid) {
            const urlToUpload = state.rssUrls[state.rssUrls.length - 1];
            uploadFeed(watchedState, urlToUpload, (feedCounter += 1));
          }
        });
      });
    });
};

export default app;
