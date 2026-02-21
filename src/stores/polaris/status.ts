// ============================================================================
// Polaris — StatusTracker (per-operation async status)
// ============================================================================

import type { Status, OperationStatus, StatusValue, OperationRecord } from "./types";

export class StatusTracker {
  private operations = new Map<string, OperationRecord>();
  private listeners = new Set<() => void>();

  build(): Status {
    const aggregate = this.aggregate();
    const operations = this.operations;

    const status = ((name: string): OperationStatus => {
      const record = operations.get(name);
      if (!record) {
        return { value: "idle", pending: false, error: null, success: false, idle: true };
      }
      return {
        value: record.status,
        pending: record.status === "pending",
        error: record.error,
        success: record.status === "success",
        idle: record.status === "idle",
      };
    }) as Status;

    Object.defineProperties(status, {
      value: { value: aggregate.value, enumerable: true },
      pending: { value: aggregate.pending, enumerable: true },
      error: { value: aggregate.error, enumerable: true },
      success: { value: aggregate.success, enumerable: true },
      idle: { value: aggregate.idle, enumerable: true },
    });

    return status;
  }

  onChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  setPending(name: string): void {
    this.operations.set(name, { status: "pending", error: null });
    this.notify();
  }

  setSuccess(name: string): void {
    this.operations.set(name, { status: "success", error: null });
    this.notify();
  }

  setError(name: string, error: Error): void {
    this.operations.set(name, { status: "error", error });
    this.notify();
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  private aggregate(): {
    value: StatusValue;
    pending: boolean;
    error: Error | null;
    success: boolean;
    idle: boolean;
  } {
    let hasPending = false;
    let hasError = false;
    let hasSuccess = false;
    let firstError: Error | null = null;

    for (const record of this.operations.values()) {
      if (record.status === "pending") hasPending = true;
      if (record.status === "error") {
        hasError = true;
        if (!firstError) firstError = record.error;
      }
      if (record.status === "success") hasSuccess = true;
    }

    if (hasPending)
      return { value: "pending", pending: true, error: null, success: false, idle: false };
    if (hasError)
      return { value: "error", pending: false, error: firstError, success: false, idle: false };
    if (hasSuccess)
      return { value: "success", pending: false, error: null, success: true, idle: false };
    return { value: "idle", pending: false, error: null, success: false, idle: true };
  }
}
