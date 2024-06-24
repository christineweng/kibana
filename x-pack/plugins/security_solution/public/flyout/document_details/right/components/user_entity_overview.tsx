/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useMemo } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLink,
  useEuiTheme,
  useEuiFontSize,
  EuiSkeletonText,
} from '@elastic/eui';
import { css } from '@emotion/css';
import { getOr } from 'lodash/fp';
import { i18n } from '@kbn/i18n';
import { useExpandableFlyoutApi } from '@kbn/expandable-flyout';
import { useIsExperimentalFeatureEnabled } from '../../../../common/hooks/use_experimental_features';
import { DocumentDetailsLeftPanelKey } from '../../shared/constants/panel_keys';
import { LeftPanelInsightsTab } from '../../left';
import { ENTITIES_TAB_ID } from '../../left/components/entities_details';
import { useDocumentDetailsContext } from '../../shared/context';
import type { DescriptionList } from '../../../../../common/utility_types';
import { getField } from '../../shared/utils';
import { CellActions } from './cell_actions';
import {
  FirstLastSeen,
  FirstLastSeenType,
} from '../../../../common/components/first_last_seen/first_last_seen';
import { buildUserNamesFilter, RiskScoreEntity } from '../../../../../common/search_strategy';
import { getEmptyTagValue } from '../../../../common/components/empty_value';
import { DescriptionListStyled } from '../../../../common/components/page';
import { OverviewDescriptionList } from '../../../../common/components/overview_description_list';
import { RiskScoreLevel } from '../../../../entity_analytics/components/severity/common';
import { useSourcererDataView } from '../../../../sourcerer/containers';
import { useGlobalTime } from '../../../../common/containers/use_global_time';
import { useRiskScore } from '../../../../entity_analytics/api/hooks/use_risk_score';

import {
  USER_DOMAIN,
  LAST_SEEN,
  USER_RISK_LEVEL,
} from '../../../../overview/components/user_overview/translations';
import {
  ENTITIES_USER_OVERVIEW_TEST_ID,
  ENTITIES_USER_OVERVIEW_DOMAIN_TEST_ID,
  ENTITIES_USER_OVERVIEW_LAST_SEEN_TEST_ID,
  ENTITIES_USER_OVERVIEW_RISK_LEVEL_TEST_ID,
  ENTITIES_USER_OVERVIEW_LINK_TEST_ID,
  ENTITIES_USER_OVERVIEW_LOADING_TEST_ID,
} from './test_ids';
import { useObservedUserDetails } from '../../../../explore/users/containers/users/observed_details';
import { RiskScoreDocTooltip } from '../../../../overview/components/common';
import { UserPreviewPanelKey } from '../../../entity_details/user_right';

const USER_ICON = 'user';

export interface UserEntityOverviewProps {
  /**
   * User name for looking up user related ip addresses and risk level
   */
  userName: string;
}

export const USER_PREVIEW_BANNER = {
  title: i18n.translate('xpack.securitySolution.flyout.right.user.userPreviewTitle', {
    defaultMessage: 'Preview user',
  }),
  backgroundColor: 'warning',
  textColor: 'warning',
};

/**
 * User preview content for the entities preview in right flyout. It contains ip addresses and risk level
 */
export const UserEntityOverview: React.FC<UserEntityOverviewProps> = ({ userName }) => {
  const { eventId, indexName, scopeId, isPreviewMode } = useDocumentDetailsContext();
  const { openLeftPanel, openPreviewPanel } = useExpandableFlyoutApi();

  const isPreviewEnabled = useIsExperimentalFeatureEnabled('entityAlertPreviewEnabled');

  const goToEntitiesTab = useCallback(() => {
    openLeftPanel({
      id: DocumentDetailsLeftPanelKey,
      path: { tab: LeftPanelInsightsTab, subTab: ENTITIES_TAB_ID },
      params: {
        id: eventId,
        indexName,
        scopeId,
      },
    });
  }, [eventId, openLeftPanel, indexName, scopeId]);

  const openUserPreview = useCallback(() => {
    openPreviewPanel({
      id: UserPreviewPanelKey,
      params: {
        userName,
        scopeId,
        banner: USER_PREVIEW_BANNER,
      },
    });
  }, [openPreviewPanel, userName, scopeId]);

  const { from, to } = useGlobalTime();
  const { selectedPatterns } = useSourcererDataView();

  const timerange = useMemo(
    () => ({
      from,
      to,
    }),
    [from, to]
  );

  const filterQuery = useMemo(
    () => (userName ? buildUserNamesFilter([userName]) : undefined),
    [userName]
  );
  const [isUserDetailsLoading, { userDetails }] = useObservedUserDetails({
    endDate: to,
    userName,
    indexNames: selectedPatterns,
    startDate: from,
  });

  const {
    data: userRisk,
    isAuthorized,
    loading: isRiskScoreLoading,
  } = useRiskScore({
    filterQuery,
    riskEntity: RiskScoreEntity.user,
    timerange,
  });

  const userDomainValue = useMemo(
    () => getField(getOr([], 'user.domain', userDetails)),
    [userDetails]
  );
  const userDomain: DescriptionList[] = useMemo(
    () => [
      {
        title: USER_DOMAIN,
        description: userDomainValue ? (
          <CellActions field={'user.domain'} value={userDomainValue}>
            {userDomainValue}
          </CellActions>
        ) : (
          getEmptyTagValue()
        ),
      },
    ],
    [userDomainValue]
  );

  const userLastSeen: DescriptionList[] = useMemo(
    () => [
      {
        title: LAST_SEEN,
        description: (
          <FirstLastSeen
            indexPatterns={selectedPatterns}
            field={'user.name'}
            value={userName}
            type={FirstLastSeenType.LAST_SEEN}
          />
        ),
      },
    ],
    [userName, selectedPatterns]
  );

  const { euiTheme } = useEuiTheme();
  const xsFontSize = useEuiFontSize('xs').fontSize;

  const [userRiskLevel] = useMemo(() => {
    const userRiskData = userRisk && userRisk.length > 0 ? userRisk[0] : undefined;

    return [
      {
        title: (
          <EuiFlexGroup alignItems="flexEnd" gutterSize="none" responsive={false}>
            <EuiFlexItem grow={false}>{USER_RISK_LEVEL}</EuiFlexItem>
            <EuiFlexItem grow={false}>
              <RiskScoreDocTooltip riskScoreEntity={RiskScoreEntity.user} />
            </EuiFlexItem>
          </EuiFlexGroup>
        ),
        description: (
          <>
            {userRiskData ? (
              <RiskScoreLevel severity={userRiskData.user.risk.calculated_level} />
            ) : (
              getEmptyTagValue()
            )}
          </>
        ),
      },
    ];
  }, [userRisk]);

  return (
    <EuiFlexGroup
      direction="column"
      gutterSize="s"
      responsive={false}
      data-test-subj={ENTITIES_USER_OVERVIEW_TEST_ID}
    >
      <EuiFlexItem>
        <EuiFlexGroup gutterSize="m" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiIcon type={USER_ICON} />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            {!isPreviewMode ? (
              <EuiLink
                data-test-subj={ENTITIES_USER_OVERVIEW_LINK_TEST_ID}
                css={css`
                  font-size: ${xsFontSize};
                  font-weight: ${euiTheme.font.weight.bold};
                `}
                onClick={isPreviewEnabled ? openUserPreview : goToEntitiesTab}
              >
                {userName}
              </EuiLink>
            ) : (
              <>{userName}</>
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiFlexItem>
        {isUserDetailsLoading || isRiskScoreLoading ? (
          <EuiSkeletonText
            contentAriaLabel={i18n.translate(
              'xpack.securitySolution.flyout.right.insights.entities.userLoadingAriaLabel',
              { defaultMessage: 'user overview' }
            )}
            data-test-subj={ENTITIES_USER_OVERVIEW_LOADING_TEST_ID}
          />
        ) : (
          <EuiFlexGroup responsive={false}>
            <EuiFlexItem>
              <OverviewDescriptionList
                dataTestSubj={ENTITIES_USER_OVERVIEW_DOMAIN_TEST_ID}
                descriptionList={userDomain}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              {isAuthorized ? (
                <DescriptionListStyled
                  data-test-subj={ENTITIES_USER_OVERVIEW_RISK_LEVEL_TEST_ID}
                  listItems={[userRiskLevel]}
                />
              ) : (
                <OverviewDescriptionList
                  dataTestSubj={ENTITIES_USER_OVERVIEW_LAST_SEEN_TEST_ID}
                  descriptionList={userLastSeen}
                />
              )}
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
