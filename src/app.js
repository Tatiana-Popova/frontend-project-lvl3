import onChange from 'on-change';
import i18next from 'i18next';
import resources from './locales/index';
import 'bootstrap';
import {
  renderFeedback,
  renderModal,
  changeFormaAcessibility,
  renderFeeds,
  renderPosts,
} from './view';
import {
  loadFeed,
  handlePostClick,
} from './controller';

const app = () => {
  const elements = {
    input: document.querySelector('#url-input'),
    inputForm: document.querySelector('.rss-form'),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    addButton: document.querySelector('#add-button'),
  };

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
          viewedPostLinks: new Set(),
          clickedLink: null,
        },
        inputForm: {
          valid: true,
          feedback: '',
        },
        error: '',
        loadingProcess: 'initial',
        rssUrls: [],
        feeds: [],
        posts: [],
      };

      const watchedState = onChange(state, (path) => {
        switch (path) {
          case 'feeds':
            renderFeeds(state, elements);
            break;
          case 'posts':
          case 'uiState.viewedPostLinks':
            renderPosts(state, i18, elements);
            break;
          case 'loadingProcess':
            renderFeedback(state, i18, elements);
            changeFormaAcessibility(state.loadingProcess, elements);
            break;
          case 'error':
            renderFeedback(state, i18, elements);
            break;
          case 'uiState.clickedLink':
            renderModal(state);
            break;
          default:
            break;
        }
      });

      const inputForm = document.querySelector('.rss-form');
      inputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loadFeed(i18, watchedState, e);
      });

      const postsContainer = document.querySelector('.posts');
      postsContainer.addEventListener('click', (e) => {
        const element = e.target;
        handlePostClick(element, watchedState);
      });
    });
};
export default app;
