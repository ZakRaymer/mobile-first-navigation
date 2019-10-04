import * as React from 'react';

import { Text, Button, View } from './Primitives';

const TopNav = (props) =>
  !props.navbarHidden && (
    <View
      style={{
        width: '100%',
        height: props.topNavHeight,
        justifyContent: 'space-between',
        flex: 1
      }}
    >
      {props.history.length === 1 ? (
        <View
          style={{
            position: 'absolute'
          }}
        />
      ) : (
        <View
          style={{
            textAlign: 'left',
            position: 'absolute'
          }}
        >
          <Button onClick={() => props.navigateBack()}>
            <Text
              style={{
                fontSize: 18,
                height: 0,
                lineHeight: `${props.topNavHeight}px`
              }}
            >
              {props.mode === 'modal' ? 'X' : '<'}
            </Text>
          </Button>
        </View>
      )}
      <View
        style={{
          textAlign: 'center'
        }}
      >
        <Text
          style={{
            lineHeight: `${props.topNavHeight}px`,
            height: 0
          }}
        >
          {props.routeTitle}
        </Text>
      </View>
    </View>
  );

export default TopNav;
