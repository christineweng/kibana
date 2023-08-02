/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  RULE_PREVIEW_BODY_TEST_ID,
  RULE_PREVIEW_ABOUT_HEADER_TEST_ID,
  RULE_PREVIEW_ABOUT_CONTENT_TEST_ID,
  RULE_PREVIEW_DEFINITION_HEADER_TEST_ID,
  RULE_PREVIEW_DEFINITION_CONTENT_TEST_ID,
  RULE_PREVIEW_SCHEDULE_HEADER_TEST_ID,
  RULE_PREVIEW_SCHEDULE_CONTENT_TEST_ID,
  RULE_PREVIEW_FOOTER_TEST_ID,
} from '../../../public/flyout/preview/components/test_ids';
import { getDataTestSubjectSelector } from '../../helpers/common';

export const DOCUMENT_DETAILS_FLYOUT_RULE_PREVIEW_SECTION =
  getDataTestSubjectSelector('previewSection');

export const DOCUMENT_DETAILS_FLYOUT_RULE_PREVIEW_HEADER =
  getDataTestSubjectSelector('previewSectionHeader');

export const DOCUMENT_DETAILS_FLYOUT_RULE_PREVIEW_BODY =
  getDataTestSubjectSelector(RULE_PREVIEW_BODY_TEST_ID);

export const DOCUMENT_DETAILS_FLYOUT_RULE_PREVIEW_ABOUT_SECTION_HEADER = getDataTestSubjectSelector(
  RULE_PREVIEW_ABOUT_HEADER_TEST_ID
);
export const DOCUMENT_DETAILS_FLYOUT_RULE_PREVIEW_ABOUT_SECTION_CONTENT =
  getDataTestSubjectSelector(RULE_PREVIEW_ABOUT_CONTENT_TEST_ID);

export const DOCUMENT_DETAILS_FLYOUT_RULE_PREVIEW_DEFINITION_SECTION_HEADER =
  getDataTestSubjectSelector(RULE_PREVIEW_DEFINITION_HEADER_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_RULE_PREVIEW_DEFINITION_SECTION_CONTENT =
  getDataTestSubjectSelector(RULE_PREVIEW_DEFINITION_CONTENT_TEST_ID);

export const DOCUMENT_DETAILS_FLYOUT_RULE_PREVIEW_SCHEDULE_SECTION_HEADER =
  getDataTestSubjectSelector(RULE_PREVIEW_SCHEDULE_HEADER_TEST_ID);
export const DOCUMENT_DETAILS_FLYOUT_RULE_PREVIEW_SCHEDULE_SECTION_CONTENT =
  getDataTestSubjectSelector(RULE_PREVIEW_SCHEDULE_CONTENT_TEST_ID);

export const DOCUMENT_DETAILS_FLYOUT_RULE_PREVIEW_FOOTER = getDataTestSubjectSelector(
  RULE_PREVIEW_FOOTER_TEST_ID
);
