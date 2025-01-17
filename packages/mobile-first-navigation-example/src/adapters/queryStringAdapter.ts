import { compose, fromPairs, map, path, split, tail } from 'ramda';

declare let global: any;

const getQueryString = compose(
  fromPairs,
  map(split('=')),
  split('&'),
  tail
);

const getUrlState = ({ route, params }) => {
  const queryString = {
    ...getQueryString(path(['document', 'location', 'search'], global)),
    route,
    params: urlencode(params)
  };

  if (queryString.route === 'Home') {
    delete queryString.route;
  }

  return Object.keys(queryString)
    .filter((key) => queryString[key])
    .reduce((prev, key, i) => {
      return `${prev}${i ? '&' : '?'}${key}=${queryString[key]}`;
    }, `${window.location.origin}${window.location.pathname}`);
};

const urlencode = (params) => {
  const url = btoa(JSON.stringify(params));

  return url;
};

const setRoute = (action) => {
  try {
    window.history.replaceState(null, 'Router', getUrlState(action));
  } catch (_e) {}
};

const urldecode = (str) => {
  try {
    return atob(str);
  } catch (_e) {
    return str;
  }
};

const getRoute = (initialRoute) => {
  const queryString = getQueryString(
    path(['document', 'location', 'search'], global)
  );

  if (!queryString.route || queryString.route === initialRoute) {
    return [];
  }

  const params = urldecode(queryString.params || '{}')
    .replace(/%22/g, '"')
    .replace(/%7B/g, '{')
    .replace(/%7D/g, '}');

  let queryParams = {};

  try {
    queryParams = JSON.parse(params);
  } catch (_err) {}

  return [
    {
      route: queryString.route,
      params: queryParams
    }
  ];
};

const queryStringAdapter = {
  setRoute,
  getRoute
};

export default queryStringAdapter;
