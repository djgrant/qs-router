import $ from 'jquery';
import url from 'url';
import qs from 'querystring';

var FN = function () {};
export var $events = $('<div/>');
export var history = {};

/**
 * Triggers a routechange event if the user
 * triggers a window navigation event
 */
$(window).on('popstate', function (e) {
  pushHistory({
    route: qs.parse(location.search.substring(1)),
    state: e.state
  });
  $events.trigger('routechange', history);
});

/**
 * Triggers a routechange event
 * @param  {String} route
 * @param  {Object} state
 */
export function navigate(route, state=true) {
  var stateObj = { [route]: state };
  var _url = appendQuery(stateObj);
  var previousURL = parseUrl(location);

  if (history.route === route) return;

  pushHistory({ route, state, previousURL });

  if (window.history.pushState) {
    window.history.pushState(stateObj,'', _url);
  }

  $events.trigger('routechange', history);
}

/**
 * Navigates back to previous history state
 * either with pushState or a url-less fallback
 */
export function back() {
  if (window.history.pushState) {
    window.history.back();
  }
  else {
    pushHistory({
      route: history.previousRoute,
      state: history.previousState
    });
    $events.trigger('routechange', history);
  }
}

/**
 * Registers a callbacks object to a route
 * route('modal', onEnter, onExit);
 * route('modal=signin', onEnter, onExit);
 * @param  {String} route to be registered. Accepts route or route=param
 * @param  {Function} enter callback to execute when navigating to route
 * @param  {Function} exit callback to execute when navigating away from route
 */
export function register(route, enter, exit=FN) {
  route = route.split('=');

  $events.on('routechange', function onRouteChange(jqe, e) {
    if (route[0] === e.route) {
      if (route.length < 2 || route[1] === e.state) {
        enter(e.state);
      }
    }
    if (route[0] === e.previousRoute) {
      if (route.length < 2 || route[1] === e.previousState) {
        exit(e.previousState);
      }
    }
  });
}

/**
 * Updates history, with an object comprising the old and new history objects
 * @param  {Object} oldHistory The current history
 * @param  {Object} newHistory The new history
 * @return {Object} A new history object
 */
export function pushHistory(newHistory) {
  newHistory.previousRoute = history.route;
  newHistory.previousState = history.state;
  history = newHistory;
}

/**
 * @param  {String} queryKey
 * @param  {Object} urlObj A location like object
 * @return {String} The current url with the query removed
 */
export function removeQuery(queryKey, _url=location) {
  var urlObj = parseUrl(_url);
  var query = qs.parse(urlObj.search.substring(1));
  delete query[queryKey];
  return replaceQuery(query, urlObj);
}

/**
 * @param  {Object} query
 * @param  {Object} urlObj A location like object
 * @return {String} The current url with the query appended
 */
export function appendQuery(query, _url=location) {
  var urlObj = parseUrl(_url);
  var mergedQuery = Object.assign(
    qs.parse(urlObj.search.substring(1)),
    query
  );
  return replaceQuery(mergedQuery, urlObj);
}

/**
 * @param  {Object} query
 * @param  {Object} urlObj A location like object
 * @return {String} The current url with the new query instead
 */
export function replaceQuery(query, _url=location) {
  var urlObj = parseUrl(_url);
  var newQS = qs.stringify(query);
  var newLocation = Object.assign({}, urlObj, { search: newQS });
  return url.format(newLocation);
}

export function parseUrl(_url) {
  return typeof _url === 'string' ? url.parse(_url) : _url;
}
