import { z } from 'zod';

export const ENCODING_CONFIG = {
  INT16: {
    label: 'INT16',
    bytes: 2,
    min: -32768,
    max: 32767,
    color: '#3b82f6',
    bgColor: '#dbeafe',
  },
  INT32: {
    label: 'INT32',
    bytes: 4,
    min: -2147483648,
    max: 2147483647,
    color: '#8b5cf6',
    bgColor: '#ede9fe',
  },
  INT64: {
    label: 'INT64',
    bytes: 8,
    min: BigInt('-9223372036854775808'),
    max: BigInt('9223372036854775807'),
    color: '#ec4899',
    bgColor: '#fce7f3',
  },
} as const;

export type EncodingType = keyof typeof ENCODING_CONFIG;

export const videoSpecs = {
  fps: 30,
  width: 1280,
  height: 720,
} as const;

export const BinarySearchSchema = z.object({
  searchValue: z.number(),
  data: z.array(z.number()),
});

export const EncodingUpgradeSchema = z.object({
  initialEncoding: z.enum(['INT16', 'INT32', 'INT64']),
  triggerValue: z.number(),
});

export const MemoryLayoutSchema = z.object({
  encoding: z.enum(['INT16', 'INT32', 'INT64']),
  length: z.number(),
});

export const OperationSchema = z.object({
  operation: z.enum(['insert', 'delete', 'search']),
  value: z.number(),
  initialData: z.array(z.number()),
});

export const LittleEndianSchema = z.object({
  value: z.number(),
  encoding: z.enum(['INT16', 'INT32', 'INT64']),
});

export const IntSetVsHashTableSchema = z.object({
  intSetData: z.array(z.number()),
  hashTableData: z.array(z.number()),
  searchValue: z.number(),
});

export const ResizeToHashTableSchema = z.object({
  triggerType: z.enum(['overflow', 'non_integer']),
  initialData: z.array(z.number()),
  maxEntries: z.number().default(512),
});

export const ResizeMechanismSchema = z.object({});
