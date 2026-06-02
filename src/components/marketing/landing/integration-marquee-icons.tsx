import type { ComponentType, ReactNode } from 'react';
import {
  Ai302,
  Anthropic,
  Azure,
  Bedrock,
  DeepSeek,
  Doubao,
  Fireworks,
  Gemini,
  Groq,
  Jina,
  LmStudio,
  Minimax,
  Mistral,
  Moonshot,
  Nvidia,
  Ollama,
  OpenAI,
  OpenRouter,
  Perplexity,
  Qwen,
  SiliconCloud,
  Spark,
  Together,
  XAI,
  XiaomiMiMo,
  Zhipu,
} from '@lobehub/icons';
import {
  SiDiscord,
  SiGmail,
  SiGooglechat,
  SiLine,
  SiMatrix,
  SiMattermost,
  SiSignal,
  SiSlack,
  SiTelegram,
  SiWechat,
  SiWhatsapp,
} from 'react-icons/si';
import { Mail01Icon } from 'hugeicons-react';

export interface MarqueeItem {
  id: string;
  name: string;
}

/** Top model providers — aligned with BUILT_IN_PROVIDERS */
export const MARQUEE_MODELS: MarqueeItem[] = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'gemini', name: 'Google Gemini' },
  { id: 'deepseek', name: 'DeepSeek' },
  { id: 'dashscope', name: 'Qwen' },
  { id: 'openrouter', name: 'OpenRouter' },
  { id: 'ollama', name: 'Ollama' },
  { id: 'groq', name: 'Groq' },
  { id: 'mistral', name: 'Mistral' },
  { id: 'moonshot', name: 'Moonshot' },
  { id: 'zai', name: 'Zhipu GLM' },
  { id: 'xai', name: 'xAI' },
  { id: 'azure', name: 'Azure OpenAI' },
  { id: 'bedrock', name: 'AWS Bedrock' },
  { id: 'together_ai', name: 'Together AI' },
  { id: 'siliconflow', name: 'SiliconFlow' },
];

/** IM / voice channels — aligned with CHANNELS_SYSTEM.md providers */
export const MARQUEE_CHANNELS: MarqueeItem[] = [
  { id: 'telegram', name: 'Telegram' },
  { id: 'discord', name: 'Discord' },
  { id: 'slack', name: 'Slack' },
  { id: 'whatsapp', name: 'WhatsApp' },
  { id: 'feishu', name: 'Feishu' },
  { id: 'wechat', name: 'WeChat' },
  { id: 'wecom', name: 'WeCom' },
  { id: 'teams', name: 'Microsoft Teams' },
  { id: 'matrix', name: 'Matrix' },
  { id: 'dingtalk', name: 'DingTalk' },
  { id: 'line', name: 'LINE' },
  { id: 'signal', name: 'Signal' },
  { id: 'googlechat', name: 'Google Chat' },
  { id: 'mattermost', name: 'Mattermost' },
  { id: 'email', name: 'Email' },
  { id: 'gmail', name: 'Gmail' },
];

const ICON_SIZE = 20;

function FeishuGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="#3370FF" aria-hidden>
      <path d="M6.3 3.8c.3-.5.9-.7 1.4-.4l9.6 5.5c.3.2.5.5.5.8v8.3c0 .6-.4 1-1 1-.2 0-.4-.1-.5-.2L6.2 8.5c-.7-.7-1-1.6-1-2.5 0-.8.4-1.6 1.1-2.2zm4.2 4.5l7.2 7.2V11c0-.2-.1-.4-.3-.5L10.5 8.3z" />
    </svg>
  );
}

function DingtalkGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="#0089FF" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 10.81l-.08.04c-.56.28-1.32.65-2.37 1.13l-.2.09.37 1.09.12.35h-2.65l-.05 2.42v.12h-1.26v-.11l.04-2.43H8.68l-.07-.14c-.04-.09-.05-.21 0-.38l.1-.34.14-.47c.06-.2.1-.27.28-.27h1.68l.21-1.27H9.1c-.09 0-.13-.05-.12-.14.08-.82.44-1.78 1.3-2.98.55-.77 1.22-1.5 1.84-2.13l.21-.22-.04.41c-.07.73-.08 1.26.06 1.67.15.42.44.65.94.85l.17.07-.13.12c-.51.48-.94 1.07-1.19 1.56-.17.33-.24.61-.18.82.04.15.15.24.35.29.12.03.26.04.42.04h2.9c.16 0 .26.05.28.14.03.13-.05.27-.27.38z" />
    </svg>
  );
}

function WecomGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="#2F7D31" aria-hidden>
      <path d="M12 2C6.48 2 2 6.02 2 11c0 2.76 1.36 5.22 3.5 6.78L4.5 22l4.2-1.8c1.04.28 2.14.44 3.3.44 5.52 0 10-4.02 10-9S17.52 2 12 2zm-3.2 6.8c.66 0 1.2.54 1.2 1.2s-.54 1.2-1.2 1.2-1.2-.54-1.2-1.2.54-1.2 1.2-1.2zm6.4 0c.66 0 1.2.54 1.2 1.2s-.54 1.2-1.2 1.2-1.2-.54-1.2-1.2.54-1.2 1.2-1.2z" />
    </svg>
  );
}

function TeamsGlyph({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="#6264A7" aria-hidden>
      <path d="M19.5 6.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM6 8a3 3 0 100 6 3 3 0 000-6zm11.5 1.5c1.38 0 2.5 1.12 2.5 2.5V17a1 1 0 01-1 1h-8.2A3.5 3.5 0 016 14.5v-1A2.5 2.5 0 018.5 11h9zM6 18.5A2.5 2.5 0 118.5 16H6v2.5z" />
    </svg>
  );
}

function SiIcon({ icon: Icon, color }: { icon: ComponentType<{ size?: number; color?: string }>; color?: string }) {
  return <Icon size={ICON_SIZE} color={color} />;
}

export function ModelMarqueeIcon({ id }: { id: string }): ReactNode {
  switch (id) {
    case 'openai':
      return <OpenAI size={ICON_SIZE} />;
    case 'anthropic':
      return <Anthropic size={ICON_SIZE} />;
    case 'gemini':
      return <Gemini.Color size={ICON_SIZE} />;
    case 'deepseek':
      return <DeepSeek.Color size={ICON_SIZE} />;
    case 'dashscope':
      return <Qwen.Color size={ICON_SIZE} />;
    case 'openrouter':
      return <OpenRouter size={ICON_SIZE} />;
    case 'ollama':
      return <Ollama size={ICON_SIZE} />;
    case 'groq':
      return <Groq size={ICON_SIZE} />;
    case 'mistral':
      return <Mistral.Color size={ICON_SIZE} />;
    case 'moonshot':
      return <Moonshot size={ICON_SIZE} />;
    case 'zai':
      return <Zhipu.Color size={ICON_SIZE} />;
    case 'xai':
      return <XAI size={ICON_SIZE} />;
    case 'azure':
      return <Azure.Color size={ICON_SIZE} />;
    case 'bedrock':
      return <Bedrock.Color size={ICON_SIZE} />;
    case 'together_ai':
      return <Together.Color size={ICON_SIZE} />;
    case 'siliconflow':
      return <SiliconCloud.Color size={ICON_SIZE} />;
    case 'volcengine':
      return <Doubao.Color size={ICON_SIZE} />;
    case 'fireworks_ai':
      return <Fireworks.Color size={ICON_SIZE} />;
    case 'spark':
      return <Spark.Color size={ICON_SIZE} />;
    case 'perplexity':
      return <Perplexity.Color size={ICON_SIZE} />;
    case 'jina_ai':
      return <Jina.Avatar size={ICON_SIZE} />;
    case 'minimax':
      return <Minimax size={ICON_SIZE} />;
    case 'lm_studio':
      return <LmStudio size={ICON_SIZE} />;
    case 'nvidia':
      return <Nvidia.Color size={ICON_SIZE} />;
    case 'xiaomi_mimo':
      return <XiaomiMiMo size={ICON_SIZE} />;
    case 'ai302':
      return <Ai302.Color size={ICON_SIZE} />;
    default:
      return null;
  }
}

export function ChannelMarqueeIcon({ id }: { id: string }): ReactNode {
  switch (id) {
    case 'telegram':
      return <SiIcon icon={SiTelegram} color="#26A5E4" />;
    case 'discord':
      return <SiIcon icon={SiDiscord} color="#5865F2" />;
    case 'slack':
      return <SiIcon icon={SiSlack} color="#4A154B" />;
    case 'whatsapp':
      return <SiIcon icon={SiWhatsapp} color="#25D366" />;
    case 'feishu':
      return <FeishuGlyph size={ICON_SIZE} />;
    case 'wechat':
      return <SiIcon icon={SiWechat} color="#07C160" />;
    case 'wecom':
      return <WecomGlyph size={ICON_SIZE} />;
    case 'teams':
      return <TeamsGlyph size={ICON_SIZE} />;
    case 'matrix':
      return <SiIcon icon={SiMatrix} color="#0DBD8B" />;
    case 'dingtalk':
      return <DingtalkGlyph size={ICON_SIZE} />;
    case 'line':
      return <SiIcon icon={SiLine} color="#00C300" />;
    case 'signal':
      return <SiIcon icon={SiSignal} color="#3A76F0" />;
    case 'googlechat':
      return <SiIcon icon={SiGooglechat} color="#1A73E8" />;
    case 'mattermost':
      return <SiIcon icon={SiMattermost} color="#0058CC" />;
    case 'email':
      return <Mail01Icon className="h-5 w-5" style={{ color: 'var(--ed-accent)' }} />;
    case 'gmail':
      return <SiIcon icon={SiGmail} color="#EA4335" />;
    default:
      return null;
  }
}
