import { MFNavigationConfig } from './MFNavigationTypes';

export default (config: {
  initialTabRoutes?: string[];
  routeConfig: MFNavigationConfig;
  adapter?: {
    getRoute: Function;
    setRoute: Function;
  };
}) => {
  const navigateBack = () => {};

  const setRoute = (state, routeData) => {
    if (state.isNavigating) {
      return state.destinations.find(
        ({ route }) => route == routeData.route
      ) === undefined
        ? { ...state, destinations: [...state.destinations, routeData] }
        : state;
    }

    const history = [...state.history, routeData];
    const tabRoute = [...state.tabRoutes[state.activeTab], routeData];
    if (config.adapter) {
      config.adapter.setRoute(routeData);
    }

    return {
      ...state,
      isNavigating: true,
      history,
      destinations: [...state.destinations, routeData],
      tabRoutes: state.tabRoutes.map((route, index) =>
        index === state.activeTab ? tabRoute : route
      )
    };
  };

  return {
    navigateBack,
    setRoute
  };
};
