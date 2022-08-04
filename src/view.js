export const dangerInput = (state) => {
  state.elements.input.classList.add('is-invalid');
  state.elements.feedback.textContent = state.uiState.feedbackStatus;
  state.elements.feedback.classList.remove('text-success');
  state.elements.feedback.classList.add('text-danger');
  state.elements.inputForm.focus();
};

export const successInput = (state) => {
  state.elements.input.classList.remove('is-invalid');
  state.elements.feedback.textContent = state.uiState.feedbackStatus;
  state.elements.feedback.classList.remove('text-danger');
  state.elements.feedback.classList.add('text-success');
  state.elements.inputForm.reset();
  state.elements.inputForm.focus();
};

const renderFeeds = (state) => {
  state.elements.feedsContainer.textContent = '';
  state.elements.feedCard = document.createElement('div');
  state.elements.feedCard.classList.add('card', 'border-0');
  state.elements.feedCardBody = document.createElement('div');
  state.elements.feedCardBody.classList.add('card-body');
  state.elements.feedCardTitle = document.createElement('h2');
  state.elements.feedCardTitle.classList.add('card-title', 'h4');
  state.elements.feedsUl = document.createElement('ul');
  state.elements.feedsUl.classList.add('list-group', 'border-0', 'rounded-0');

  state.elements.feedCardBody.append(state.elements.feedCardTitle);
  state.elements.feedCardTitle.textContent = 'Фиды';

  state.elements.feedCard.append(state.elements.feedCardBody, state.elements.feedsUl);
  state.elements.feedsContainer.append(state.elements.feedCard);
  state.feeds.forEach((feed) => {
    state.elements.feedLi = document.createElement('li');
    state.elements.feedTitle = document.createElement('h3');
    state.elements.feedDescription = document.createElement('p');
    state.elements.feedLi.classList.add('list-group-item', 'border-0', 'border-end-0');
    state.elements.feedTitle.classList.add('h6', 'm-0');
    state.elements.feedDescription.classList.add('m-0', 'small', 'text-black-50');
    state.elements.feedTitle.textContent = feed.feedTitle;
    state.elements.feedDescription.textContent = feed.feedDescription;
    state.elements.feedsUl.append(state.elements.feedLi);
    state.elements.feedLi.append(state.elements.feedTitle);
    state.elements.feedLi.append(state.elements.feedDescription);
  });
};
const renderPosts = (state) => {
  state.elements.postsContainer.textContent = '';
  state.elements.postCard = document.createElement('div');
  state.elements.postCardBody = document.createElement('div');
  state.elements.postCardTitle = document.createElement('h2');
  state.elements.postsUl = document.createElement('ul');
  state.elements.postCard.classList.add('card', 'border-0');
  state.elements.postCardBody.classList.add('card-body');
  state.elements.postCardTitle.classList.add('card-title', 'h4');
  state.elements.postsUl.classList.add('list-group', 'border-0', 'rounded-0');
  state.elements.postCardTitle.textContent = 'Посты';

  state.elements.postsContainer.append(state.elements.postCard);
  state.elements.postCard.append(state.elements.postCardBody, state.elements.postsUl);
  state.elements.postCardBody.append(state.elements.postCardTitle);
  state.posts.flat().forEach((post) => {
    state.elements.postLi = document.createElement('li');
    state.elements.postHref = document.createElement('a');
    state.elements.postButton = document.createElement('button');
    state.elements.postHref.setAttribute('href', post.itemLink);
    state.elements.postLi.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );
    state.elements.postHref.classList.add('fw-bold');
    state.elements.postButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    state.elements.postHref.textContent = post.itemTitle;
    state.elements.postButton.textContent = 'Просмотр';

    state.elements.postLi.append(state.elements.postHref, state.elements.postButton);
    state.elements.postsUl.append(state.elements.postLi);
  });
};

export const renderContent = (state) => {
  renderFeeds(state);
  renderPosts(state);
};
