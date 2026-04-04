import { TransformFnParams } from 'class-transformer';
import { EvaluationType, EventType } from '@app/common/generated/event';

export function transformEventType({ value }: TransformFnParams) {
  if (value === undefined || value === null || value === '') {
    return value;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim();

    if (normalized === 'Exposition') {
      return EventType.EXPO;
    }

    if (normalized === 'Competition') {
      return EventType.COMPETENCIA;
    }

    const numericValue = Number(normalized);
    if (!Number.isNaN(numericValue)) {
      return numericValue;
    }
  }

  return value;
}

export function transformEvaluationType({ value }: TransformFnParams) {
  if (value === undefined || value === null || value === '') {
    return value;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim();

    if (normalized === 'ZERO_TO_FIVE') {
      return EvaluationType.ZERO_TO_FIVE;
    }

    if (normalized === 'ZERO_TO_HUNDRED') {
      return EvaluationType.ZERO_TO_HUNDRED;
    }

    const numericValue = Number(normalized);
    if (!Number.isNaN(numericValue)) {
      return numericValue;
    }
  }

  return value;
}
