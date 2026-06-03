'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight02Icon } from 'hugeicons-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/classnameUtils';
import { getAppUrl } from '@/lib/deploy-mode';
import MarketingShell from '@/components/marketing/MarketingShell';

interface PlanDisplay {
  name: string;
  price: string;
  period: string;
  wu: string;
  features: string[];
  highlight: boolean;
}

const PLANS: PlanDisplay[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    wu: '600 WU/mo',
    features: ['1 agent', 'Basic memory', 'Community support'],
    highlight: false,
  },
  {
    name: 'Companion',
    price: '$19',
    period: '/mo',
    wu: '6,000 WU/mo',
    features: ['Unlimited agents', 'Full memory system', 'Multi-channel support'],
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/mo',
    wu: '18,000 WU/mo',
    features: ['Everything in Companion', 'Priority support', '7-day free trial'],
    highlight: true,
  },
  {
    name: 'Max',
    price: '$149',
    period: '/mo',
    wu: '60,000 WU/mo',
    features: ['Everything in Pro', 'Dedicated support', 'Custom integrations'],
    highlight: false,
  },
];

export default function PricingPage() {
  const t = useTranslations('marketing');

  return (
    <MarketingShell>
      <div className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/[0.06] blur-[120px]" />
          <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 h-[400px] w-[400px] rounded-full bg-primary-dark/[0.08] blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-16 sm:mb-20 text-center">
            <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t('pricingPreview.title')}
            </h1>
            <p className="text-base text-muted-foreground/80 sm:text-lg max-w-xl mx-auto leading-relaxed">
              {t('pricingPreview.subtitle')}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 items-start">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'group relative flex flex-col rounded-2xl p-[1px] transition-all duration-500',
                  plan.highlight
                    ? 'bg-gradient-to-b from-primary/60 via-primary/30 to-primary-dark/20 scale-[1.02] xl:-mt-4 xl:mb-4 shadow-2xl shadow-primary/10'
                    : 'bg-border/50 hover:bg-border/80',
                )}
              >
                <div
                  className={cn(
                    'relative flex flex-col flex-1 rounded-[15px] p-6 sm:p-7 transition-all duration-300',
                    plan.highlight ? 'bg-background' : 'bg-background/95 backdrop-blur-sm group-hover:bg-background',
                  )}
                >
                  {plan.highlight && (
                    <div className="absolute -top-px left-1/2 -translate-x-1/2 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
                  )}

                  <div className="mb-6">
                    <h3 className="text-base font-bold tracking-tight">{plan.name}</h3>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1.5">
                      <span className={cn(
                        'text-[42px] font-black tracking-tighter leading-none',
                        plan.highlight ? 'bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent' : '',
                      )}>
                        {plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground/60 font-medium">{plan.period}</span>
                    </div>
                  </div>

                  <div className={cn(
                    'mb-6 rounded-lg px-3 py-2',
                    plan.highlight ? 'bg-primary/[0.06]' : 'bg-muted/40',
                  )}>
                    <p className="text-sm font-bold text-foreground/90">{plan.wu}</p>
                  </div>

                  <ul className="space-y-3 text-[13px] text-muted-foreground/80 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <svg className={cn('shrink-0 mt-0.5 h-3.5 w-3.5', plan.highlight ? 'text-primary' : 'text-muted-foreground/50')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={cn(
                      'w-full rounded-full',
                      plan.highlight && 'bg-gradient-to-r from-primary to-primary-hover hover:opacity-90 shadow-lg shadow-primary/20 border-0 font-semibold',
                    )}
                    variant={plan.highlight ? 'default' : 'outline'}
                  >
                    <a href={getAppUrl('/auth/login')}>
                      {t('nav.getStarted')}
                      <ArrowRight02Icon className="ml-1 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              {t('pricingPreview.viewAll')}{' '}
              <a href={getAppUrl('/pricing')} className="text-primary hover:underline font-medium">
                {t('nav.getStarted')} →
              </a>
            </p>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
