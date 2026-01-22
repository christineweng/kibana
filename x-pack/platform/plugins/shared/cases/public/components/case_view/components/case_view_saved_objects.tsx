/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { useMemo, useCallback, useState, useEffect } from 'react';

import { EuiFlexItem, EuiFlexGroup, EuiBasicTable, EuiText, EuiLink } from '@elastic/eui';
import type { Criteria } from '@elastic/eui';
import { i18n } from '@kbn/i18n';

import type { CaseUI, ExternalReferenceAttachmentUI } from '../../../../common/ui/types';
import { AttachmentType, ExternalReferenceStorageType } from '../../../../common/types/domain';
import { useKibana } from '../../../common/lib/kibana';

interface SavedObjectMetadata {
  title?: string;
  inAppUrl?: { path: string };
}

interface SavedObjectAttachment {
  id: string;
  soType: string;
  externalReferenceId: string;
  createdAt: string;
  createdBy: {
    username: string | null | undefined;
    fullName: string | null | undefined;
    email: string | null | undefined;
  };
  title?: string;
  inAppUrl?: string;
}

const isExternalReferenceSOAttachment = (
  attachment: CaseUI['comments'][number]
): attachment is ExternalReferenceAttachmentUI => {
  return (
    attachment.type === AttachmentType.externalReference &&
    'externalReferenceStorage' in attachment &&
    attachment.externalReferenceStorage?.type === ExternalReferenceStorageType.savedObject &&
    Boolean(attachment.externalReferenceStorage?.soType) &&
    Boolean(attachment.externalReferenceId)
  );
};

interface CaseViewSavedObjectsProps {
  caseData: CaseUI;
  searchTerm?: string;
  isLoading?: boolean;
}

export const CaseViewSavedObjects = ({
  caseData,
  searchTerm,
  isLoading = false,
}: CaseViewSavedObjectsProps) => {
  const { application, http } = useKibana().services;
  const [paginationState, setPaginationState] = useState({ pageIndex: 0, pageSize: 10 });
  const [savedObjectsMetadata, setSavedObjectsMetadata] = useState<
    Record<string, SavedObjectMetadata>
  >({});

  const savedObjectAttachmentsBase: Array<{
    id: string;
    soType: string;
    externalReferenceId: string;
    createdAt: string;
    createdBy: {
      username: string | null | undefined;
      fullName: string | null | undefined;
      email: string | null | undefined;
    };
  }> = useMemo(() => {
    const attachments = caseData.comments || [];
    const filtered = attachments.filter(isExternalReferenceSOAttachment);

    // Apply search term filter if provided
    const searchFiltered = searchTerm
      ? filtered.filter((attachment) => {
          const storage = attachment.externalReferenceStorage;
          const soType =
            storage &&
            'soType' in storage &&
            storage.type === ExternalReferenceStorageType.savedObject
              ? storage.soType
              : '';
          const id = attachment.externalReferenceId || '';
          const searchLower = searchTerm.toLowerCase();
          return (
            soType.toLowerCase().includes(searchLower) || id.toLowerCase().includes(searchLower)
          );
        })
      : filtered;

    return searchFiltered.map((attachment) => {
      const storage = attachment.externalReferenceStorage;
      const soType =
        storage && 'soType' in storage && storage.type === ExternalReferenceStorageType.savedObject
          ? storage.soType
          : '';
      const externalReferenceId = attachment.externalReferenceId;
      if (!soType || !externalReferenceId) {
        // This should not happen due to type guard, but TypeScript needs this
        throw new Error('Invalid saved object attachment');
      }
      return {
        id: attachment.id,
        soType,
        externalReferenceId,
        createdAt: attachment.createdAt,
        createdBy: attachment.createdBy,
      };
    });
  }, [caseData.comments, searchTerm]);

  // Fetch saved object metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      const metadataMap: Record<string, SavedObjectMetadata> = {};
      const uniqueObjects = new Map<string, { type: string; id: string }>();

      savedObjectAttachmentsBase.forEach((attachment) => {
        const key = `${attachment.soType}:${attachment.externalReferenceId}`;
        if (!uniqueObjects.has(key)) {
          uniqueObjects.set(key, {
            type: attachment.soType,
            id: attachment.externalReferenceId,
          });
        }
      });

      if (uniqueObjects.size === 0) {
        return;
      }

      try {
        const objectsToFetch = Array.from(uniqueObjects.values());
        const response = await http.post<
          Array<{
            id: string;
            type: string;
            meta?: SavedObjectMetadata;
            attributes?: { title?: string };
            error?: { statusCode: number; message: string };
          }>
        >('/api/kibana/management/saved_objects/_bulk_get', {
          body: JSON.stringify(objectsToFetch),
        });

        response.forEach((obj) => {
          const key = `${obj.type}:${obj.id}`;
          if (obj.error) {
            // If we can't fetch the saved object, use the ID as fallback
            metadataMap[key] = {
              title: obj.id,
            };
          } else {
            metadataMap[key] = {
              title: obj.meta?.title || obj.attributes?.title || obj.id,
              inAppUrl: obj.meta?.inAppUrl,
            };
          }
        });
      } catch (error) {
        // If bulk fetch fails, fall back to using IDs as titles
        uniqueObjects.forEach(({ type, id }) => {
          const key = `${type}:${id}`;
          metadataMap[key] = {
            title: id,
          };
        });
      }

      setSavedObjectsMetadata(metadataMap);
    };

    if (savedObjectAttachmentsBase.length > 0) {
      fetchMetadata();
    }
  }, [savedObjectAttachmentsBase, http]);

  const savedObjectAttachments: SavedObjectAttachment[] = useMemo(() => {
    return savedObjectAttachmentsBase.map((attachment) => {
      const key = `${attachment.soType}:${attachment.externalReferenceId}`;
      const metadata = savedObjectsMetadata[key];
      return {
        ...attachment,
        title: metadata?.title || attachment.externalReferenceId,
        inAppUrl: metadata?.inAppUrl?.path,
      };
    });
  }, [savedObjectAttachmentsBase, savedObjectsMetadata]);

  const handleRowClick = useCallback(
    (savedObject: SavedObjectAttachment) => {
      // Use inAppUrl if available, otherwise fall back to management page
      const url = savedObject.inAppUrl
        ? savedObject.inAppUrl
        : `/app/management/kibana/objects/${savedObject.soType}/${savedObject.externalReferenceId}`;
      application.navigateToUrl(http.basePath.prepend(url));
    },
    [application, http.basePath]
  );

  const columns = useMemo(
    () => [
      {
        field: 'soType',
        name: i18n.translate('xpack.cases.caseView.savedObjects.table.typeColumn', {
          defaultMessage: 'Type',
        }),
        width: '150px',
        'data-test-subj': 'savedObjectsTableRowType',
      },
      {
        field: 'title',
        name: i18n.translate('xpack.cases.caseView.savedObjects.table.titleColumn', {
          defaultMessage: 'Title',
        }),
        'data-test-subj': 'savedObjectsTableRowTitle',
        render: (title: string, item: SavedObjectAttachment) => {
          if (item.inAppUrl) {
            return (
              <EuiLink
                href={http.basePath.prepend(item.inAppUrl)}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  handleRowClick(item);
                }}
                data-test-subj={`savedObjectsTableRowLink-${item.externalReferenceId}`}
              >
                {title}
              </EuiLink>
            );
          }
          return (
            <EuiText
              size="s"
              data-test-subj={`savedObjectsTableRowTitle-${item.externalReferenceId}`}
            >
              {title}
            </EuiText>
          );
        },
      },
      {
        field: 'createdAt',
        name: i18n.translate('xpack.cases.caseView.savedObjects.table.createdAtColumn', {
          defaultMessage: 'Created',
        }),
        width: '200px',
        'data-test-subj': 'savedObjectsTableRowCreatedAt',
        render: (date: string) => new Date(date).toLocaleString(),
      },
    ],
    [handleRowClick, http.basePath]
  );

  const onTableChange = useCallback(({ page }: Criteria<SavedObjectAttachment>) => {
    if (page) {
      setPaginationState({
        pageIndex: page.index,
        pageSize: page.size,
      });
    }
  }, []);

  const pagination = useMemo(
    () => ({
      pageIndex: paginationState.pageIndex,
      pageSize: paginationState.pageSize,
      totalItemCount: savedObjectAttachments.length,
      pageSizeOptions: [10, 25, 50],
      showPerPageOptions: true,
    }),
    [paginationState.pageIndex, paginationState.pageSize, savedObjectAttachments.length]
  );

  const paginatedItems = useMemo(() => {
    const startIndex = paginationState.pageIndex * paginationState.pageSize;
    const endIndex = startIndex + paginationState.pageSize;
    return savedObjectAttachments.slice(startIndex, endIndex);
  }, [savedObjectAttachments, paginationState.pageIndex, paginationState.pageSize]);

  if (savedObjectAttachments.length === 0 && !isLoading) {
    return (
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiText color="subdued" data-test-subj="case-view-saved-objects-empty">
            {i18n.translate('xpack.cases.caseView.savedObjects.empty', {
              defaultMessage: 'No saved objects attached to this case',
            })}
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  return (
    <EuiFlexGroup>
      <EuiFlexItem>
        <div data-test-subj="case-view-saved-objects-table">
          <EuiBasicTable
            loading={isLoading}
            itemId="id"
            items={paginatedItems}
            columns={columns}
            pagination={pagination}
            onChange={onTableChange}
            rowProps={(item) => ({
              'data-test-subj': `savedObjectsTableRow row-${item.externalReferenceId}`,
            })}
            tableCaption={i18n.translate('xpack.cases.caseView.savedObjects.table.caption', {
              defaultMessage: 'Saved objects attached to this case',
            })}
          />
        </div>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

CaseViewSavedObjects.displayName = 'CaseViewSavedObjects';
