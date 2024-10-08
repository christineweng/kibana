/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { InsightDistributionBar } from './insight_distribution_bar';

const title = 'test title';
const count = 10;
const testId = 'test-id';
const stats = [
  {
    key: 'passed',
    count: 90,
    color: 'green',
  },
  {
    key: 'failed',
    count: 10,
    color: 'red',
  },
];

describe('<InsightDistributionBar />', () => {
  it('should render', () => {
    const { getByTestId, getByText } = render(
      <InsightDistributionBar title={title} stats={stats} count={count} data-test-subj={testId} />
    );
    expect(getByTestId(testId)).toBeInTheDocument();
    expect(getByText(title)).toBeInTheDocument();
    expect(getByTestId(`${testId}-badge`)).toHaveTextContent(`${count}`);
    expect(getByTestId(`${testId}-distribution-bar`)).toBeInTheDocument();
  });
});
