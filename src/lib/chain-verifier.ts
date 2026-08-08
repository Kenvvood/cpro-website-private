// src/lib/chain-verifier.ts
// task057 Phase 9: 真实链上 USDT 验证 (TRC20 / BEP20)
// ARCHIVE v16.0 [ONCHAIN_VERIFY] 封箱 + task064 V5 时间戳防线 + Fail-Closed
export interface VerifyResult {
  ok: boolean;
  /** 是否为"瞬态网络错误"(超时/502/限流) — true 时 submit-hash 应保持 PENDING */
  transient?: boolean;
  blockNumber?: bigint;
  reason?: string;
  actualAmount?: number;
  contractAddress?: string;
  error?: string;
}

// USDT 官方合约地址（白名单 · 硬编码 · 严禁配置化）
const USDT_TRC20 = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"; // 波场官方 · 6 位精度
const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955"; // BSC 官方 · 18 位精度

const MOCK_MODE = process.env.CHAIN_VERIFIER_MOCK === "true"; // 默认 false · 强制真实验证

export type PayChannel = "USDT_TRC20" | "USDT_BSC";

export async function verifyOnChain(
  txHash: string,
  expectedAmountUSDT: number,
  expectedWallet: string,
  channel: PayChannel,
  orderCreatedAt: Date,
): Promise<VerifyResult> {
  // V0: 入口参数校验
  if (!txHash || !expectedWallet || expectedAmountUSDT <= 0) {
    return { ok: false, reason: "参数校验失败" };
  }
  if (!orderCreatedAt || isNaN(orderCreatedAt.getTime())) {
    return { ok: false, reason: "订单创建时间缺失" };
  }

  // Mock 模式（仅 dev/test 使用）
  if (MOCK_MODE) {
    return {
      ok: true,
      blockNumber: BigInt(Math.floor(Math.random() * 100_000_000) + 50_000_000),
      contractAddress: channel === "USDT_TRC20" ? USDT_TRC20 : USDT_BEP20,
      actualAmount: expectedAmountUSDT,
    };
  }

  // 调度到具体链验证器 + 统一容错
  try {
    if (channel === "USDT_TRC20") return await verifyTRC20(txHash, expectedAmountUSDT, expectedWallet, orderCreatedAt);
    if (channel === "USDT_BSC") return await verifyBEP20(txHash, expectedAmountUSDT, expectedWallet, orderCreatedAt);
    return { ok: false, reason: `不支持的支付通道: ${channel}` };
  } catch (e: any) {
    // task064 Fail-Closed: 网络超时 / 限流 / 5xx → 标识 transient=true
    // (submit-hash 据此保持 PENDING, 不标 FAILED, 允许用户重试)
    console.error("[chain-verifier]", e);
    return {
      ok: false,
      transient: true,
      reason: "网络拥堵，请稍后再试",
      error: e?.message ?? String(e),
    };
  }
}

// ============================================================================
// TRC20 (波场) 验证
// ============================================================================
async function verifyTRC20(
  txHash: string,
  expectedAmountUSDT: number,
  expectedWallet: string,
  orderCreatedAt: Date,
): Promise<VerifyResult> {
  // V0: 格式校验
  if (!/^[a-fA-F0-9]{64}$/.test(txHash)) {
    return { ok: false, reason: "TxID 格式不符 (TRC20 需 64 位 hex)" };
  }
  const apiKey = process.env.TRONGRID_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: "TRONGRID_API_KEY 未配置" };
  }

  const headers = { "TRON-PRO-API-KEY": apiKey };

  // 获取交易 + Transfer 事件
  const [txRes, eventRes] = await Promise.all([
    fetch(`https://api.trongrid.io/v1/transactions/${txHash}`, { headers }),
    fetch(`https://api.trongrid.io/v1/transactions/${txHash}/events`, { headers }),
  ]);

  if (!txRes.ok) return { ok: false, transient: txRes.status >= 500 || txRes.status === 429, reason: `TronGrid 交易查询 ${txRes.status}` };
  if (!eventRes.ok) return { ok: false, transient: eventRes.status >= 500 || eventRes.status === 429, reason: `TronGrid 事件查询 ${eventRes.status}` };

  const tx = await txRes.json();
  const eventsJson = await eventRes.json();

  // V1: 交易状态 SUCCESS
  if (!tx.ret || tx.ret[0]?.contractRet !== "SUCCESS") {
    return { ok: false, reason: `交易状态: ${tx.ret?.[0]?.contractRet ?? "未知"}` };
  }

  // V1.5: 找到 USDT Transfer 事件
  const transferEvent = eventsJson?.data?.find(
    (e: any) => e.event_name === "TransferEvent" && e.contract_address === USDT_TRC20,
  );
  if (!transferEvent) {
    return { ok: false, reason: "未找到 USDT-TRC20 Transfer 事件" };
  }

  // V2: USDT 合约地址 (硬编码白名单已校验, 这里仅记录)
  // V3: 收款地址 (大小写不敏感)
  const toAddress = transferEvent?.result?.to;
  if (!toAddress || toAddress.toLowerCase() !== expectedWallet.toLowerCase()) {
    return { ok: false, reason: `收款地址不匹配 (实际 ${toAddress})` };
  }

  // V4: 金额 (TRC20 精度 6 位)
  const actualAmountUSDT = Number(transferEvent.result.value) / 1_000_000;
  if (actualAmountUSDT < expectedAmountUSDT) {
    return { ok: false, reason: `金额不足: 应付 ${expectedAmountUSDT} 实付 ${actualAmountUSDT}` };
  }

  // V5: 时间戳防线 (防重放)
  // TRC20 block_timestamp 是毫秒
  const txTimestamp = Number(tx.block_timestamp);
  if (txTimestamp < orderCreatedAt.getTime()) {
    return {
      ok: false,
      reason: `交易时间早于订单创建 (订单 ${orderCreatedAt.toISOString()} < 交易 ${new Date(txTimestamp).toISOString()})`,
    };
  }

  return {
    ok: true,
    blockNumber: BigInt(tx.blockNumber),
    contractAddress: USDT_TRC20,
    actualAmount: actualAmountUSDT,
  };
}

// ============================================================================
// BEP20 (BSC) 验证
// ============================================================================
async function verifyBEP20(
  txHash: string,
  expectedAmountUSDT: number,
  expectedWallet: string,
  orderCreatedAt: Date,
): Promise<VerifyResult> {
  // V0: 格式校验 (BEP20 是 0x + 64 hex)
  if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
    return { ok: false, reason: "TxID 格式不符 (BEP20 需 0x + 64 位 hex)" };
  }
  const apiKey = process.env.BSCSCAN_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: "BSCSCAN_API_KEY 未配置" };
  }

  const base = `https://api.bscscan.com/api?apikey=${apiKey}`;

  // 获取交易 + receipt
  const [txRes, receiptRes] = await Promise.all([
    fetch(`${base}&module=proxy&action=eth_getTransactionByHash&txhash=${txHash}`),
    fetch(`${base}&module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}`),
  ]);

  if (!txRes.ok) return { ok: false, transient: txRes.status >= 500 || txRes.status === 429, reason: `BscScan 交易查询 ${txRes.status}` };
  if (!receiptRes.ok) return { ok: false, transient: receiptRes.status >= 500 || receiptRes.status === 429, reason: `BscScan receipt 查询 ${receiptRes.status}` };

  const txJson = await txRes.json();
  const receiptJson = await receiptRes.json();
  const tx = txJson.result;
  const receipt = receiptJson.result;
  if (!tx || tx === null) return { ok: false, reason: "查无此交易" };
  if (!receipt || receipt === null) return { ok: false, reason: "查无 receipt" };

  // V1: receipt status = 0x1 (成功)
  if (receipt.status !== "0x1") {
    return { ok: false, reason: `交易未成功 (receipt status: ${receipt.status})` };
  }

  // V2: 调用的是 USDT-BEP20 官方合约
  if (tx.to?.toLowerCase() !== USDT_BEP20.toLowerCase()) {
    return { ok: false, reason: `目标合约非 USDT-BEP20 (${tx.to})` };
  }

  // V3 + V4: 解码 input data (Transfer(address,address,uint256))
  // sig: 0xa9059cbb + to (32 bytes) + value (32 bytes) → 总 138 chars (含 0x)
  if (!tx.input || tx.input.length < 138) {
    return { ok: false, reason: "input data 长度不符 (非 ERC20 Transfer)" };
  }
  // to 地址: 第 11-75 字符的后 40 hex (跳过前 24 hex padding)
  const toAddress = ("0x" + tx.input.slice(34, 74).slice(-40)).toLowerCase();
  if (toAddress !== expectedWallet.toLowerCase()) {
    return { ok: false, reason: `收款地址不匹配 (实际 ${toAddress})` };
  }

  // V4: 金额 (BEP20 精度 18 位)
  const valueHex = tx.input.slice(74, 138);
  const valueWei = BigInt("0x" + valueHex);
  const actualAmountUSDT = Number(valueWei) / 1e18;
  if (actualAmountUSDT < expectedAmountUSDT) {
    return { ok: false, reason: `金额不足: 应付 ${expectedAmountUSDT} 实付 ${actualAmountUSDT}` };
  }

  // V5: 时间戳防线 (防重放)
  // BEP20 receipt 没 timestamp, 需要查 block 获取
  const blockRes = await fetch(
    `${base}&module=proxy&action=eth_getBlockByNumber&tag=${receipt.blockNumber}&boolean=false`,
  );
  if (!blockRes.ok) return { ok: false, transient: blockRes.status >= 500 || blockRes.status === 429, reason: `BscScan block 查询 ${blockRes.status}` };
  const blockJson = await blockRes.json();
  const block = blockJson.result;
  if (!block) return { ok: false, transient: true, reason: "查无 block 时间戳" };

  // BEP20 block timestamp 是秒 (Hex)
  const txTimestampSec = parseInt(block.timestamp, 16);
  const orderCreatedSec = Math.floor(orderCreatedAt.getTime() / 1000);
  if (txTimestampSec < orderCreatedSec) {
    return {
      ok: false,
      reason: `交易时间早于订单创建 (订单 ${orderCreatedAt.toISOString()} < 交易 ${new Date(txTimestampSec * 1000).toISOString()})`,
    };
  }

  return {
    ok: true,
    blockNumber: BigInt(receipt.blockNumber),
    contractAddress: USDT_BEP20,
    actualAmount: actualAmountUSDT,
  };
}