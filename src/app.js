import onChange from 'on-change';
import i18next from 'i18next';
import resources from './locales/index';
import 'bootstrap';
import { renderContent, renderFeedback, renderModal, renderNewPosts } from './view';
import {
  loadFeed,
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
          isDownloadingNewPosts: false,
          newPostsToUpload: [],
          clickedLink: null,
        },
        rssUrls: [],
        feeds: [],
        posts: [],
        viewedPostLinks: new Set(),
      };

      const watchedState = onChange(state, (path) => {
        switch (path) {
          case 'uiState.isDownloadingNewPosts':
            renderNewPosts(state, i18);
            break;
          case 'uiState.inputForm.status':
          case 'viewedPostLinks':
            renderFeedback(state, i18);
            renderContent(state, i18);
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
