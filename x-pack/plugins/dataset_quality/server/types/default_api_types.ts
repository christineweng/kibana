/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { isoToEpochRt } from '@kbn/io-ts-utils';
import * as t from 'io-ts';
import { dataStreamTypesRt } from '../../common/types';

export const typeRt = t.partial({
  type: dataStreamTypesRt,
});

export const rangeRt = t.type({
  start: isoToEpochRt,
  end: isoToEpochRt,
});
