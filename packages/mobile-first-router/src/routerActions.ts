import { last, defaultTo, path } from 'ramda';
import {
  MFNavigationConfig,
  MFNavigationHistoryRoute,
  MFNavigationTab
} from './MFNavigationTypes';

export const getInitialState = (config: {
  initialTabRoutes?: string[];
  routeConfig: MFNavigationConfig;
  adapter?: {
    getRoute: Function;
    setRoute: Function;
  };
}) => {
  const initialRoute: MFNavigationHistoryRoute = {
    route: path(['initialRoute'], config)
  };
  const tabs: Array<MFNavigationTab> = defaultTo([], path(['tabs'], config));
  const tabRoutes: Array<Array<MFNavigationHistoryRoute>> =
    tabs.length > 0
      ? tabs.map((tab: MFNavigationTab) => [{ route: tab.initial }])
      : [[initialRoute]];

  const activeTabIndex = defaultTo(0, path(['initialActiveTab'], config));

  const history: Array<MFNavigationHistoryRoute> = tabRoutes[activeTabIndex];

  return {
    navbarHidden: false,
    isNavigating: false,
    destinations: [],
    isNavigatingBack: false,
    titleCache: {},
    routeToPop: '',
    history,
    poppedRoute: { route: '' },
    activeTabIndex,
    isModal: false,
    tabRoutes
  };
};

export default (
  stateHooks: any[],
  config: {
    adapter?: {
      getRoute: Function;
      setRoute: Function;
    };
  }
) => {
  const [state, setState] = stateHooks;

  const resetNavigation = () => {
    setState({
      ...state,
      history: [state.history[0], last(state.history)],
      tabRoutes: state.tabRoutes.map((route, index) =>
        index === state.activeTab ? [route[0], last(route)] : route
      ),
      isNavigatingBack: true
    });
  };

  const navigateBack = () => {
    setState({
      ...state,
      routeToPop: state.history[state.history.length - 1],
      isNavigatingBack: true
    });
  };

  const navigateBackComplete = () => {
    const history = [...state.tabRoutes[state.activeTabIndex]];

    const poppedRoute = history.pop();

    const updatedTabRoutes = state.tabRoutes.reduce(
      (current, route, index) => [
        ...current,
        index === state.activeTabIndex ? history : route
      ],
      []
    );

    if (config.adapter) {
      const currentRoute = history[history.length - 1];
      config.adapter.setRoute(currentRoute);
    }

    setState({
      ...state,
      poppedRoute,
      isNavigatingBack: false,
      history: history.slice(),
      tabRoutes: updatedTabRoutes
    });
  };

  const setRoute = (routeData) => {
    if (state.isNavigating) {
      const routeIsDestination = !!state.destinations.find(
        ({ route }) => route == routeData.route
      );
      if (!routeIsDestination) {
        setState({
          ...state,
          destinations: [...state.destinations, routeData]
        });
      }
      return;
    }

    const history = [...state.history, routeData];
    const tabRoute = [...state.tabRoutes[state.activeTabIndex], routeData];
    if (config.adapter) {
      config.adapter.setRoute(routeData);
    }

    setState({
      ...state,
      isNavigating: true,
      history,
      destinations: [...state.destinations, routeData],
      tabRoutes: state.tabRoutes.map((route, index) =>
        index === state.activeTabIndex ? tabRoute : route
      )
    });
  };

  const navigateComplete = () => {
    const newDestinations = state.destinations.slice(1);
    if (state.destinations.length > 1) {
      if (config.adapter) {
        config.adapter.setRoute(newDestinations[0]);
      }

      setState({
        ...state,
        poppedRoute: { route: '' },
        isNavigating: true,
        history: [...state.history, newDestinations[0]],
        destinations: newDestinations
      });

      return;
    }

    setState({
      ...state,
      isNavigating: false,
      destinations: newDestinations
    });
  };

  const setTitleCache = (titleCache) => {
    setState({
      ...state,
      titleCache: {
        ...state.titleCache,
        ...titleCache
      }
    });
  };

  const setNavbarHidden = (hide) => {
    setState({
      ...state,
      navbarHidden: hide
    });
  };

  const setActiveTab = (tabIndex) => {
    if (state.isNavigating || state.isNavigatingBack) {
      return;
    }

    setState({
      ...state,
      activeTabIndex: tabIndex,
      history: state.tabRoutes[tabIndex]
    });
  };

  return [
    stateHooks[0],
    {
      resetNavigation,
      navigateBack,
      navigateBackComplete,
      navigateComplete,
      setActiveTab,
      setRoute,
      setNavbarHidden,
      setTitleCache
    }
  ];
};
