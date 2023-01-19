/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { act, render } from '@testing-library/react';
import React from 'react';
import { TestProviders } from '../../../../../common/mock';
import { AlertsByType } from './alerts_by_type';

jest.mock('../../../../../common/lib/kibana');

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useLocation: jest.fn().mockReturnValue({ pathname: '' }) };
});

describe('Alert by type chart', () => {
  const defaultProps = {
    uniqueQueryId: 'test-query-id',
    signalIndexName: 'signalIndexName',
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('renders correctly', async () => {
    await act(async () => {
      const { container } = render(
        <TestProviders>
          <AlertsByType {...defaultProps} />
        </TestProviders>
      );
      expect(container.querySelector('[data-test-subj="alert-by-type"]')).toBeInTheDocument();
    });
  });

  test('render HeaderSection', async () => {
    await act(async () => {
      const { container } = render(
        <TestProviders>
          <AlertsByType {...defaultProps} />
        </TestProviders>
      );
      expect(container.querySelector(`[data-test-subj="header-section"]`)).toBeInTheDocument();
    });
  });

  test('inspect button renders correctly', async () => {
    await act(async () => {
      const { container } = render(
        <TestProviders>
          <AlertsByType {...defaultProps} />
        </TestProviders>
      );
      expect(container.querySelector('[data-test-subj="inspect-icon-button"]')).toBeInTheDocument();
    });
  });

  test('health and pallette display renders correctly', async () => {
    await act(async () => {
      const { container } = render(
        <TestProviders>
          <AlertsByType {...defaultProps} />
        </TestProviders>
      );
      expect(
        container.querySelector('[data-test-subj="alert-by-type-palette-display"]')
      ).toBeInTheDocument();
    });
  });

  test('table renders correctly', async () => {
    await act(async () => {
      const { container } = render(
        <TestProviders>
          <AlertsByType {...defaultProps} />
        </TestProviders>
      );
      expect(container.querySelector('[data-test-subj="alert-by-type-table"]')).toBeInTheDocument();
    });
  });
});
