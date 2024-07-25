/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/**
 * Endpoint base error class that supports an optional second argument for providing additional data
 * for the error.
 */
export class EndpointError<MetaType = unknown> extends Error {
  constructor(message: string, public readonly meta?: MetaType) {
    super(message);
    // For debugging - capture name of subclasses
    this.name = this.constructor.name;

    if (meta instanceof Error) {
      this.stack += `\n----- original error -----\n${meta.stack}`;
    }
  }
}

/**
 * Type guard to check if a given Error is an instance of EndpointError
 * @param err
 */
export const isEndpointError = (err: Error): err is EndpointError => {
  return err instanceof EndpointError;
};
