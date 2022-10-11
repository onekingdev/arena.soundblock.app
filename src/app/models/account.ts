import { Base } from './base';

export interface AccountPlan extends Base {
  flag_active: 0 | 1;
  ledger_uuid: string;
  payment: string;
  plan_cost: number;
  plan_day: number;
  plan_type: string;
  plan_uuid: string;
}

export interface Transaction extends Base {
  ledger_uuid: string;
  transaction_amount: number;
  transaction_memo: string;
  transaction_name: string;
  transaction_status: string;
  transaction_type: string;
  transaction_uuid: string;
}

export interface AccountData extends Base {
  payment: {
    card: {
      brand: string;
      country: string;
      exp_month: number;
      exp_year: number;
      last4: string;
    };
    payment_id: string;
  };
  active_plan: AccountPlan;
  account_name: string;
  account_uuid: string;
  ledger_uuid?: string;
  transactions: {
    data: Transaction[]
  };
}
