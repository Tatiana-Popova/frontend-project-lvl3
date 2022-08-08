import onChange from 'on-change';
import i18next from 'i18next';
import resources from './locales/index';
import {
  renderContent,
  renderNewPosts,
  renderInputStatus,
  renderFeedback,
  renderError,
  renderModal,
} from './view';
import {
  checkInputValid,
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
            valid: null,
            status: null,
            error: null,
          },
          feeds: {
            state: 'start',
            error: [],
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

      let feedCounter = 0;
      const watchedState = onChange(state, (path) => {
        switch (path) {
          case 'uiState.inputForm.status':
            renderFeedback(state);
            if (state.uiState.isDownloadingNewPosts === false) {
              uploadNewPosts(watchedState, feedCounter);
              state.uiState.isDownloadingNewPosts = true;
            }
            break;
          case 'feeds':
            renderInputStatus(state);
            break;
          case 'uiState.feeds.status':
            renderContent(state);
            break;
          case 'uiState.newPostsToUpload':
            renderNewPosts(state);
            break;
          case 'uiState.feeds.error':
            renderError(state, i18);
            state.uiState.inputForm.status = 'error';
            break;
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
        checkInputValid(i18, watchedState, e).then(() => {
          if (state.uiState.inputForm.valid) {
            uploadFeed(watchedState, e, (feedCounter += 1));
          }
        });
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
