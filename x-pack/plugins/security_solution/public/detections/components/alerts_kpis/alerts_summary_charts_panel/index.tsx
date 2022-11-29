/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiFlexGroup, EuiFlexItem, EuiPanel, EuiTitle } from '@elastic/eui';
import React, { useMemo, useCallback, useState, useEffect } from 'react';
import type { MappingRuntimeFields } from '@elastic/elasticsearch/lib/api/types';
import type { Filter, Query } from '@kbn/es-query';
import uuid from 'uuid';
import * as i18n from './translations';
import { KpiPanel } from '../common/components';
import { HeaderSection } from '../../../../common/components/header_section';
import { useQueryToggle } from '../../../../common/containers/query_toggle';
import { useSeverityChartData } from './use_severity_chart_data';
import { SeverityLevelChart } from './severity_level_chart';

const DETECTIONS_ALERTS_CHARTS_ID = 'detections-alerts-charts';

const PlaceHolder = ({ title }: { title: string }) => {
  return (
    <EuiFlexItem>
      <EuiPanel>
        <EuiTitle size="xs">
          <h4>{title}</h4>
        </EuiTitle>
      </EuiPanel>
    </EuiFlexItem>
  );
};

interface Props {
  alignHeader?: 'center' | 'baseline' | 'stretch' | 'flexStart' | 'flexEnd';
  filters?: Filter[];
  panelHeight?: number;
  query?: Query;
  signalIndexName: string | null;
  title?: React.ReactNode;
  runtimeMappings?: MappingRuntimeFields;
}

export const AlertsSummaryChartsPanel: React.FC<Props> = ({
  alignHeader,
  filters,
  panelHeight,
  query,
  runtimeMappings,
  signalIndexName,
  title = i18n.CHARTS_TITLE,
}: Props) => {
  // create a unique, but stable (across re-renders) query id
  const uniqueQueryId = useMemo(() => `${DETECTIONS_ALERTS_CHARTS_ID}-${uuid.v4()}`, []);

  const { toggleStatus, setToggleStatus } = useQueryToggle(DETECTIONS_ALERTS_CHARTS_ID);
  const [querySkip, setQuerySkip] = useState(!toggleStatus);
  useEffect(() => {
    setQuerySkip(!toggleStatus);
  }, [toggleStatus]);
  const toggleQuery = useCallback(
    (status: boolean) => {
      setToggleStatus(status);
      // toggle on = skipQuery false
      setQuerySkip(!status);
    },
    [setQuerySkip, setToggleStatus]
  );

  const { items: severityData, isLoading } = useSeverityChartData({
    filters,
    query,
    signalIndexName,
    runtimeMappings,
    skip: querySkip,
    uniqueQueryId,
  });

  return (
    <KpiPanel
      $toggleStatus={toggleStatus}
      data-test-subj="alertsChartsPanel"
      hasBorder
      height={panelHeight}
    >
      <HeaderSection
        alignHeader={alignHeader}
        outerDirection="row"
        title={title}
        titleSize="s"
        hideSubtitle
        showInspectButton={false}
        toggleStatus={toggleStatus}
        toggleQuery={toggleQuery}
      />
      {toggleStatus && (
        <EuiFlexGroup data-test-subj="chartsPanel">
          <PlaceHolder title={'Detections'} />
          <SeverityLevelChart
            data={severityData}
            isLoading={isLoading}
            uniqueQueryId={uniqueQueryId}
          />
          <PlaceHolder title={'Alert by host type'} />
        </EuiFlexGroup>
      )}
    </KpiPanel>
  );
};

AlertsSummaryChartsPanel.displayName = 'AlertsSummaryChartsPanel';
