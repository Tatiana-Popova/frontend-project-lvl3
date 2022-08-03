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
        watchedState.rssUrls.push(url);
        watchedState.uiState.inputForm.valid = true;
        watchedState.uiState.feedbackStatus = i18.t('feedbackSucсsess');
      }
    })
    .catch((err) => {
      watchedState.uiState.inputForm.valid = false;
      console.log('err state ', err);
      watchedState.uiState.feedbackStatus = err.errors;
    });
};

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
      console.log('downloadStream', error);
      throw new Error(error);
    });
};

const parseResponse = (stream, feedCounter) => {
  const parser = new DOMParser();
  return Promise.resolve(stream)
    .then((xmlString) => parser.parseFromString(xmlString, 'application/xml'))
    .then((dom) => {
      const domItems = dom.querySelectorAll('item');
      let itemCounter = 0;
      const feedTitle = dom.querySelector('title').textContent;
      const feedDescription = dom.querySelector('description').textContent;
      const feedInfo = { feedCounter, feedTitle, feedDescription };

      const parsedDomItems = [];
      Array.from(domItems).forEach((item) => {
        const itemTitle = item.querySelector('title').textContent;
        const itemLink = item.querySelector('link').textContent;
        const itemDescription = item.querySelector('description').textContent;
        itemCounter += 1;
        parsedDomItems.push({ itemCounter, feedCounter, itemTitle, itemLink, itemDescription });
      });
      return [feedInfo, _.cloneDeep(parsedDomItems)];
    })
    .catch((error) => {
      console.log('dataResponse', error);
      throw new Error(error);
    });
};

export const uploadFeed = (watchedState, url, feedCounter) =>
  downloadStream(url)
    .then((stream) => parseResponse(stream, feedCounter))
    .then((response) => {
      const feedInfo = response[0];
      const parsedItems = response[1];
      watchedState.feeds.push(feedInfo);

      watchedState.posts = [...watchedState.posts, response[1]];
      console.log(
        'watchedState',
        watchedState,
        'watchedState.posts',
        watchedState.posts,
        'response[1]',
        response[1],
      );
    })
    .catch((error) => {
      console.log('uploadFeed error', error);
      throw new Error(error);
    });
