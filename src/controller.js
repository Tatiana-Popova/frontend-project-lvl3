import * as yup from 'yup';
// import { setLocale } from 'yup';

const checkInputValid = async (i18, watchedState, e) => {
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
      watchedState.uiState.feedbackStatus = err.errors;
    });
};

export default checkInputValid;
