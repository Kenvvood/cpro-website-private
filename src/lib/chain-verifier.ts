// src/lib/chain-verifier.ts
// 链上验证 (task-0041 Phase 5 第一阶段, Mock 模式)
// 第二阶段: 接入 TronGrid / Etherscan API
export interface VerifyResult {
  ok: boolean;
  blockNumber?: bigint;
  reason?: string;
}

const MOCK_MODE = process.env.CHAIN_VERIFIER_MOCK !== "false"; // 默认 Mock

const TX_HASH_PATTERN = /^0x[a-fA-F0-9]{64}$/;

export async function verifyOnChain(
  txHash: string,
  expectedAmount: number,
  expectedWallet: string,
): Promise<VerifyResult> {
  // 格式校验
  if (!TX_HASH_PATTERN.test(txHash)) {
    return { ok: false, reason: "TxID 格式不符 (需 0x + 64 位 hex)" };
  }
  if (expectedAmount <= 0) {
    return { ok: false, reason: "订单金额异常" };
  }
  if (!expectedWallet || expectedWallet.length < 10) {
    return { ok: false, reason: "收款地址未配置" };
  }

  if (MOCK_MODE) {
    // Mock: 格式校验通过即视为成功
    return {
      ok: true,
      blockNumber: BigInt(Math.floor(Math.random() * 100_000_000) + 50_000_000),
    };
  }

  // TODO 第二阶段: 真实 TronGrid / Etherscan API
  // const verified = await fetch(`https://api.trongrid.io/v1/transactions/${txHash}`).then(...);
  return { ok: false, reason: "Chain verifier not configured (set CHAIN_VERIFIER_MOCK=true)" };
}