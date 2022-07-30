import * as yup from 'yup';

const checkInputValid = async (i18, watchedState, e) => {
  const formData = new FormData(e.target);
  const url = formData.get('url');

  const schema = yup.string().required().url().matches(['rss']);
  return schema
    .isValid(url)
    .then((isvalid) => {
      if (watchedState.rssUrls.includes(url)) {
        watchedState.uiState.inputForm.valid = false;
        watchedState.uiState.feedbackStatus = i18.t('feedbackExisting');
      } else if (isvalid) {
        watchedState.rssUrls.push(url);
        watchedState.uiState.inputForm.valid = true;
        watchedState.uiState.feedbackStatus = i18.t('feedbackSucсsess');
      } else {
        watchedState.uiState.inputForm.valid = false;
        watchedState.uiState.feedbackStatus = i18.t('feedbackNotValid');
      }
    })
    .catch((err) => {
      console.log('Your error is ', err);
    });
};

export default checkInputValid;
