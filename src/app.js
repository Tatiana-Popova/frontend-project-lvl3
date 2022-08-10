import onChange from 'on-change';
import i18next from 'i18next';
import resources from './locales/index';
import { renderContent, renderFeedback, renderModal } from './view';
import {
  uploadFeed,
  uploadNewPosts,
  handlePostClick,
  closeModal,
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
            status: null,
          },
          feeds: {
            state: 'start',
          },
          newPostsToUpload: [],
          isDownloadingNewPosts: false,
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
            renderFeedback(state, i18);
            break;
          case 'feeds':
            renderFeedback(state, i18);
            if (state.uiState.isDownloadingNewPosts === false) {
              uploadNewPosts(watchedState);
              state.uiState.isDownloadingNewPosts = true;
            }
            break;
          case 'uiState.feeds.status':
          case 'viewedPostLinks':
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

      const modal = document.querySelector('#modal');

      modal.addEventListener('click', (e) => {
        const element = e.target;
        if (element.hasAttribute('to-close-modal') || element.parentNode.tagName === 'BODY') {
          closeModal(watchedState);
        }
      });

      document.addEventListener('keydown', (e) => {
        if (state.clickedLink !== null && e.key === 'Escape') closeModal(watchedState);
      });
    });
};
export default app;
