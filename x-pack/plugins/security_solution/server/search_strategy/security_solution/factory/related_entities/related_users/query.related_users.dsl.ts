/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { ISearchRequestParams } from '@kbn/data-plugin/common';
import type { HostsRelatedUsersRequestOptions } from '../../../../../../common/search_strategy/security_solution/related_entities/related_users';

export const buildRelatedUsersQuery = ({
  hostName,
  defaultIndex,
  from,
}: HostsRelatedUsersRequestOptions): ISearchRequestParams => {
  const filter = [
    { term: { 'host.name': hostName } },
    { term: { 'event.category': 'authentication' } },
    { term: { 'event.outcome': 'success' } },
    {
      range: {
        '@timestamp': {
          gt: from,
          format: 'strict_date_optional_time',
        },
      },
    },
  ];

  const dslQuery = {
    allow_no_indices: true,
    index: defaultIndex,
    ignore_unavailable: true,
    track_total_hits: false,
    body: {
      aggregations: {
        user_count: { cardinality: { field: 'user.name' } },
        user_data: {
          terms: {
            field: 'user.name',
            size: 1000,
          },
          aggs: {
            ip: {
              terms: {
                field: 'host.ip',
                size: 10,
              },
            },
          },
        },
      },
      query: { bool: { filter } },
      size: 0,
    },
  };

  return dslQuery;
};
