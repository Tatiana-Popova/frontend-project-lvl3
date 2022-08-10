import * as yup from 'yup';
import axios from 'axios';
import * as _ from 'lodash';

const createProxyToDownloadStreams = (rssUrl) => {
  const url = new URL('https://allorigins.hexlet.app/get');
  url.searchParams.set('disableCache', 'true');
  url.searchParams.set('url', rssUrl);
  return url;
};

const downloadStream = (url) => {
  const allOriginsUrl = createProxyToDownloadStreams(url);
  return axios
    .get(allOriginsUrl.href)
    .then((response) => response.data.contents)
    .catch((error) => {
      error.message = 'networkError';
      throw new Error(error.message);
    });
};

const parseResponse = (stream, watchedState) => {
  const parser = new DOMParser();
  return Promise.resolve(stream)
    .then((xmlString) => parser.parseFromString(xmlString, 'application/xml'))
    .then((dom) => {
      const domItems = dom.querySelectorAll('item');
      let itemCounter = 0;
      const feedTitle = dom.querySelector('title').textContent;
      const feedDescription = dom.querySelector('description').textContent;
      const feedLink = dom.querySelector('link').textContent;
      const feedInfo = { feedTitle, feedDescription, feedLink };

      let parsedDomItems = [];
      Array.from(domItems).forEach((item) => {
        const itemTitle = item.querySelector('title').textContent;
        const itemLink = item.querySelector('link').textContent;
        const itemDescription = item.querySelector('description').textContent;
        const pubDate = item.querySelector('pubDate').textContent;
        itemCounter += 1;
        parsedDomItems = [
          ...parsedDomItems,
          {
            itemCounter,
            itemTitle,
            feedLink,
            itemLink,
            itemDescription,
            pubDate,
          },
        ];
      });

      const feedsWithSuchALink = watchedState.feeds.filter((feed) => feed.feedLink === feedLink);
      const areThereFeedWithSuchALink = feedsWithSuchALink.length === 1;
      if (areThereFeedWithSuchALink) {
        const sameResoursePosts = watchedState.posts
          .flat()
          .filter((post) => post.feedLink === feedLink)
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
      error.message = 'Parsing error';
      throw new Error(error.message);
    });
};

const checkUrlForXMLFormat = (url, watchedState) => downloadStream(url, watchedState)
  .then((stream) => {
    if (stream.startsWith('<?xml')) {
      return;
    }
    const error = new Error();
    error.message = 'invalidRSS';
    throw error;
  })
  .catch((error) => {
    throw new Error(error.message);
  });

export const checkInputValid = async (i18, watchedState, url) => {
  yup.setLocale({
    mixed: {
      notOneOf: 'feedbackExisting',
    },
    string: {
      url: 'feedbackNotValid',
    },
  });
  const schema = yup
    .string()
    .required()
    .url()
    .notOneOf([...watchedState.rssUrls]);
  return schema.validate(url).catch((error) => {
    error.type = 'Validate error';
    throw new Error(error.errors);
  });
};

export const uploadFeed = (i18, watchedState, e) => {
  const formData = new FormData(e.target);
  const url = formData.get('url').trim();
  checkInputValid(i18, watchedState, url)
    .then(() => checkUrlForXMLFormat(url, watchedState))
    .then(() => {
      watchedState.uiState.inputForm.valid = true;
      watchedState.uiState.inputForm.status = 'feedbackSucсess';
    })
    .then(() => downloadStream(url, watchedState))
    .then((stream) => parseResponse(stream, watchedState))
    .then((response) => {
      const feedInfo = response[1];
      const parsedItems = response[2];
      watchedState.feeds = [...watchedState.feeds, feedInfo];
      watchedState.posts = [...watchedState.posts, parsedItems];
      watchedState.uiState.feeds.status = 'loadingSourcePosts';
      watchedState.uiState.feeds.status = 'endOfOperation';
      watchedState.rssUrls.push(url);
    })
    .catch((error) => {
      watchedState.uiState.inputForm.valid = false;

      watchedState.uiState.inputForm.status = error.message;
    });
};

export const uploadNewPosts = (watchedState) => {
  Promise.resolve()
    .then(() => {
      watchedState.rssUrls.forEach((rssUrl) => {
        downloadStream(rssUrl, watchedState)
          .then((stream) => parseResponse(stream, watchedState))
          .then((newPosts) => {
            if (newPosts[0] === 'old') {
              return;
            }
            watchedState.uiState.newPostsToUpload = [
              ...watchedState.uiState.newPostsToUpload,
              newPosts[1].flat(),
            ];
            watchedState.uiState.feeds.status = 'loadingNewPosts';
            watchedState.uiState.feeds.status = 'endOfOperation';
            watchedState.posts = [...watchedState.posts, newPosts[1].flat()];
            watchedState.uiState.newPostsToUpload = [];
          })
          .catch((error) => {
            watchedState.uiState.inputForm.status = error.message;
          });
      });
    })
    .finally(() => {
      setTimeout(uploadNewPosts, 5000, watchedState);
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
