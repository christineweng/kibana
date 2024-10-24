/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/*
 * NOTICE: Do not edit this file manually.
 * This file is automatically generated by the OpenAPI Generator, @kbn/openapi-generator.
 *
 * info:
 *   title: Common Entities Schemas
 *   version: 1
 */

import { z } from '@kbn/zod';

import { EntityRiskScoreRecord } from '../../common/common.gen';
import { AssetCriticalityLevel } from '../../asset_criticality/common.gen';

export type UserEntity = z.infer<typeof UserEntity>;
export const UserEntity = z.object({
  '@timestamp': z.string().datetime(),
  entity: z.object({
    name: z.string(),
    source: z.string(),
  }),
  user: z.object({
    full_name: z.array(z.string()).optional(),
    domain: z.array(z.string()).optional(),
    roles: z.array(z.string()).optional(),
    name: z.string(),
    id: z.array(z.string()).optional(),
    email: z.array(z.string()).optional(),
    hash: z.array(z.string()).optional(),
    risk: EntityRiskScoreRecord.optional(),
  }),
  asset: z
    .object({
      criticality: AssetCriticalityLevel,
    })
    .optional(),
});

export type HostEntity = z.infer<typeof HostEntity>;
export const HostEntity = z.object({
  '@timestamp': z.string().datetime(),
  entity: z.object({
    name: z.string(),
    source: z.string(),
  }),
  host: z.object({
    hostname: z.array(z.string()).optional(),
    domain: z.array(z.string()).optional(),
    ip: z.array(z.string()).optional(),
    name: z.string(),
    id: z.array(z.string()).optional(),
    type: z.array(z.string()).optional(),
    mac: z.array(z.string()).optional(),
    architecture: z.array(z.string()).optional(),
    risk: EntityRiskScoreRecord.optional(),
  }),
  asset: z
    .object({
      criticality: AssetCriticalityLevel,
    })
    .optional(),
});

export type Entity = z.infer<typeof Entity>;
export const Entity = z.union([UserEntity, HostEntity]);
