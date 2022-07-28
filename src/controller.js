import * as yup from 'yup';

const checkInputValid = async (state, e) => {
  const formData = new FormData(e.target);
  const url = formData.get('url');

  const schema = yup.string().required().url().matches(['rss']);
  // console.log(await schema.isValid(url));
  return schema
    .isValid(url)
    .then((isvalid) => {
      watchedState.uiState.inputForm.valid = isvalid;
    })
    .catch((err) => {
      console.log('Your error is ', err);
    });
};

export default checkInputValid;
