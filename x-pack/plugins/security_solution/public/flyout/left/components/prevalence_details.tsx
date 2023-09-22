/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import dateMath from '@elastic/datemath';
import React, { useMemo, useState } from 'react';
import type { EuiBasicTableColumn, OnTimeChangeProps } from '@elastic/eui';
import {
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiLink,
  EuiPanel,
  EuiSpacer,
  EuiSuperDatePicker,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import { FormattedCount } from '../../../common/components/formatted_number';
import { useLicense } from '../../../common/hooks/use_license';
import { InvestigateInTimelineButton } from '../../../common/components/event_details/table/investigate_in_timeline_button';
import type { PrevalenceData } from '../../shared/hooks/use_prevalence';
import { usePrevalence } from '../../shared/hooks/use_prevalence';
import { FlyoutLoading } from '../../shared/components/flyout_loading';
import {
  PREVALENCE_DETAILS_LOADING_TEST_ID,
  PREVALENCE_DETAILS_TABLE_ALERT_COUNT_CELL_TEST_ID,
  PREVALENCE_DETAILS_TABLE_DOC_COUNT_CELL_TEST_ID,
  PREVALENCE_DETAILS_TABLE_HOST_PREVALENCE_CELL_TEST_ID,
  PREVALENCE_DETAILS_TABLE_VALUE_CELL_TEST_ID,
  PREVALENCE_DETAILS_TABLE_FIELD_CELL_TEST_ID,
  PREVALENCE_DETAILS_TABLE_USER_PREVALENCE_CELL_TEST_ID,
  PREVALENCE_DETAILS_DATE_PICKER_TEST_ID,
  PREVALENCE_DETAILS_TABLE_TEST_ID,
  PREVALENCE_DETAILS_UPSELL_TEST_ID,
} from './test_ids';
import { useLeftPanelContext } from '../context';
import {
  getDataProvider,
  getDataProviderAnd,
} from '../../../common/components/event_details/table/use_action_cell_data_provider';
import { getEmptyTagValue } from '../../../common/components/empty_value';
import { IS_OPERATOR } from '../../../../common/types';

export const PREVALENCE_TAB_ID = 'prevalence-details';
const DEFAULT_FROM = 'now-30d';
const DEFAULT_TO = 'now';

interface PrevalenceDetailsRow extends PrevalenceData {
  /**
   * From datetime selected in the date picker to pass to timeline
   */
  from: string;
  /**
   * To datetime selected in the date picker to pass to timeline
   */
  to: string;
}

const columns: Array<EuiBasicTableColumn<PrevalenceDetailsRow>> = [
  {
    field: 'field',
    name: (
      <FormattedMessage
        id="xpack.securitySolution.flyout.left.insights.prevalence.fieldColumnLabel"
        defaultMessage="Field"
      />
    ),
    'data-test-subj': PREVALENCE_DETAILS_TABLE_FIELD_CELL_TEST_ID,
    render: (field: string) => <EuiText size="xs">{field}</EuiText>,
    width: '20%',
  },
  {
    field: 'value',
    name: (
      <FormattedMessage
        id="xpack.securitySolution.flyout.left.insights.prevalence.valueColumnLabel"
        defaultMessage="Value"
      />
    ),
    'data-test-subj': PREVALENCE_DETAILS_TABLE_VALUE_CELL_TEST_ID,
    render: (value: string) => <EuiText size="xs">{value}</EuiText>,
    width: '20%',
  },
  {
    name: (
      <EuiToolTip
        content={
          <FormattedMessage
            id="xpack.securitySolution.flyout.left.insights.prevalence.alertCountColumnTooltip"
            defaultMessage="Total number of alerts with identical field value pairs."
          />
        }
      >
        <EuiFlexGroup direction="column" gutterSize="none">
          <EuiFlexItem>
            <FormattedMessage
              id="xpack.securitySolution.flyout.left.insights.prevalence.alertCountColumnLabel"
              defaultMessage="Alert"
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <FormattedMessage
              id="xpack.securitySolution.flyout.left.insights.prevalence.alertCountColumnCountLabel"
              defaultMessage="count"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiToolTip>
    ),
    'data-test-subj': PREVALENCE_DETAILS_TABLE_ALERT_COUNT_CELL_TEST_ID,
    render: (data: PrevalenceDetailsRow) => {
      const dataProviders = [
        getDataProvider(data.field, `timeline-indicator-${data.field}-${data.value}`, data.value),
      ];
      return data.alertCount > 0 ? (
        <InvestigateInTimelineButton
          asEmptyButton={true}
          dataProviders={dataProviders}
          filters={[]}
          timeRange={{ kind: 'absolute', from: data.from, to: data.to }}
        >
          <FormattedCount count={data.alertCount} />
        </InvestigateInTimelineButton>
      ) : (
        getEmptyTagValue()
      );
    },
    width: '10%',
  },
  {
    name: (
      <EuiToolTip
        content={
          <FormattedMessage
            id="xpack.securitySolution.flyout.left.insights.prevalence.documentCountColumnTooltip"
            defaultMessage="Total number of event documents with identical field value pairs."
          />
        }
      >
        <EuiFlexGroup direction="column" gutterSize="none">
          <EuiFlexItem>
            <FormattedMessage
              id="xpack.securitySolution.flyout.left.insights.prevalence.documentCountColumnLabel"
              defaultMessage="Document"
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <FormattedMessage
              id="xpack.securitySolution.flyout.left.insights.prevalence.documentCountColumnCountLabel"
              defaultMessage="count"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiToolTip>
    ),
    'data-test-subj': PREVALENCE_DETAILS_TABLE_DOC_COUNT_CELL_TEST_ID,
    render: (data: PrevalenceDetailsRow) => {
      const dataProviders = [
        {
          ...getDataProvider(
            data.field,
            `timeline-indicator-${data.field}-${data.value}`,
            data.value
          ),
          and: [
            getDataProviderAnd(
              'event.kind',
              `timeline-indicator-event.kind-not-signal`,
              'signal',
              IS_OPERATOR,
              true
            ),
          ],
        },
      ];
      return data.docCount > 0 ? (
        <InvestigateInTimelineButton
          asEmptyButton={true}
          dataProviders={dataProviders}
          filters={[]}
          timeRange={{ kind: 'absolute', from: data.from, to: data.to }}
          keepDataView // changing dataview from only detections to include non-alerts docs
        >
          <FormattedCount count={data.docCount} />
        </InvestigateInTimelineButton>
      ) : (
        getEmptyTagValue()
      );
    },
    width: '10%',
  },
  {
    field: 'hostPrevalence',
    name: (
      <EuiToolTip
        content={
          <FormattedMessage
            id="xpack.securitySolution.flyout.left.insights.prevalence.hostPrevalenceColumnTooltip"
            defaultMessage="Percentage of unique hosts with identical field value pairs."
          />
        }
      >
        <EuiFlexGroup direction="column" gutterSize="none">
          <EuiFlexItem>
            <FormattedMessage
              id="xpack.securitySolution.flyout.left.insights.prevalence.hostPrevalenceColumnLabel"
              defaultMessage="Host"
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <FormattedMessage
              id="xpack.securitySolution.flyout.left.insights.prevalence.hostPrevalenceColumnCountLabel"
              defaultMessage="prevalence"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiToolTip>
    ),
    'data-test-subj': PREVALENCE_DETAILS_TABLE_HOST_PREVALENCE_CELL_TEST_ID,
    render: (hostPrevalence: number) => (
      <EuiText size="xs">{`${Math.round(hostPrevalence * 100)}%`}</EuiText>
    ),
    width: '10%',
  },
  {
    field: 'userPrevalence',
    name: (
      <EuiToolTip
        content={
          <FormattedMessage
            id="xpack.securitySolution.flyout.left.insights.prevalence.userPrevalenceColumnTooltip"
            defaultMessage="Percentage of unique users with identical field value pairs."
          />
        }
      >
        <EuiFlexGroup direction="column" gutterSize="none">
          <EuiFlexItem>
            <FormattedMessage
              id="xpack.securitySolution.flyout.left.insights.prevalence.userPrevalenceColumnLabel"
              defaultMessage="User"
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <FormattedMessage
              id="xpack.securitySolution.flyout.left.insights.prevalence.userPrevalenceColumnCountLabel"
              defaultMessage="prevalence"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiToolTip>
    ),
    'data-test-subj': PREVALENCE_DETAILS_TABLE_USER_PREVALENCE_CELL_TEST_ID,
    render: (userPrevalence: number) => (
      <EuiText size="xs">{`${Math.round(userPrevalence * 100)}%`}</EuiText>
    ),
    width: '10%',
  },
];

/**
 * Prevalence table displayed in the document details expandable flyout left section under the Insights tab
 */
export const PrevalenceDetails: React.FC = () => {
  const { dataFormattedForFieldBrowser, investigationFields } = useLeftPanelContext();

  const isPlatinumPlus = useLicense().isPlatinumPlus();

  // these two are used by the usePrevalence hook to fetch the data
  const [start, setStart] = useState(DEFAULT_FROM);
  const [end, setEnd] = useState(DEFAULT_TO);

  // these two are used to pass to timeline
  const [absoluteStart, setAbsoluteStart] = useState(
    (dateMath.parse(DEFAULT_FROM) || new Date()).toISOString()
  );
  const [absoluteEnd, setAbsoluteEnd] = useState(
    (dateMath.parse(DEFAULT_TO) || new Date()).toISOString()
  );

  // TODO update the logic to use a single set of start/end dates
  //  currently as we're using this InvestigateInTimelineButton component we need to pass the timeRange
  //  as an AbsoluteTimeRange, which requires from/to values
  const onTimeChange = ({ start: s, end: e, isInvalid }: OnTimeChangeProps) => {
    if (isInvalid) return;

    setStart(s);
    setEnd(e);

    const from = dateMath.parse(s);
    if (from && from.isValid()) {
      setAbsoluteStart(from.toISOString());
    }

    const to = dateMath.parse(e);
    if (to && to.isValid()) {
      setAbsoluteEnd(to.toISOString());
    }
  };

  const { loading, error, data } = usePrevalence({
    dataFormattedForFieldBrowser,
    investigationFields,
    interval: {
      from: start,
      to: end,
    },
  });

  // add timeRange to pass it down to timeline
  const items = useMemo(
    () => data.map((item) => ({ ...item, from: absoluteStart, to: absoluteEnd })),
    [data, absoluteStart, absoluteEnd]
  );

  if (loading) {
    return <FlyoutLoading size="xxl" data-test-subj={PREVALENCE_DETAILS_LOADING_TEST_ID} />;
  }

  const upsell = (
    <>
      <EuiCallOut data-test-subj={PREVALENCE_DETAILS_UPSELL_TEST_ID}>
        <FormattedMessage
          id="xpack.securitySolution.flyout.left.insights.prevalence.tableAlertUpsellDescription"
          defaultMessage="Preview of a {subscription} feature showing host and user prevalence."
          values={{
            subscription: (
              <EuiLink href="https://www.elastic.co/pricing/" target="_blank">
                <FormattedMessage
                  id="xpack.securitySolution.flyout.left.insights.prevalence.tableAlertUpsellLinkText"
                  defaultMessage="Platinum"
                />
              </EuiLink>
            ),
          }}
        />
      </EuiCallOut>
      <EuiSpacer size="s" />
    </>
  );

  return (
    <>
      {!error && !isPlatinumPlus && upsell}
      <EuiPanel>
        <EuiSuperDatePicker
          start={start}
          end={end}
          onTimeChange={onTimeChange}
          data-test-subj={PREVALENCE_DETAILS_DATE_PICKER_TEST_ID}
          width="full"
        />
        <EuiSpacer size="m" />
        {data.length > 0 ? (
          <EuiInMemoryTable
            items={items}
            columns={columns}
            data-test-subj={PREVALENCE_DETAILS_TABLE_TEST_ID}
          />
        ) : (
          <FormattedMessage
            id="xpack.securitySolution.flyout.left.insights.prevalence.noDataDescription"
            defaultMessage="No prevalence data available."
          />
        )}
      </EuiPanel>
    </>
  );
};

PrevalenceDetails.displayName = 'PrevalenceDetails';
