-- 在 Supabase SQL Editor 中执行以下 SQL 创建表结构

-- 训练动作表
CREATE TABLE IF NOT EXISTS actions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 训练记录表
CREATE TABLE IF NOT EXISTS workout_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  action_id TEXT NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  sets INTEGER DEFAULT 0,
  reps INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(action_id, date)
);

-- 身体数据表
CREATE TABLE IF NOT EXISTS body_metrics (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  date TEXT NOT NULL UNIQUE,
  weight REAL,
  height REAL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_actions_sort ON actions(sort_order);
CREATE INDEX IF NOT EXISTS idx_records_action ON workout_records(action_id);
CREATE INDEX IF NOT EXISTS idx_records_date ON workout_records(date);
CREATE INDEX IF NOT EXISTS idx_records_action_date ON workout_records(action_id, date);
CREATE INDEX IF NOT EXISTS idx_body_date ON body_metrics(date);

-- 启用 Row Level Security（生产环境建议开启）
-- 这里先用简单的策略：公开读写（后续加登录后再改）
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_metrics ENABLE ROW LEVEL SECURITY;

-- 允许匿名读写（上线后有登录系统再改策略）
CREATE POLICY "Allow all on actions" ON actions FOR ALL USING (true);
CREATE POLICY "Allow all on workout_records" ON workout_records FOR ALL USING (true);
CREATE POLICY "Allow all on body_metrics" ON body_metrics FOR ALL USING (true);
