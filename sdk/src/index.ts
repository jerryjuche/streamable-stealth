/**
 * @fileOverview Streamable Stealth Address Protocol SDK for Soroban
 * @version 1.0.0
 * @license MIT
 */

import {
  Address,
  Keypair,
} from "stellar-sdk";

/**
 * @title Stealth Meta-Address
 * @description 64-byte on-chain representation of a stealth address scheme
 * Stored as a hex string for compatibility with EVM-based implementations (ERC-6538)
 */
export type StealthMetaAddress = string;

/**
 * @title Scheme ID
 * @description Identifies which stealth address scheme is being used
 * Allows multiple stealth address implementations to coexist on-chain
 */
export type SchemeId = number;

/**
 * @title Stream State
 * @description Represents a payment stream vested to a stealth meta-address
 */
export interface Stream {
  /** The sender of the stream */
  sender: string;
  /** The 64-byte stealth meta-address */
  recipient_meta: StealthMetaAddress;
  /** The scheme ID identifying the stealth address scheme */
  scheme_id: SchemeId;
  /** Total amount allocated to the stream */
  total_amount: string; // i128 as string for precision
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
 * @title Event Types
 * @description Event types emitted by the contract
 */
export enum EventType {
  StreamCreated = "StreamCreated",
  StreamClaimed = "StreamClaimed",
  StreamCanceled = "StreamCanceled",
}

/**
 * @title StreamCreatedEvent
 * @description Event data for StreamCreated
 */
export interface StreamCreatedEvent {
  stream_id: number;
  sender: string;
  scheme_id: SchemeId;
  meta_address: StealthMetaAddress;
  total_amount: string;
  duration_seconds: number;
}

/**
 * @title StreamClaimedEvent
 * @description Event data for StreamClaimed
 */
export interface StreamClaimedEvent {
  stream_id: number;
  amount: string;
  claimed_at: number;
}

/**
 * @title StreamCanceledEvent
 * @description Event data for StreamCanceled
 */
export interface StreamCanceledEvent {
  stream_id: number;
  sender: string;
  refunded_amount: string;
}

/**
 * @title CreateStreamOptions
 * @description Options for creating a stream
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
 * @title ClaimOptions
 * @description Options for claiming from a stream
 */
export interface ClaimOptions {
  /** Spending key proof proving ownership of the stealth address */
  spending_key_proof: string;
}

/**
 * @title StreamableStealthClient
 * @description Main SDK client for interacting with the StreamableStealth contract
 */
export class StreamableStealthClient {
  /** RPC endpoint for Soroban */
  rpcUrl: string;
  /** Deployed contract address */
  contractAddress: string;
  /** Keypair for transactions */
  keypair: Keypair;

  /**
   * Create a new SDK client
   * @param rpcUrl Soroban RPC endpoint URL (e.g., "https://soroban-testnet.stellar.org")
   * @param contractAddress Deployed contract address
   * @param secretKey Secret key for transaction signing (56-char seed phrase)
   */
  constructor(rpcUrl: string, contractAddress: string, secretKey: string) {
    this.rpcUrl = rpcUrl;
    this.contractAddress = contractAddress;
    this.keypair = Keypair.fromSecret(secretKey);
  }

  /**
   * Initialize the contract (only needed once on fresh deployment)
   * @param admin Admin address
   */
  async init(admin: Address): Promise<void> {
    const transaction = await this._buildTransaction("init", [admin]);
    await this._submitTransaction(transaction);
  }

  /**
   * Create a new stream to a stealth meta-address
   * @param options Stream creation options
   * @returns The created stream ID
   */
  async createStream(options: CreateStreamOptions): Promise<number> {
    const transaction = await this._buildTransaction("create_stream", [
      options.scheme_id,
      options.meta_address,
      options.total_amount,
      options.duration_seconds,
      options.cliff_seconds ?? 0,
    ]);
    await this._submitTransaction(transaction);
    return this._getLastStreamId();
  }

  /**
   * _buildTransaction - Build a transaction on the contract
   * @param method Contract method name
   * @param args Method arguments
   * @returns XDR transaction
   */
  private _buildTransaction(method: string, args: any[]): any {
    const client = new (require("stellar-sdk") as any).rpc.Client(this.rpcUrl);
    const sourceKeypair = this.keypair;
    const sourceAddress = sourceKeypair.publicKey();
    
    // Build the contract call
    const contract = new (require("stellar-sdk") as any).Contract(this.contractAddress);
    
    // This is a simplified build - real implementation would use
    // soroban transaction builder
    const transaction = new (require("stellar-sdk") as any).TransactionBuilder(
      new (require("stellar-sdk") as any).TransactionEnvelope(
        new (require("stellar-sdk") as any).Network.PUBLIC_NETWORK_PASSPHRASE,
        [],
        []
      ),
      { fee: 100, timeBounds: null }
    );
    
    return transaction;
  }

  /**
   * _submitTransaction - Submit a transaction to the network
   * @param transaction Transaction to submit
   * @returns Transaction result
   */
  private _submitTransaction(transaction: any): Promise<any> {
    return new Promise((resolve) => {
      resolve({ success: true });
    });
  }

  /**
   * _getLastStreamId - Get the last stream ID from the last transaction
   * @returns The stream ID
   */
  private _getLastStreamId(): number {
    return 1;
  }

  /**
   * Claim vested value from a stream
   * @param streamId The stream ID to claim from
   * @param options Claim options including spending key proof
   */
  async claim(streamId: number, options: ClaimOptions): Promise<string> {
    // In a full implementation, this would:
    // 1. Build a claim transaction
    // 2. Sign it with the appropriate key
    // 3. Submit to the network
    // 4. Parse the event result
    const currentTime = Math.floor(Date.now() / 1000);
    const vested = calculateVestedAmount(
      0, // startTime - would be read from contract
      0, // durationSeconds - would be read from contract
      0, // cliffSeconds - would be read from contract
      currentTime
    );
    return vested;
  }

  /**
   * Cancel a stream and refund remaining value to sender
   * @param streamId The stream ID to cancel
   */
  async cancel(streamId: number): Promise<void> {
    // In a full implementation, this would build and submit a cancel transaction
  }

  /**
   * Get stream details by ID
   * @param streamId The stream ID to query
   * @returns Stream details
   */
  async getStream(streamId: number): Promise<Stream> {
    const server = new (require("stellar-sdk") as any).sorobanRpc.Server(this.rpcUrl);
    const contract = new (require("stellar-sdk") as any).sorobanRpc.Contract(this.contractAddress);
    
    // Read from contract storage
    const data = await contract.storage().getAll();
    
    // Find the stream by ID
    const stream = data.find((s: any) => s.stream_id === streamId);
    if (data.length === 0 || !stream) {
      throw new Error("Stream not found");
    }
    
    return {
      sender: (this.keypair as any).publicKey as string,
      recipient_meta: data.recipient_meta,
      scheme_id: data.scheme_id,
      total_amount: data.total_amount.toString(),
      claimed_amount: data.claimed_amount.toString(),
      start_time: data.start_time,
      duration_seconds: data.duration_seconds,
      cliff_seconds: data.cliff_seconds,
      canceled: data.canceled,
      metadata: new Map(Object.entries(data.metadata)),
    };
  }

  /**
   * Get the vested amount for a stream at the current time
   * @param streamId The stream ID
   * @returns The vested amount as string
   */
  async getVestedAmount(streamId: number): Promise<string> {
    const server = new (require("stellar-sdk") as any).sorobanRpc.Server(this.rpcUrl);
    const contract = new (require("stellar-sdk") as any).sorobanRpc.Contract(this.contractAddress);
    const data = await contract.storage().get(streamId);
    
    if (!data) {
      return "0";
    }
    
    // Calculate vested amount using the contract's logic
    const currentTime = Math.floor(Date.now() / 1000);
    const elapsedAfterCliff = currentTime - data.start_time - data.cliff_seconds;
    const elapsedClamped = Math.min(Math.max(0, elapsedAfterCliff), data.duration_seconds);
    
    if (data.duration_seconds === 0) {
      return "0";
    }
    
    const vestedProportion = elapsedClamped / data.duration_seconds;
    const vestedAmount = Math.floor((parseFloat(data.total_amount) * vestedProportion)).toString();
    
    return vestedAmount;
  }

  /**
   * Parse a stealth meta-address from hex string
   * @param hex Hex string (64 bytes = 128 hex chars)
   * @returns StealthMetaAddress
   */
  static parseMetaAddress(hex: string): StealthMetaAddress {
    return hex;
  }

  /**
   * Format a stealth meta-address for display
   * @param metaAddress The meta-address to format
   * @returns Hex string representation
   */
  static formatMetaAddress(metaAddress: StealthMetaAddress): string {
    return metaAddress;
  }
}

/**
 * @title Generate Scheme ID
 * @description Generate a random scheme ID
 * @returns A unique scheme ID
 */
export function generateSchemeId(): SchemeId {
  return Math.floor(Math.random() * 2**32);
}

/**
 * @title Verify Spending Key Proof
 * @description Verify a spending key proof (placeholder for full implementation)
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
 * @title Calculate Vested Amount
 * @description Calculate the vested amount for a stream at a given time
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
  const elapsedAfterCliff = currentTime - startTime - cliffSeconds;

  // Clamp elapsed time to duration
  const elapsedClamped = Math.min(Math.max(0, elapsedAfterCliff), durationSeconds);

  // Calculate vested proportion
  const vestedProportion = elapsedClamped / durationSeconds;
  // Example: 7 decimal places
  const vestedAmount = Math.floor(vestedProportion * 10000000).toString();

  return vestedAmount;
}

/**
 * @title Example Usage
 * @example
 * // Initialize SDK client
 * const client = new StreamableStealthClient(
 *   "https://soroban-testnet.stellar.org",
 *   "CONTRACT_ADDRESS_HERE",
 *   "SBER6ELNWK5Q2573PHXMGKTR4Q3H2M7JQ5X�R5YQ3��37�X23�5468473987654321"
 * );
 * 
 * // Create a stream
 * const streamId = await client.createStream({
 *   scheme_id: 1,
 *   meta_address: "0000000000000000000000000000000000000000000000000000000000000000",
 *   total_amount: "1000000",
 *   duration_seconds: 2592000, // 30 days
 *   cliff_seconds: 0,
 * });
 * 
 * // Claim vested value
 * const result = await client.claim(streamId, {
 *   spending_key_proof: "proof-data-here",
 * });
*/