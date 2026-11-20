/**
 * @fileOverview Streamable Stealth Address Protocol SDK for Soroban
 * @version 0.1.0
 */

import {
  Address,
  Env,
  Bytes,
  decodeBase64,
  encodeBase64,
  xor,
} from "stellar-sdk";
import { sorobanRpc, resolveEd25519Path } from "stellar-sdk";

/**
 * Represents a stealth meta-address (64-byte on-chain representation)
 * This is the on-chain identifier for a stealth address scheme
 */
export type StealthMetaAddress = Buffer;

/**
 * Scheme ID identifies which stealth address scheme is being used
 * Allows multiple stealth address implementations to coexist
 */
export type SchemeId = number;

/**
 * Stream state representing a payment stream to a stealth meta-address
 */
export interface Stream {
  /** The sender of the stream */
  sender: Address;
  /** The 64-byte stealth meta-address */
  recipient_meta: StealthMetaAddress;
  /** The scheme ID identifying the stealth address scheme */
  scheme_id: SchemeId;
  /** Total amount allocated to the stream */
  total_amount: string;
  /** Amount already claimed */
  claimed_amount: string;
  /** Start timestamp (unix seconds) */
  start_time: number;
  /** Vesting duration in seconds */
  duration_seconds: number;
  /** Cliff period in seconds before claiming begins */
  cliff_seconds: number;
  /** Whether the stream is canceled */
  canceled: boolean;
  /** Additional metadata */
  metadata: Map<string, string>;
}

/**
 * Event types emitted by the contract
 */
export enum EventType {
  StreamCreated = "StreamCreated",
  StreamClaimed = "StreamClaimed",
  StreamCanceled = "StreamCanceled",
}

/**
 * Event data for StreamCreated
 */
export interface StreamCreatedEvent {
  stream_id: number;
  sender: Address;
  scheme_id: SchemeId;
  meta_address: StealthMetaAddress;
  total_amount: string;
  duration_seconds: number;
}

/**
 * Event data for StreamClaimed
 */
export interface StreamClaimedEvent {
  stream_id: number;
  amount: string;
  claimed_at: number;
}

/**
 * Event data for StreamCanceled
 */
export interface StreamCanceledEvent {
  stream_id: number;
  sender: Address;
  refunded_amount: string;
}

/**
 * Options for creating a stream
 */
export interface CreateStreamOptions {
  /** Scheme ID for the stealth address scheme */
  scheme_id: SchemeId;
  /** 64-byte stealth meta-address */
  meta_address: StealthMetaAddress;
  /** Total amount to stream */
  total_amount: string;
  /** Duration in seconds over which value vests */
  duration_seconds: number;
  /** Cliff period in seconds before any value can be claimed */
  cliff_seconds?: number;
}

/**
 * Options for claiming from a stream
 */
export interface ClaimOptions {
  /** Spending key proof proving ownership of the stealth address */
  spending_key_proof: string;
}

/**
 * SDK client for interacting with the StreamableStealth contract
 */
export class StreamableStealthClient {
  /** RPC endpoint for Soroban */
  rpc: any;
  /** Contract address */
  contract_address: string;
  /** Keypair for transactions */
  keypair: any;

  /**
   * Create a new SDK client
   * @param rpcUrl Soroban RPC endpoint URL
   * @param contractAddress Deployed contract address
   * @param secretKey Secret key for transaction signing
   */
  constructor(rpcUrl: string, contractAddress: string, secretKey: string) {
    this.rpc = rpcUrl;
    this.contract_address = contractAddress;
    this.keypair = keypairFromSecret(secretKey);
  }

  /**
   * Initialize the contract (only needed once on fresh deployment)
   */
  async init(admin: Address): Promise<void> {
    const client = this;
    const transaction = new sorobanSdk.TransactionBuilder(
      await sorobanSdk.Server.loadAccount(this.keypair.publicKey())
    )
      .addContractCall(
        this.contract_address,
        "init",
        [admin],
        {}
      )
      .setTimeout(100000)
      .build();

    await sorobanSdk.Network.submitTransaction(transaction);
  }

  /**
   * Create a new stream to a stealth meta-address
   * @param options Stream creation options
   * @returns The created stream ID
   */
  async createStream(options: CreateStreamOptions): Promise<number> {
    const client = this;
    const transaction = new sorobanSdk.TransactionBuilder(
      await sorobanSdk.Server.loadAccount(this.keypair.publicKey())
    )
      .addContractCall(
        this.contract_address,
        "create_stream",
        [
          options.scheme_id,
          options.meta_address,
          options.total_amount,
          options.duration_seconds,
          options.cliff_seconds ?? 0,
        ],
        {}
      )
      .setTimeout(100000)
      .build();

    await sorobanSdk.Network.submitTransaction(transaction);

    // Return the stream ID (would be returned from the contract event)
    return 0; // Placeholder - actual implementation would parse the event
  }

  /**
   * Claim vested value from a stream
   * @param streamId The stream ID to claim from
   * @param options Claim options including spending key proof
   * @returns The amount claimed
   */
  async claim(streamId: number, options: ClaimOptions): Promise<string> {
    const client = this;
    const transaction = new sorobanSdk.TransactionBuilder(
      await sorobanSdk.Server.loadAccount(this.keypair.publicKey())
    )
      .addContractCall(
        this.contract_address,
        "claim",
        [streamId, options.spending_key_proof],
        {}
      )
      .setTimeout(100000)
      .build();

    await sorobanSdk.Network.submitTransaction(transaction);

    return "0"; // Placeholder
  }

  /**
   * Cancel a stream and refund remaining value to sender
   * @param streamId The stream ID to cancel
   */
  async cancel(streamId: number): Promise<string> {
    const client = this;
    const transaction = new sorobanSdk.TransactionBuilder(
      await sorobanSdk.Server.loadAccount(this.keypair.publicKey())
    )
      .addContractCall(
        this.contract_address,
        "cancel",
        [streamId],
        {}
      )
      .setTimeout(100000)
      .build();

    await sorobanSdk.Network.submitTransaction(transaction);

    return "0"; // Placeholder
  }

  /**
   * Get stream details by ID
   * @param streamId The stream ID to query
   * @returns Stream details
   */
  async getStream(streamId: number): Promise<Stream> {
    // Query the contract for stream details
    // This would use the Soroban RPC to read the stream state
    const server = new sorobanSdk.Server(this.rpc);
    
    // Read from contract storage
    // This is a simplified example
    const contract = new sorobanSdk.Contract(this.contract_address);
    
    // In a full implementation, this would read the stream from contract storage
    return {
      sender: this.keypair.getAddress(),
      recipient_meta: new Array(64).fill(0),
      scheme_id: 1,
      total_amount: "0",
      claimed_amount: "0",
      start_time: 0,
      duration_seconds: 0,
      cliff_seconds: 0,
      canceled: false,
      metadata: new Map(),
    };
  }

  /**
   * Get the vested amount for a stream at the current time
   * @param streamId The stream ID
   * @returns The vested amount
   */
  async getVestedAmount(streamId: number): Promise<string> {
    // Query the contract for vested amount
    return "0"; // Placeholder
  }

  /**
   * Parse a stealth meta-address from a buffer
   * @param buffer 64-byte buffer
   * @returns StealthMetaAddress as Buffer
   */
  static parseMetaAddress(buffer: Buffer): StealthMetaAddress {
    return buffer;
  }

  /**
   * Format a stealth meta-address for display
   * @param metaAddress The meta-address to format
   * @returns Hex string representation
   */
  static formatMetaAddress(metaAddress: StealthMetaAddress): string {
    return Buffer.from(metaAddress).toString("hex");
  }
}

/**
 * Generate a random scheme ID
 * @returns A unique scheme ID
 */
export function generateSchemeId(): SchemeId {
  return Math.floor(Math.random() * 2**32);
}

/**
 * Verify a spending key proof (placeholder for full implementation)
 * @param metaAddress The stealth meta-address
 * @param proof The spending key proof to verify
 * @returns Whether the proof is valid
 */
export function verifySpendingKeyProof(
  metaAddress: StealthMetaAddress,
  proof: string
): boolean {
  // Placeholder - in production, this would verify:
  // 1. The spending key corresponds to the stealth meta-address
  // 2. A valid signature or zero-knowledge proof
  // 3. The proof matches the expected stealth address protocol
  return proof.length > 0;
}

/**
 * Calculate the vested amount for a stream at a given time
 * @param startTime Stream start timestamp (unix seconds)
 * @param durationSeconds Vesting duration in seconds
 * @param cliffSeconds Cliff period in seconds
 * @param currentTime Current time (unix seconds)
 * @returns The vested amount
 */
export function calculateVestedAmount(
  startTime: number,
  durationSeconds: number,
  cliffSeconds: number,
  currentTime: number
): string {
  // If before cliff, no amount is vested
  if (currentTime < startTime + cliffSeconds) {
    return "0";
  }

  // Elapsed time after cliff
  const elapsedAfterCliff = Math.max(0, currentTime - startTime - cliffSeconds);

  // Clamp elapsed time to duration
  const elapsedClamped = Math.min(elapsedAfterCliff, durationSeconds);

  // Calculate vested proportion
  const vestedProportion = elapsedClamped / durationSeconds;
  const vestedAmount = Math.floor(vestedProportion * 1000000); // Example: 7 decimal places

  // Cap at total amount (would need total_amount parameter in full implementation)
  return vestedAmount.toString();
}

/**
 * Main export for package consumption
 */
export { StreamableStealthClient, SchemeId, StreamCreatedEvent, StreamClaimedEvent, StreamCanceledEvent };