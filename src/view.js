// ^(https|http):\/\/([\w.|\/])+(.rss$)

const addRedFrame = (watchedState) => {
  watchedState.elements.input.classList.add('is-invalid');
};

export default addRedFrame;
