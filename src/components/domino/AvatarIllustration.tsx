import React from 'react';

import { AvatarConfig } from '@/constants/avatarCatalog';
import { BotMood, getClubBotAvatarBySeat } from '@/constants/seatProfiles';
import { ModularAvatar } from './ModularAvatar';

interface AvatarIllustrationProps {
  isBot: boolean;
  accentColor: string;
  mood?: BotMood;
  size?: number;
  seatHint?: number;
  avatarConfig?: AvatarConfig;
}

/**
 * Unified 2.5D Illustrated Club Portraits across both Human Players and Club CPU Companions.
 * Zero mismatched metallic robots — every seat at the table shares one warm illustrated art style.
 */
export function AvatarIllustration({
  isBot,
  mood = 'idle',
  size = 48,
  seatHint = 1,
  avatarConfig,
}: AvatarIllustrationProps) {
  const resolvedConfig =
    avatarConfig ?? (isBot ? getClubBotAvatarBySeat(seatHint) : undefined);

  return <ModularAvatar config={resolvedConfig} mood={mood} size={size} />;
}
