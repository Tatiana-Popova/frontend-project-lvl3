const renderFeedsContainer = (state) => {
  state.elements.feedsContainer.textContent = '';
  const feedCard = document.createElement('div');
  const feedCardBody = document.createElement('div');
  const feedCardTitle = document.createElement('h2');
  const feedsUl = document.createElement('ul');

  feedCard.classList.add('card', 'border-0');
  feedCardBody.classList.add('card-body');
  feedCardTitle.classList.add('card-title', 'h4');
  feedsUl.classList.add('list-group', 'border-0', 'rounded-0');
  feedsUl.setAttribute('id', 'feedUl');
  feedCardBody.append(feedCardTitle);
  feedCardTitle.textContent = 'Фиды';
  feedCard.append(feedCardBody, feedsUl);
  state.elements.feedsContainer.append(feedCard);
};

const renderFeedItem = (feed) => {
  const feedLi = document.createElement('li');
  const feedTitle = document.createElement('h3');
  const feedDescription = document.createElement('p');
  const feedsUl = document.querySelector('#feedUl');
  feedLi.classList.add('list-group-item', 'border-0', 'border-end-0');
  feedTitle.classList.add('h6', 'm-0');
  feedDescription.classList.add('m-0', 'small', 'text-black-50');
  feedTitle.textContent = feed.feedTitle;
  feedDescription.textContent = feed.feedDescription;
  feedLi.append(feedTitle);
  feedLi.append(feedDescription);
  feedsUl.prepend(feedLi);
};

const renderFeeds = (state) => {
  renderFeedsContainer(state);
  state.feeds.forEach((feed) => {
    renderFeedItem(feed);
  });
};
const renderPostsContainer = (state) => {
  state.elements.postsContainer.textContent = '';
  const postCard = document.createElement('div');
  const postCardBody = document.createElement('div');
  const postCardTitle = document.createElement('h2');
  const postsUl = document.createElement('ul');

  postCard.classList.add('card', 'border-0');
  postCardBody.classList.add('card-body');
  postCardTitle.classList.add('card-title', 'h4');
  postsUl.classList.add('list-group', 'border-0', 'rounded-0');
  postsUl.setAttribute('id', 'postsUl');
  postCardTitle.textContent = 'Посты';
  postCard.append(postCardBody, postsUl);
  postCardBody.append(postCardTitle);
  state.elements.postsContainer.append(postCard);
};

const renderPostItem = (post, type, state) => {
  const postLi = document.createElement('li');
  const postHref = document.createElement('a');
  const postButton = document.createElement('button');
  const postsUl = document.querySelector('#postsUl');
  postHref.setAttribute('href', post.itemLink);
  postLi.classList.add(
    'list-group-item',
    'd-flex',
    'justify-content-between',
    'align-items-start',
    'border-0',
    'border-end-0',
  );
  if (state.viewedPostLinks.includes(post.itemLink)) {
    postHref.classList.add('fw-normal');
  } else {
    postHref.classList.add('fw-bold');
  }
  postButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  postHref.textContent = post.itemTitle;
  postButton.textContent = 'Просмотр';

  postLi.append(postHref, postButton);
  if (type === 'new') {
    postsUl.prepend(postLi);
  } else {
    postsUl.append(postLi);
  }
};

const renderPosts = (state) => {
  renderPostsContainer(state);
  state.posts
    .filter((a, b) => (a.pubDate < b.pubDate ? 1 : -1))
    .flat()
    .forEach((post) => {
      renderPostItem(post, 'old', state);
    });
};

export const renderNewPosts = (state) => {
  if (state.uiState.newPostsToUpload.flat().length === 0) {
    return;
  }
  state.uiState.newPostsToUpload
    .flat()
    .reverse()
    .forEach((item) => {
      renderPostItem(item, 'new', state);
    });
};

export const renderContent = (state) => {
  const { feeds } = state.uiState;
  if (feeds.status === 'loadingSourcePosts' || feeds.status === 'updatingViewedPosts') {
    renderFeeds(state);
    renderPosts(state);
  } else if (feeds.status === 'loadingNewPosts') {
    renderNewPosts(state);
  }
};

export const renderFeedback = (state, i18) => {
  const errorMessage = state.uiState.inputForm.status;
  const feedbackText = i18.t(errorMessage);
  state.elements.feedback.textContent = feedbackText;

  if (state.uiState.inputForm.valid) {
    state.elements.input.classList.remove('is-invalid');
    state.elements.feedback.classList.remove('text-danger');
    state.elements.feedback.classList.add('text-success');
    state.elements.inputForm.reset();
  } else {
    state.elements.input.classList.add('is-invalid');
    state.elements.feedback.classList.remove('text-success');
    state.elements.feedback.classList.add('text-danger');
  }
  state.elements.inputForm.focus();
};

const findPostByLink = (url, state) => {
  const posts = state.posts[0].filter((post) => post.itemLink === url);
  return posts[0];
};

export const renderModal = (state) => {
  const body = document.querySelector('body');
  const href = state.uiState.clickedLink;
  const post = findPostByLink(href, state);
  const modalTitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');
  const modal = document.querySelector('#modal');
  const a = document.querySelector('.full-article');
  a.href = href;

  if (state.uiState.clickedLink) {
    const backdrop = document.createElement('div');
    backdrop.classList.add('modal-backdrop', 'show');
    body.append(backdrop);
    body.classList.add('modal-open');
    modal.removeAttribute('aria-hidden');
    modal.setAttribute('style', 'display: block');
    modal.setAttribute('aria-modal', 'true');
    modal.classList.add('show');
    modalTitle.textContent = post.itemTitle;
    modalBody.textContent = post.itemDescription;
  } else {
    const backdrop = document.querySelector('.modal-backdrop');
    body.removeChild(backdrop);
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('style', 'display: none');
    modal.setAttribute('aria-modal', 'false');
    modal.classList.remove('show');
  }
};
