import * as React from 'react';

import { View } from './Primitives';

const ContentArea = (props) => (
  <View
    style={{
      flex: 1,
      height: '100%',
      position: 'relative'
    }}
  >
    {props.children}
  </View>
);

export default ContentArea;
