/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useEffect, useMemo } from 'react';
import type { inputsModel } from '../../../store';
import type { InspectResponse } from '../../../../types';
import { RelatedEntitiesQueries } from '../../../../../common/search_strategy/security_solution/related_entities';
import type { RelatedHost } from '../../../../../common/search_strategy/security_solution/related_entities/related_hosts';
import { useSearchStrategy } from '../../use_search_strategy';

export interface UsersRelatedHostsArgs {
  inspect: InspectResponse;
  totalCount: number;
  relatedHosts: RelatedHost[];
  refetch: inputsModel.Refetch;
}

interface UseUsersRelatedHosts {
  userName: string;
  indexNames: string[];
  from: string;
  skip?: boolean;
}

export const useUsersRelatedHosts = ({
  userName,
  indexNames,
  from,
  skip = false,
}: UseUsersRelatedHosts): [boolean, UsersRelatedHostsArgs] => {
  const {
    loading,
    result: response,
    search,
    refetch,
    inspect,
  } = useSearchStrategy<RelatedEntitiesQueries.relatedHosts>({
    factoryQueryType: RelatedEntitiesQueries.relatedHosts,
    initialResult: {
      totalCount: 0,
      relatedHosts: [],
    },
    errorMessage: 'error',
    abort: skip,
  });

  const userRelatedHostsResponse = useMemo(
    () => ({
      totalCount: response.totalCount,
      relatedHosts: response.relatedHosts,
      inspect,
      refetch,
    }),
    [inspect, refetch, response.totalCount, response.relatedHosts]
  );

  const userRelatedHostsRequest = useMemo(
    () => ({
      defaultIndex: indexNames,
      factoryQueryType: RelatedEntitiesQueries.relatedHosts,
      userName,
      from,
    }),
    [indexNames, from, userName]
  );

  useEffect(() => {
    if (!skip) {
      search(userRelatedHostsRequest);
    }
  }, [userRelatedHostsRequest, search, skip]);

  return [loading, userRelatedHostsResponse];
};
