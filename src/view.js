const renderFeedsContainer = () => {
  const feedsContainer = document.querySelector('.feeds');
  feedsContainer.textContent = '';
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
  feedsContainer.append(feedCard);
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
const renderPostsContainer = () => {
  const postsContainer = document.querySelector('.posts');
  postsContainer.textContent = '';
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
  postsContainer.append(postCard);
};

const renderPostItem = (post, type, state, i18) => {
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
  if (state.viewedPostLinks.has(post.itemLink)) {
    postHref.classList.add('fw-normal');
  } else {
    postHref.classList.add('fw-bold');
  }
  postButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  postButton.setAttribute('data-bs-dismiss', 'modal');
  postButton.setAttribute('data-bs-toggle', 'modal');
  postButton.setAttribute('data-bs-target', '#modal');

  postHref.textContent = post.itemTitle;
  postButton.textContent = i18.t('view');

  postLi.append(postHref, postButton);
  if (type === 'new') {
    postsUl.prepend(postLi);
  } else {
    postsUl.append(postLi);
  }
};

const renderPosts = (state, i18) => {
  renderPostsContainer(state);
  state.posts
    .flat()
    .sort((a, b) => {
      const aDate = new Date(a.pubDate);
      const bDate = new Date(b.pubDate);
      return (aDate < bDate ? 1 : -1);
    })
    .forEach((post) => {
      renderPostItem(post, 'old', state, i18);
    });
};

export const renderNewPosts = (state, i18) => {
  if (state.uiState.newPostsToUpload.flat().length === 0) {
    return;
  }
  state.uiState.newPostsToUpload
    .flat()
    .reverse()
    .forEach((item) => {
      renderPostItem(item, 'new', state, i18);
    });
};

export const renderContent = (state, i18) => {
  const { status } = state.uiState.inputForm;
  if (status === 'successDownload' || status === 'markAsRead') {
    renderFeeds(state);
    renderPosts(state, i18);
  }
};

export const renderFeedback = (state, i18) => {
  const feedback = document.querySelector('.feedback');
  const errorMessage = state.uiState.inputForm.feedback;
  const feedbackText = i18.t(errorMessage);
  feedback.textContent = feedbackText;
  const input = document.querySelector('#url-input');
  const inputForm = document.querySelector('.rss-form');

  if (state.uiState.inputForm.valid) {
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    inputForm.reset();
  } else {
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
  }
  inputForm.focus();
};

const findPostByLink = (url, state) => {
  const posts = state.posts.flat().filter((post) => post.itemLink === url);
  return posts[0];
};

export const renderModal = (state) => {
  const href = state.uiState.clickedLink;
  const post = findPostByLink(href, state);
  const modalTitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');
  const a = document.querySelector('.full-article');
  a.href = href;
  modalTitle.textContent = post.itemTitle;
  modalBody.textContent = post.itemDescription;
};
