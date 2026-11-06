/**
 * [INPUT]
 * - locales/{zh,en,ko}.json 的 cloud.pricingPreview.plans.*.{price,wu}
 * - myrm-control-plane/src/myrm_control_plane/billing/{catalog,plans}.py (POS: 存在时优先读取的计费目录)
 * - scripts/cp-billing-contract.json (POS: 独立仓 CI 定价回退契约)
 *
 * [OUTPUT]
 * - validateCloudPricingAgainstCp: 云定价文案的美元价与 WU 额度必须等于控制面计费目录
 *
 * [POS]
 * 云定价与控制面对账；validate-marketing-locales.ts 在 locale 键契约之后调用。
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CLOUD_PLAN_KEYS } from '../src/components/marketing/cloud/cloud-marketing-keys';
import { LOCALES, ROOT, getAt, loadCloud } from './locale-files';

const CP_BILLING_ROOT = join(ROOT, '../../myrm-control-plane/src/myrm_control_plane/billing');
const CP_BILLING_CONTRACT_PATH = join(import.meta.dir, 'cp-billing-contract.json');
const CP_CATALOG_PATH = join(CP_BILLING_ROOT, 'catalog.py');
const CP_PLANS_PATH = join(CP_BILLING_ROOT, 'plans.py');

type CloudPlanKey = (typeof CLOUD_PLAN_KEYS)[number];

function billingPlanEnum(planKey: CloudPlanKey): string {
  return planKey.toUpperCase();
}

type CpBillingContract = {
  plans: Record<CloudPlanKey, { monthlyUsd: number; monthlyWu: number }>;
};

function loadCpBillingContract(): CpBillingContract {
  const raw = readFileSync(CP_BILLING_CONTRACT_PATH, 'utf8');
  return JSON.parse(raw) as CpBillingContract;
}

function parseCpMonthlyUsd(planKey: CloudPlanKey): number {
  if (existsSync(CP_CATALOG_PATH)) {
    const catalogText = readFileSync(CP_CATALOG_PATH, 'utf8');
    const pattern = new RegExp(
      `BillingPlan\\.${billingPlanEnum(planKey)}:\\s*\\(\\s*(\\d+)\\s*,`,
    );
    const match = catalogText.match(pattern);
    if (!match) {
      throw new Error(`Could not parse PLAN_DISPLAY_USD for ${planKey} in catalog.py`);
    }
    return Number.parseInt(match[1] ?? '', 10);
  }
  const contract = loadCpBillingContract();
  const entry = contract.plans[planKey];
  if (!entry) {
    throw new Error(`Missing ${planKey} in cp-billing-contract.json`);
  }
  return entry.monthlyUsd;
}

function parseCpMonthlyWu(planKey: CloudPlanKey): number {
  if (existsSync(CP_PLANS_PATH)) {
    const plansText = readFileSync(CP_PLANS_PATH, 'utf8');
    const pattern = new RegExp(
      `BillingPlan\\.${billingPlanEnum(planKey)}:[\\s\\S]*?monthly_wu=(\\d+)`,
    );
    const match = plansText.match(pattern);
    if (!match) {
      throw new Error(`Could not parse monthly_wu for ${planKey} in plans.py`);
    }
    return Number.parseInt(match[1] ?? '', 10);
  }
  const contract = loadCpBillingContract();
  const entry = contract.plans[planKey];
  if (!entry) {
    throw new Error(`Missing ${planKey} in cp-billing-contract.json`);
  }
  return entry.monthlyWu;
}

function parseLocalePriceUsd(raw: unknown): number | null {
  if (typeof raw !== 'string') return null;
  const match = raw.match(/\$?\s*(\d+)/);
  if (!match) return null;
  return Number.parseInt(match[1] ?? '', 10);
}

function parseLocaleWu(raw: unknown): number | null {
  if (typeof raw !== 'string') return null;
  const normalized = raw.replace(/,/g, '');
  const match = normalized.match(/(\d+)\s*WU/i);
  if (!match) return null;
  return Number.parseInt(match[1] ?? '', 10);
}

export function validateCloudPricingAgainstCp(errors: string[]): void {
  for (const planKey of CLOUD_PLAN_KEYS) {
    let expectedUsd: number;
    let expectedWu: number;
    try {
      expectedUsd = parseCpMonthlyUsd(planKey);
      expectedWu = parseCpMonthlyWu(planKey);
    } catch (error) {
      errors.push(`[cp] ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }

    for (const locale of LOCALES) {
      const cloud = loadCloud(locale);
      const priceRaw = getAt(cloud, `pricingPreview.plans.${planKey}.price`);
      const wuRaw = getAt(cloud, `pricingPreview.plans.${planKey}.wu`);
      const localeUsd = parseLocalePriceUsd(priceRaw);
      const localeWu = parseLocaleWu(wuRaw);

      if (localeUsd === null) {
        errors.push(`[${locale}] cloud.pricingPreview.plans.${planKey}.price is not parseable USD`);
      } else if (localeUsd !== expectedUsd) {
        errors.push(
          `[${locale}] cloud.pricingPreview.plans.${planKey}.price=$${localeUsd} != CP catalog $${expectedUsd}`,
        );
      }

      if (localeWu === null) {
        errors.push(`[${locale}] cloud.pricingPreview.plans.${planKey}.wu is not parseable WU`);
      } else if (localeWu !== expectedWu) {
        errors.push(
          `[${locale}] cloud.pricingPreview.plans.${planKey}.wu=${localeWu} != CP plans monthly_wu=${expectedWu}`,
        );
      }
    }
  }
}
