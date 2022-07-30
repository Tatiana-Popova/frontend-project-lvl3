// ^(https|http):\/\/([\w.|\/])+(.rss$)

export const dangerInput = (state) => {
  state.elements.input.classList.add('is-invalid');
  state.elements.feedback.innerHTML = state.uiState.feedbackStatus;
  state.elements.feedback.classList.remove('text-success');
  state.elements.feedback.classList.add('text-danger');
  state.elements.inputForm.focus();
};

export const successInput = (state) => {
  state.elements.input.classList.remove('is-invalid');
  state.elements.feedback.innerHTML = state.uiState.feedbackStatus;
  state.elements.feedback.classList.remove('text-danger');
  state.elements.feedback.classList.add('text-success');
  state.elements.inputForm.reset();
  state.elements.inputForm.focus();
};
