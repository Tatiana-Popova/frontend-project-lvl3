import * as yup from 'yup';
import axios from 'axios';
import * as _ from 'lodash';

export const checkInputValid = async (i18, watchedState, e) => {
  yup.setLocale({
    mixed: {
      notOneOf: i18.t('feedbackExisting'),
      default: 'heh',
    },
    string: {
      url: i18.t('feedbackNotValid'),
    },
  });
  const formData = new FormData(e.target);
  const url = formData.get('url');

  const schema = yup
    .string()
    .required()
    .url()
    .matches(['rss'])
    .notOneOf([...watchedState.rssUrls]);
  return schema
    .validate(url)
    .then((isvalid) => {
      if (isvalid) {
        watchedState.uiState.inputForm.valid = true;
        watchedState.uiState.inputForm.status = i18.t('feedbackSucсess');
      }
    })
    .catch((error) => {
      watchedState.uiState.inputForm.valid = false;
      watchedState.uiState.inputForm.status = error.errors;
      throw new Error(error);
    });
};

const createProxyToDownloadStreams = (rssUrl) => {
  const url = new URL('https://allorigins.hexlet.app/get');
  url.searchParams.set('disableCache', 'true');
  url.searchParams.set('url', rssUrl);
  return url;
};

const downloadStream = (url, watchedState) => {
  const allOriginsUrl = createProxyToDownloadStreams(url);
  return axios
    .get(allOriginsUrl.href)
    .then((response) => response.data.contents)
    .catch((error) => {
      watchedState.uiState.feeds.error = [...watchedState.uiState.feeds.error, error];
      watchedState.uiState.feeds.error = error;
      throw new Error(error);
    });
};

const parseResponse = (stream, feedCounter, watchedState) => {
  const parser = new DOMParser();
  return Promise.resolve(stream)
    .then((xmlString) => parser.parseFromString(xmlString, 'application/xml'))
    .then((dom) => {
      const domItems = dom.querySelectorAll('item');
      let itemCounter = 0;
      const feedTitle = dom.querySelector('title').textContent;
      const feedDescription = dom.querySelector('description').textContent;
      const feedLink = dom.querySelector('link').textContent;
      const feedInfo = { feedCounter, feedTitle, feedDescription, feedLink };

      let parsedDomItems = [];
      Array.from(domItems).forEach((item) => {
        const itemTitle = item.querySelector('title').textContent;
        const itemLink = item.querySelector('link').textContent;
        const itemDescription = item.querySelector('description').textContent;
        const pubDate = item.querySelector('pubDate').textContent;
        itemCounter += 1;
        parsedDomItems = [
          ...parsedDomItems,
          { itemCounter, feedCounter, itemTitle, itemLink, itemDescription, pubDate },
        ];
      });
      if (watchedState.rssUrls.includes(feedLink)) {
        const sameResourseCounter = _.last(
          watchedState.feeds.filter((feed) => feed.feedLink === feedLink),
        ).feedCounter;
        const sameResoursePosts = watchedState.posts
          .filter((post) => post.feedCounter === sameResourseCounter)
          .sort((a, b) => (a.pubDate > b.pubDate ? 1 : -1));
        const lastSameResorsePostDate = _.last(sameResoursePosts).pubDate;
        const sameResourseNewPosts = parsedDomItems.filter(
          (post) => post.pubDate > lastSameResorsePostDate,
        );
        return ['new', sameResourseNewPosts];
      }

      return ['old', feedInfo, parsedDomItems];
    })
    .catch((error) => {
      watchedState.uiState.feeds.error = [...watchedState.uiState.feeds.error, error];
      throw new Error(error);
    });
};

export const uploadFeed = (watchedState, e, feedCounter) => {
  const formData = new FormData(e.target);
  const url = formData.get('url');
  downloadStream(url, watchedState)
    .then((stream) => parseResponse(stream, feedCounter, watchedState))
    .then((response) => {
      const feedInfo = response[1];
      const parsedItems = response[2];
      watchedState.feeds = [...watchedState.feeds, feedInfo];
      watchedState.posts = [...watchedState.posts, parsedItems];
      watchedState.uiState.feeds.status = 'loadingSourcePosts';
      watchedState.uiState.feeds.status = 'sourcePostsAreLoaded';
      watchedState.rssUrls.push(url);
    })
    .catch((error) => {
      watchedState.uiState.feeds.error = [...watchedState.uiState.feeds.error, error];
      throw new Error(error);
    });
};

export const uploadNewPosts = (watchedState, feedCounter) => {
  Promise.resolve()
    .then(() => {
      watchedState.rssUrls.forEach((rssUrl) => {
        downloadStream(rssUrl, watchedState)
          .then((stream) => parseResponse(stream, feedCounter, watchedState))
          .then((newPosts) => {
            if (newPosts[0] === 'old') {
              return;
            }
            console.log('newPosts', newPosts);
            watchedState.uiState.newPostsToUpload = newPosts;
          })
          .catch((error) => {
            watchedState.uiState.feeds.error = [...watchedState.uiState.feeds.error, error];
          });
      });
    })
    .catch((error) => {
      watchedState.uiState.inputForm.error = [...watchedState.uiState.feeds.error, error];
      throw new Error(error);
    })
    .finally(() => {
      setTimeout(uploadNewPosts, 5000, watchedState, feedCounter);
    });
};

const markAsRead = (element, watchedState) => {
  const { href } = element;
  watchedState.viewedPostLinks = [...watchedState.viewedPostLinks, href];
  watchedState.uiState.feeds.status = 'updatingViewedPosts';
};

export const handlePostClick = (element, watchedState) => {
  switch (element.tagName) {
    case 'A':
      markAsRead(element, watchedState);
      break;
    case 'BUTTON':
      {
        const a = element.parentNode.querySelector('a');
        markAsRead(a, watchedState);
        watchedState.uiState.clickedLink = a.href;
      }
      break;
    default:
      break;
  }
};

export const closeModal = (watchedState) => {
  watchedState.uiState.clickedLink = null;
};
