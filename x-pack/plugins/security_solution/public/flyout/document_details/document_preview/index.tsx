/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { FC } from 'react';
import React, { memo } from 'react';
import type { FlyoutPanelProps, PanelPath } from '@kbn/expandable-flyout';
import type { DocumentPreviewPanelKey } from '../shared/constants/panel_keys';
import { useDocumentPreviewPanelContext } from './context';
import { PanelNavigation } from './navigation';
import { PanelContent } from './content';
import { useFlyoutIsExpandable } from '../right/hooks/use_flyout_is_expandable';

export interface DocumentPreviewPanelProps extends FlyoutPanelProps {
  key: typeof DocumentPreviewPanelKey;
  path?: PanelPath;
  params?: {
    id: string;
    indexName: string;
    scopeId: string;
    title: string;
  };
}

/**
 * Panel to be displayed in the document details expandable flyout right section
 */
export const DocumentPreviewPanel: FC = memo(() => {
  const { dataAsNestedObject, getFieldsData } = useDocumentPreviewPanelContext();

  // if the flyout is expandable we render all 3 tabs (overview, table and json)
  // if the flyout is not, we render only table and json
  const flyoutIsExpandable = useFlyoutIsExpandable({ getFieldsData, dataAsNestedObject });

  return (
    <>
      <PanelNavigation flyoutIsExpandable={flyoutIsExpandable} />
      <PanelContent />
    </>
  );
});

DocumentPreviewPanel.displayName = 'DocumentPreviewPanel';
