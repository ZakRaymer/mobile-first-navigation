import * as React from 'react';
import { View } from './Primitives';

const TabRouter = (props: {
  barColor: string;
  activeTabIndex: number;
  setActiveTab: any;
  topTab?: boolean;
  tabButtons: any[];
  tabViews: any[];
  viewHeightReduction: number;
}) => {
  const tabBar = (
    <View
      style={{
        backgroundColor: props.barColor,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 52
      }}
    >
      {props.tabButtons.map((button, index) =>
        button(props.activeTabIndex === index, () => props.setActiveTab(index))
      )}
    </View>
  );

  const tabView = (
    <View style={{ height: `Calc(100vh - ${props.viewHeightReduction}px` }}>
      {props.tabViews[props.activeTabIndex]}
    </View>
  );

  const view = [tabBar, tabView];

  return <View>{props.topTab ? view : view.reverse()}</View>;
};

export default TabRouter;
