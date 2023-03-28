/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import type { Story } from '@storybook/react';
import type { LeftPanelContext } from '../context';
import { LeftFlyoutContext } from '../context';
import { AnalyzeGraph } from './analyze_graph';

export default {
  component: AnalyzeGraph,
  title: 'Flyout/AnalyzeGraph',
};

// TODO to get this working, we need to spent some time getting all the foundation items for storybook
//  (ReduxStoreProvider, CellActionsProvider...) similarly to how it was done for the TestProvidersComponent
//  see ticket https://github.com/elastic/security-team/issues/6223
// export const Default: Story<void> = () => {
//   const contextValue = {
//     eventId: 'some_id',
//   } as unknown as LeftPanelContext;

//   return (
//     <LeftFlyoutContext.Provider value={contextValue}>
//       <AnalyzeGraph />
//     </LeftFlyoutContext.Provider>
//   );
// };

export const Error: Story<void> = () => {
  const contextValue = {
    eventId: null,
  } as unknown as LeftPanelContext;

  return (
    <LeftFlyoutContext.Provider value={contextValue}>
      <AnalyzeGraph />
    </LeftFlyoutContext.Provider>
  );
};
