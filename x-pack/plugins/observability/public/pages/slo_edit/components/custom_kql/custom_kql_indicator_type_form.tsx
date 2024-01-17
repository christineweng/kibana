/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiCallOut, EuiFlexGroup, EuiFlexItem, EuiIconTip } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { ALL_VALUE } from '@kbn/slo-schema/src/schema/common';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useCreateDataView } from '../../../../hooks/use_create_data_view';
import { useFetchGroupByCardinality } from '../../../../hooks/slo/use_fetch_group_by_cardinality';
import { CreateSLOForm } from '../../types';
import { DataPreviewChart } from '../common/data_preview_chart';
import { IndexFieldSelector } from '../common/index_field_selector';
import { QueryBuilder } from '../common/query_builder';
import { IndexSelection } from '../custom_common/index_selection';

export function CustomKqlIndicatorTypeForm() {
  const { watch } = useFormContext<CreateSLOForm>();
  const index = watch('indicator.params.index');
  const timestampField = watch('indicator.params.timestampField');
  const groupByField = watch('groupBy');

  const { dataView, loading: isIndexFieldsLoading } = useCreateDataView({
    indexPatternString: index,
  });
  const timestampFields = dataView?.fields?.filter((field) => field.type === 'date') ?? [];
  const groupByFields = dataView?.fields?.filter((field) => field.aggregatable) ?? [];

  const { isLoading: isGroupByCardinalityLoading, data: groupByCardinality } =
    useFetchGroupByCardinality(index, timestampField, groupByField);

  return (
    <EuiFlexGroup direction="column" gutterSize="l">
      <EuiFlexGroup direction="row" gutterSize="l">
        <EuiFlexItem>
          <IndexSelection />
        </EuiFlexItem>

        <IndexFieldSelector
          indexFields={timestampFields}
          name="indicator.params.timestampField"
          label={i18n.translate('xpack.observability.slo.sloEdit.timestampField.label', {
            defaultMessage: 'Timestamp field',
          })}
          placeholder={i18n.translate(
            'xpack.observability.slo.sloEdit.timestampField.placeholder',
            { defaultMessage: 'Select a timestamp field' }
          )}
          isLoading={!!index && isIndexFieldsLoading}
          isDisabled={!index}
          isRequired
        />
      </EuiFlexGroup>

      <EuiFlexItem>
        <QueryBuilder
          dataTestSubj="customKqlIndicatorFormQueryFilterInput"
          indexPatternString={watch('indicator.params.index')}
          label={i18n.translate('xpack.observability.slo.sloEdit.sliType.customKql.queryFilter', {
            defaultMessage: 'Query filter',
          })}
          name="indicator.params.filter"
          placeholder={i18n.translate(
            'xpack.observability.slo.sloEdit.sliType.customKql.customFilter',
            { defaultMessage: 'Custom filter to apply on the index' }
          )}
          tooltip={
            <EuiIconTip
              content={i18n.translate(
                'xpack.observability.slo.sloEdit.sliType.customKql.customFilter.tooltip',
                {
                  defaultMessage:
                    'This KQL query can be used to filter the documents with some relevant criteria.',
                }
              )}
              position="top"
            />
          }
        />
      </EuiFlexItem>

      <EuiFlexItem>
        <QueryBuilder
          dataTestSubj="customKqlIndicatorFormGoodQueryInput"
          indexPatternString={watch('indicator.params.index')}
          label={i18n.translate('xpack.observability.slo.sloEdit.sliType.customKql.goodQuery', {
            defaultMessage: 'Good query',
          })}
          name="indicator.params.good"
          placeholder={i18n.translate(
            'xpack.observability.slo.sloEdit.sliType.customKql.goodQueryPlaceholder',
            {
              defaultMessage: 'Define the good events',
            }
          )}
          required
          tooltip={
            <EuiIconTip
              content={i18n.translate(
                'xpack.observability.slo.sloEdit.sliType.customKql.goodQuery.tooltip',
                {
                  defaultMessage:
                    'This KQL query should return a subset of events that are considered "good" or "successful" for the purpose of calculating the SLO. The query should filter events based on some relevant criteria, such as status codes, error messages, or other relevant fields.',
                }
              )}
              position="top"
            />
          }
        />
      </EuiFlexItem>

      <EuiFlexItem>
        <QueryBuilder
          dataTestSubj="customKqlIndicatorFormTotalQueryInput"
          indexPatternString={watch('indicator.params.index')}
          label={i18n.translate('xpack.observability.slo.sloEdit.sliType.customKql.totalQuery', {
            defaultMessage: 'Total query',
          })}
          name="indicator.params.total"
          placeholder={i18n.translate(
            'xpack.observability.slo.sloEdit.sliType.customKql.totalQueryPlaceholder',
            {
              defaultMessage: 'Define the total events',
            }
          )}
          tooltip={
            <EuiIconTip
              content={i18n.translate(
                'xpack.observability.slo.sloEdit.sliType.customKql.totalQuery.tooltip',
                {
                  defaultMessage:
                    'This KQL query should return all events that are relevant to the SLO calculation, including both good and bad events.',
                }
              )}
              position="top"
            />
          }
        />
      </EuiFlexItem>

      <IndexFieldSelector
        indexFields={groupByFields}
        name="groupBy"
        defaultValue={ALL_VALUE}
        label={
          <span>
            {i18n.translate('xpack.observability.slo.sloEdit.groupBy.label', {
              defaultMessage: 'Group by',
            })}{' '}
            <EuiIconTip
              content={i18n.translate('xpack.observability.slo.sloEdit.groupBy.tooltip', {
                defaultMessage: 'Create individual SLOs for each value of the selected field.',
              })}
              position="top"
            />
          </span>
        }
        placeholder={i18n.translate('xpack.observability.slo.sloEdit.groupBy.placeholder', {
          defaultMessage: 'Select an optional field to group by',
        })}
        isLoading={!!index && isIndexFieldsLoading}
        isDisabled={!index}
      />

      {!isGroupByCardinalityLoading && !!groupByCardinality && (
        <EuiCallOut
          size="s"
          iconType={groupByCardinality.isHighCardinality ? 'warning' : ''}
          color={groupByCardinality.isHighCardinality ? 'warning' : 'primary'}
          title={i18n.translate('xpack.observability.slo.sloEdit.groupBy.cardinalityInfo', {
            defaultMessage:
              "Selected group by field '{groupBy}' will generate at least {card} SLO instances based on the last 24h sample data.",
            values: { card: groupByCardinality.cardinality, groupBy: groupByField },
          })}
        />
      )}

      <DataPreviewChart />
    </EuiFlexGroup>
  );
}
