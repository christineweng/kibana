/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';
import { EuiHealth, EuiText, EuiProgress } from '@elastic/eui';
import type { EuiBasicTableColumn } from '@elastic/eui';
import type { Severity } from '@kbn/securitysolution-io-ts-alerting-types';
import { capitalize } from 'lodash';
import { ALERT_SEVERITY, ALERT_RULE_NAME } from '@kbn/rule-data-utils';
import { DefaultDraggable } from '../../../../common/components/draggables';
import { SEVERITY_COLOR } from '../../../../overview/components/detection_response/utils';
import { FormattedCount } from '../../../../common/components/formatted_number';
import * as i18n from './translations';
import type { DetectionsData, AlertType, HostData } from './types';
import type { SeverityBuckets as SeverityData } from '../../../../overview/components/detection_response/alerts_by_status/types';
import { ALERTS_HEADERS_RULE } from '../../alerts_table/translations';
import { EVENT_TYPE_COLOUR } from './helpers';

export const getSeverityTableColumns = (): Array<EuiBasicTableColumn<SeverityData>> => [
  {
    field: 'key',
    name: i18n.SEVERITY_LEVEL_COLUMN_TITLE,
    'data-test-subj': 'severityTable-severity',
    render: (severity: Severity) => (
      <EuiHealth color={SEVERITY_COLOR[severity]} textSize="xs">
        <DefaultDraggable
          isDraggable={false}
          field={ALERT_SEVERITY}
          hideTopN
          id={`alert-severity-draggable-${severity}`}
          value={capitalize(severity)}
          queryValue={severity}
          tooltipContent={null}
        />
      </EuiHealth>
    ),
  },
  {
    field: 'value',
    name: i18n.COUNT_COULMN_TITLE,
    sortable: true,
    dataType: 'number',
    'data-test-subj': 'severityTable-alertCount',
    render: (alertCount: number) => (
      <EuiText grow={false} size="xs">
        <FormattedCount count={alertCount} />
      </EuiText>
    ),
  },
];

export const getDetectionsTableColumns = (): Array<EuiBasicTableColumn<DetectionsData>> => [
  {
    field: 'rule',
    name: ALERTS_HEADERS_RULE,
    'data-test-subj': 'detectionsTable-rule',
    render: (rule: string) => (
      <EuiText grow={false} size="xs">
        <DefaultDraggable
          isDraggable={false}
          field={ALERT_RULE_NAME}
          hideTopN={true}
          id={`alert-detection-draggable-${rule}`}
          value={rule}
          queryValue={rule}
          tooltipContent={null}
        />
      </EuiText>
    ),
  },
  {
    field: 'type',
    name: i18n.DETECTIONS_TYPE_COLUMN_TITLE,
    'data-test-subj': 'detectionsTable-type',
    render: (type: string) => (
      <EuiHealth color={EVENT_TYPE_COLOUR[type as AlertType]}>
        <EuiText grow={false} size="xs">
          <DefaultDraggable
            isDraggable={false}
            field={ALERT_RULE_NAME}
            hideTopN={true}
            id={`alert-detection-draggable-${type}`}
            value={type}
            queryValue={type}
            tooltipContent={null}
          />
        </EuiText>
      </EuiHealth>
    ),
  },
  {
    field: 'value',
    name: i18n.COUNT_COULMN_TITLE,
    dataType: 'number',
    'data-test-subj': 'detectionsTable-count',
    render: (count: number) => (
      <EuiText grow={false} size="xs">
        <FormattedCount count={count} />
      </EuiText>
    ),
    width: '20%',
  },
];

export const getHostTableColumns = (): Array<EuiBasicTableColumn<HostData>> => [
  {
    name: ALERTS_HEADERS_RULE,
    'data-test-subj': 'hostTable-host',
    render: ({ key, value }: { key: string; value: number }) => (
      <EuiProgress
        max={100}
        color={`vis9`}
        size="s"
        valueText={true}
        value={value}
        label={
          <DefaultDraggable
            isDraggable={false}
            field={'host.name'}
            hideTopN={true}
            id={`alert-host-table-${key}`}
            value={key}
            queryValue={key}
            tooltipContent={null}
          />
        }
      />
    ),
    height: '100%',
  },
  {
    field: 'value',
    name: i18n.COUNT_COULMN_TITLE,
    dataType: 'number',
    'data-test-subj': 'hostTable-count',
    render: (count: number) => (
      <EuiText grow={false} size="xs">
        <FormattedCount count={count} />
      </EuiText>
    ),
    width: '20%',
  },
];
