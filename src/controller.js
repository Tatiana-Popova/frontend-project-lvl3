import * as yup from 'yup';
import axios from 'axios';
import * as _ from 'lodash';

yup.setLocale({
  mixed: {
    notOneOf: 'feedbackExisting',
  },
  string: {
    url: 'feedbackNotValid',
  },
});

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

const parseResponse = (stream) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(stream, 'application/xml');
  const domItems = dom.querySelectorAll('item');
  let itemCounter = 0;
  const feedTitle = dom.querySelector('title').textContent;
  const feedDescription = dom.querySelector('description').textContent;
  const feedLink = dom.querySelector('link').textContent;
  const feedInfo = { feedTitle, feedDescription, feedLink };

  const parsedDomItems = Array.from(domItems).map((item) => {
    const itemTitle = item.querySelector('title').textContent;
    const itemLink = item.querySelector('link').textContent;
    const itemDescription = item.querySelector('description').textContent;
    const pubDate = item.querySelector('pubDate').textContent;
    itemCounter += 1;
    return {
      itemCounter,
      itemTitle,
      feedLink,
      itemLink,
      itemDescription,
      pubDate,
    };
  });
  return [feedInfo, parsedDomItems];
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

const uploadNewPosts = (watchedState) => {
  const downloadingPromises = watchedState.rssUrls
    .map((rssUrl) => downloadStream(rssUrl, watchedState)
      .then((stream) => parseResponse(stream))
      .then((response) => {
        const feedInfo = response[0];
        const parsedItems = response[1];

        const feedsWithSuchALink = watchedState.feeds
          .filter((feed) => feed.feedLink === feedInfo.feedLink);
        const areThereFeedWithSuchALink = feedsWithSuchALink.length >= 1;
        if (!areThereFeedWithSuchALink) return;

        const newPosts = _.differenceBy(parsedItems, watchedState.posts.flat(), 'itemLink');
        watchedState.uiState.newPostsToUpload = [
          ...watchedState.uiState.newPostsToUpload, newPosts];
        watchedState.posts = [...watchedState.posts, newPosts.flat()];
        watchedState.uiState.isDownloadingNewPosts = watchedState.uiState.newPostsToUpload;

        watchedState.uiState.newPostsToUpload = [];
      })
      .catch(() => {
        console.log('failedDownload');
      }));
  Promise.all(downloadingPromises)
    .then(setTimeout(uploadNewPosts, 5000, watchedState));
};

const checkPostForUniq = (posts, newPost) => {
  const samePost = posts.filter((post) => post.itemLink === newPost.itemLink);
  return samePost.length > 0;
};

export const loadFeed = (i18, watchedState, e) => {
  const formData = new FormData(e.target);
  const url = formData.get('url').trim();
  checkInputValid(i18, watchedState, url)
    .then(() => checkUrlForXMLFormat(url, watchedState))
    .then(() => {
      watchedState.uiState.inputForm.valid = true;
      watchedState.uiState.inputForm.feedback = 'feedbackSucсess';
      watchedState.uiState.isDownloadingFeeds = true;
      watchedState.uiState.inputForm.status = 'loadingPosts';
      return downloadStream(url, watchedState);
    })
    .then((stream) => {
      const response = parseResponse(stream);
      const feedInfo = response[0];
      const parsedItems = response[1];
      watchedState.feeds = [...watchedState.feeds, feedInfo];
      parsedItems.forEach((item) => {
        const hasPostsThatPostAlready = checkPostForUniq(watchedState.posts.flat(), item);
        if (!hasPostsThatPostAlready) watchedState.posts = [...watchedState.posts, item];
      });
      watchedState.uiState.inputForm.status = 'successDownload';
      watchedState.uiState.isDownloadingFeeds = false;

      watchedState.rssUrls.push(url);
      uploadNewPosts(watchedState);
    })
    .catch((error) => {
      watchedState.uiState.inputForm.valid = false;
      watchedState.uiState.inputForm.feedback = error.message;
      watchedState.uiState.inputForm.status = 'failedDownload';
    });
};

const markAsRead = (element, watchedState) => {
  const { href } = element;
  watchedState.viewedPostLinks.add(href);
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
