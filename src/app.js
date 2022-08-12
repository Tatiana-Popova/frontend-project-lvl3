import onChange from 'on-change';
import i18next from 'i18next';
import resources from './locales/index';
import 'bootstrap';
import { renderContent, renderFeedback, renderModal } from './view';
import {
  uploadFeed,
  handlePostClick,
} from './controller';

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
            status: 'initial',
            feedback: 'initial',
          },
          newPostsToUpload: [],
          clickedLink: null,
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
        viewedPostLinks: [],
      };

      const watchedState = onChange(state, (path) => {
        switch (path) {
          case 'uiState.inputForm.status':
          case 'viewedPostLinks':
            renderFeedback(state, i18);
            renderContent(state);
            break;
          case 'uiState.clickedLink':
            renderModal(state);
            break;
          default:
            break;
        }
      });

      state.elements.inputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        uploadFeed(i18, watchedState, e);
      });

      state.elements.postsContainer.addEventListener('click', (e) => {
        const element = e.target;
        handlePostClick(element, watchedState);
      });
    });
};
export default app;
