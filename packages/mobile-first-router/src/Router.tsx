import * as React from 'react';

import { always, defaultTo } from 'ramda';

import {
  Wrapper,
  TabRouter,
  ContentArea,
  View
} from '@aloompa/mobile-first-components';

import { MFNavigationConfig } from './MFNavigationTypes';
import { AnimatedModalScreen } from './AnimatedModalScreen';
import { AnimatedScreen } from './AnimatedScreen';
import { getWidthAndHeight } from './util/getWidthAndHeight';
import { getTitle, getTitleFromCache } from './util/getTitle';
import routerActionsConfig, { getInitialState } from './routerActions';

const Router = (props: any) => {
  const { useState, useEffect } = React;
  const [state, routerActions] = routerActionsConfig(
    useState(getInitialState(props)),
    props
  );
  console.log('::props::', props);
  const [routes] = useState(initializeRoutes(props.routes));
  const { width, height } = getWidthAndHeight(props);
  const { history, isNavigatingBack } = state;

  const fullPackage = {
    ...props,
    ...state,
    ...routerActions
  };

  useEffect(() => {
    pushNewRoute({ ...fullPackage, routes });
  }, [history.length]);

  useEffect(() => {
    popCurrentRoute({ ...fullPackage, routes });
  }, [isNavigatingBack]);

  const poppedRoute = state.poppedRoute.route;

  return (
    <Wrapper>
      {props.renderTopNav({
        ...fullPackage,
        mode: 'screen',
        topNavHeight: defaultTo(52, props.topNavHeight),
        routeTitle: getTitle(fullPackage)
      })}
      <TabRouter
        barColor={defaultTo('#fff', props.tabBarColor)}
        activeTabIndex={state.activeTabIndex}
        setActiveTab={routerActions.setActiveTab}
        topTab={props.topTabBar}
        viewHeightReduction={
          state.tabRoutes.length > 1
            ? props.topNavHeight + 52
            : props.topNavHeight
        }
        tabButtons={props.tabs ? props.tabs.map((tab) => tab.button) : []}
        tabViews={state.tabRoutes.map(() => (
          <ContentArea>
            {history
              .filter((route) => {
                const routeConfig = routes[route.route];
                return routeConfig.mode !== 'modal';
              })
              .map((route, _index) => {
                const routeConfig = routes[route.route];
                const { Component } = routeConfig;
                return (
                  <View>
                    <AnimatedScreen
                      {...{
                        ...fullPackage,
                        width,
                        Component,
                        poppedRoute,
                        route
                      }}
                    />
                  </View>
                );
              })}
          </ContentArea>
        ))}
      />
      {history
        .filter((route) => {
          const routeConfig = routes[route.route];
          return routeConfig.mode === 'modal';
        })
        .map((route, _key) => {
          const routeConfig = routes[route.route];
          const routeConfigs = routes;
          const { Component } = routeConfig;
          return (
            <View>
              <AnimatedModalScreen
                {...{
                  ...fullPackage,
                  routeConfigs,
                  height,
                  Component,
                  getTitleFromCache,
                  route,
                  renderTopNav: props.renderTopNav
                }}
              />
            </View>
          );
        })}
    </Wrapper>
  );
};

const initializeRoutes = (routes) => {
  return Object.keys(routes).reduce((prev, key) => {
    const suppliedConfig = routes[key] || {};

    const routeConfig = {
      Component: routes[key].route,
      ...suppliedConfig
    };

    return {
      ...prev,
      [key]: routeConfig
    };
  }, {});
};

const pushNewRoute = (props) => {
  if (props.history.length > 1 && props.isNavigating) {
    return setTimeout(() => props.navigateComplete(), 300);
  } else {
    return;
  }
};

const popCurrentRoute = (props) => {
  if (props.history.length > 1 && props.isNavigatingBack) {
    return setTimeout(() => props.navigateBackComplete(), 140);
  } else {
    return;
  }
};

const renderTopNav = always(null);

const fillEmptyTitles = (config: MFNavigationConfig) =>
  defaultTo(
    config,
    Object.keys(config.routes).reduce(
      (total, key) => {
        if (!config.routes[key].getTitle || !config.routes[key].getTitle()) {
          return {
            ...total,
            routes: {
              ...total.routes,
              [key]: {
                ...config.routes[key],
                getTitle: always(' ')
              }
            }
          };
        } else {
          return {
            ...total,
            routes: {
              ...total.routes,
              [key]: { ...config.routes[key] }
            }
          };
        }
      },
      { ...config, routes: {} }
    )
  );

const createRoutes = (config: MFNavigationConfig) => {
  const configWithTitles = fillEmptyTitles(config);

  return (props) =>
    Router({
      ...props,
      ...{
        topNavHeight: defaultTo(50, configWithTitles.topNavHeight),
        renderTopNav,
        ...configWithTitles
      }
    });
};

export default createRoutes;
