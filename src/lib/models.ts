// Модели данных для онлайн-платформы ЖНК "Артель"

// Типы данных для моделей
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  created_at: string;
  updated_at: string;
  roles?: Role[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface Tariff {
  id: number;
  name: string;
  description?: string;
  initial_payment_percent: number;
  monthly_payment_percent: number;
  max_term_months: number;
  acceleration_coefficient: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: number;
  user_id: number;
  passport_series?: string;
  passport_number?: string;
  passport_issued_by?: string;
  passport_issue_date?: string;
  registration_address?: string;
  actual_address?: string;
  tariff_id?: number;
  membership_status: string;
  queue_position?: number;
  queue_date?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  tariff?: Tariff;
}

export interface Property {
  id: number;
  address: string;
  type: string;
  area: number;
  rooms?: number;
  floor?: number;
  total_floors?: number;
  price: number;
  status: string;
  rating?: string;
  rating_coefficient?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Contribution {
  id: number;
  member_id: number;
  amount: number;
  contribution_type: string;
  payment_method: string;
  transaction_id?: string;
  status: string;
  created_at: string;
  member?: Member;
}

export interface Document {
  id: number;
  member_id: number;
  document_type: string;
  title: string;
  description?: string;
  file_path?: string;
  ipfs_hash?: string;
  blockchain_hash?: string;
  status: string;
  created_at: string;
  updated_at: string;
  member?: Member;
}

export interface Token {
  id: number;
  member_id: number;
  token_type: string;
  amount: number;
  price_per_token: number;
  property_id?: number;
  blockchain_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
  member?: Member;
  property?: Property;
}

export interface TokenTransaction {
  id: number;
  token_id: number;
  transaction_type: string;
  amount: number;
  from_member_id?: number;
  to_member_id?: number;
  blockchain_tx_id?: string;
  created_at: string;
  token?: Token;
  from_member?: Member;
  to_member?: Member;
}

export interface AccelerationCalculation {
  id: number;
  member_id: number;
  tariff_id: number;
  initial_payment_amount: number;
  monthly_payment_amount: number;
  property_price: number;
  base_term_months: number;
  new_members_count: number;
  accelerated_term_months: number;
  saved_months: number;
  calculation_date: string;
  member?: Member;
  tariff?: Tariff;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string;
  updated_at: string;
}

// Типы для запросов к базе данных
export type UserCreateInput = Omit<User, 'id' | 'created_at' | 'updated_at' | 'roles'>;
export type UserUpdateInput = Partial<Omit<User, 'id' | 'created_at' | 'updated_at' | 'roles'>>;

export type MemberCreateInput = Omit<Member, 'id' | 'created_at' | 'updated_at' | 'user' | 'tariff'>;
export type MemberUpdateInput = Partial<Omit<Member, 'id' | 'created_at' | 'updated_at' | 'user' | 'tariff'>>;

export type TariffCreateInput = Omit<Tariff, 'id' | 'created_at' | 'updated_at'>;
export type TariffUpdateInput = Partial<Omit<Tariff, 'id' | 'created_at' | 'updated_at'>>;

export type PropertyCreateInput = Omit<Property, 'id' | 'created_at' | 'updated_at'>;
export type PropertyUpdateInput = Partial<Omit<Property, 'id' | 'created_at' | 'updated_at'>>;

export type ContributionCreateInput = Omit<Contribution, 'id' | 'created_at' | 'member'>;
export type DocumentCreateInput = Omit<Document, 'id' | 'created_at' | 'updated_at' | 'member'>;
export type TokenCreateInput = Omit<Token, 'id' | 'created_at' | 'updated_at' | 'member' | 'property'>;
export type TokenTransactionCreateInput = Omit<TokenTransaction, 'id' | 'created_at' | 'token' | 'from_member' | 'to_member'>;
export type AccelerationCalculationCreateInput = Omit<AccelerationCalculation, 'id' | 'calculation_date' | 'member' | 'tariff'>;
export type SettingUpdateInput = Partial<Omit<Setting, 'id' | 'updated_at'>>;
