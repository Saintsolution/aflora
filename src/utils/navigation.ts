export function scrollToId(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({
      behavior: 'smooth',
    });
}

export function navigateTo(target: string) {
  if (target.startsWith('#')) {
    scrollToId(target.slice(1));
    return;
  }

  window.history.pushState(
    {},
    '',
    target
  );

  window.dispatchEvent(
    new PopStateEvent('popstate')
  );
}