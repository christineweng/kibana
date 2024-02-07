/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { FC } from 'react';
import React, { memo, useMemo } from 'react';
import { EuiSpacer } from '@elastic/eui';
import { startCase } from 'lodash';
import { i18n } from '@kbn/i18n';
import { FlyoutTitle } from '../../../shared/components/flyout_title';
import { DocumentSeverity } from './severity';
import { useBasicDataFromDetailsData } from '../../../../timelines/components/side_panel/event_details/helpers';
import { useRightPanelContext } from '../context';
import { PreferenceFormattedDate } from '../../../../common/components/formatted_date';
import { FLYOUT_EVENT_HEADER_TITLE_TEST_ID } from './test_ids';
import { getField } from '../../shared/utils';
import { EVENT_CATEGORY_TO_FIELD } from '../utils/event_utils';

/**
 * Event details flyout right section header
 */
export const EventHeaderTitle: FC = memo(() => {
  const { dataFormattedForFieldBrowser, getFieldsData } = useRightPanelContext();
  const { timestamp } = useBasicDataFromDetailsData(dataFormattedForFieldBrowser);

  const eventKind = getField(getFieldsData('event.kind'));
  const eventCategory = getField(getFieldsData('event.category'));

  const title = useMemo(() => {
    let eventTitle;
    if (eventKind === 'event' && eventCategory) {
      const fieldName = EVENT_CATEGORY_TO_FIELD[eventCategory];
      eventTitle = getField(getFieldsData(fieldName));
    } else if (eventKind && eventKind !== null) {
      eventTitle = startCase(eventKind);
    }
    return (
      eventTitle ??
      i18n.translate('xpack.securitySolution.flyout.right.title.eventTitle', {
        defaultMessage: 'Event details',
      })
    );
  }, [eventKind, getFieldsData, eventCategory]);

  return (
    <>
      <DocumentSeverity />
      <EuiSpacer size="m" />
      {timestamp && <PreferenceFormattedDate value={new Date(timestamp)} />}
      <EuiSpacer size="xs" />
      <FlyoutTitle
        title={title}
        iconType={'analyzeEvent'}
        data-test-subj={FLYOUT_EVENT_HEADER_TITLE_TEST_ID}
      />
    </>
  );
});

EventHeaderTitle.displayName = 'EventHeaderTitle';
