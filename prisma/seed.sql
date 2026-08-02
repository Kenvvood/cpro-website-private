-- Seed data for cpro-website

-- Insert demo user (password: demo123, bcrypt hashed)
INSERT OR IGNORE INTO User (id, username, phone, password, memberLevel, createdAt, updatedAt)
VALUES (
  'demo_user_001',
  'demo',
  '138****8888',
  '$2b$12$ebInBu7S1llEC2lKvJvWr.DbxEG58CokbujYOn3XQ1PizO0JwHoH.',
  'VIP',
  datetime('now'),
  datetime('now')
);

-- Insert products
INSERT OR IGNORE INTO Product (id, name, description, category, fileUrl, version, downloadCount, isActive, createdAt, updatedAt)
VALUES
  ('prod_001', '趋势追踪EA', '基于趋势跟随策略的智能交易EA，支持多货币对，自动止损止盈', 'ea', '/downloads/趋势追踪EA_v1.2.zip', 'v1.2', 156, 1, datetime('now'), datetime('now')),
  ('prod_002', '多空信号指标', '多空趋势一目了然，实时信号提示，MT4/MT5通用', 'indicator', '/downloads/多空信号指标_v2.0.zip', 'v2.0', 132, 1, datetime('now'), datetime('now')),
  ('prod_003', '网格马丁EA', '智能网格加仓策略，抗震荡能力强，适合稳健型投资者', 'ea', '/downloads/网格马丁EA_v1.5.zip', 'v1.5', 98, 1, datetime('now'), datetime('now')),
  ('prod_004', 'RSI超买超卖指标', '经典RSI指标优化版，多周期显示，信号精准', 'indicator', '/downloads/RSI超买超卖指标_v1.0.zip', 'v1.0', 87, 1, datetime('now'), datetime('now')),
  ('prod_005', '批量平仓脚本', '一键平仓所有订单，支持按盈亏、类型筛选', 'script', '/downloads/批量平仓脚本_v1.1.zip', 'v1.1', 76, 1, datetime('now'), datetime('now')),
  ('prod_006', '新闻事件EA', '自动识别重大新闻事件，智能止损避免滑点', 'ea', '/downloads/新闻事件EA_v1.0.zip', 'v1.0', 45, 1, datetime('now'), datetime('now'));
