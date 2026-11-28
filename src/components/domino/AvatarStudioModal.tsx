import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  AVATAR_COSMETIC_PRICES,
  AVATAR_EYE_COLORS,
  AVATAR_EYE_OPTIONS,
  AVATAR_EYEBROW_OPTIONS,
  AVATAR_FACE_SHAPE_OPTIONS,
  AVATAR_FACIAL_OPTIONS,
  AVATAR_FRAME_OPTIONS,
  AVATAR_GLASSES_OPTIONS,
  AVATAR_HAIR_COLORS,
  AVATAR_HAIR_OPTIONS,
  AVATAR_HAT_OPTIONS,
  AVATAR_MOUTH_OPTIONS,
  AVATAR_NOSE_OPTIONS,
  AVATAR_OUTFIT_COLORS,
  AVATAR_OUTFIT_OPTIONS,
  AVATAR_SKIN_TONES,
  AVATAR_THEMATIC_LOOKS,
  AvatarBodyType,
  AvatarConfig,
  AvatarItemOption,
  BASE_FEMALE_AVATAR,
  BASE_MALE_AVATAR,
  EYE_STYLES_WITHOUT_IRIS_COLOR,
  OUTFITS_WITH_FIXED_COLOR,
  sortOptionsForBodyType,
} from '@/constants/avatarCatalog';
import { CLUB, FONT } from '@/constants/tokens';
import { usePalette } from '@/context/PaletteContext';
import { RetentionProgress } from '@/storage/gameStorage';
import { hapticLight, hapticSnap, hapticWarning } from '@/utils/feedback';
import { GlossyButton } from './GlossyButton';
import { CheckIcon, ChipIcon, CloseIcon, LockIcon } from './Icons';
import { ModularAvatar } from './ModularAvatar';

type MacroSection = 'looks' | 'face' | 'hair' | 'expression' | 'outfit' | 'extras';
type FaceSubTab = 'shape' | 'nose' | 'facial';
type ExprSubTab = 'eyes' | 'mouth' | 'brows';
type ExtrasSubTab = 'hat' | 'glasses' | 'frame';

const MACRO_SECTIONS: { id: MacroSection; label: string }[] = [
  { id: 'looks', label: 'Looks' },
  { id: 'face', label: 'Rostro' },
  { id: 'hair', label: 'Pelo' },
  { id: 'expression', label: 'Expresión' },
  { id: 'outfit', label: 'Ropa' },
  { id: 'extras', label: 'Extras' },
];

interface AvatarStudioModalProps {
  visible: boolean;
  retention: RetentionProgress;
  onUnlockAndSaveAvatar: (
    nextConfig: AvatarConfig,
    keysToUnlock: string[]
  ) => void;
  onClose: () => void;
}

function getLockedKeysInConfig(
  cfg: AvatarConfig,
  ownedSet: Set<string>
): string[] {
  const keys = [
    `hair:${cfg.hair}`,
    `eye:${cfg.eyeStyle}`,
    `mouth:${cfg.mouth}`,
    `facial:${cfg.facial}`,
    `outfit:${cfg.outfit}`,
    `glasses:${cfg.glasses}`,
    `hat:${cfg.hat}`,
    `frame:${cfg.frame}`,
  ];
  return keys.filter((k) => k in AVATAR_COSMETIC_PRICES && !ownedSet.has(k));
}

export function AvatarStudioModal({
  visible,
  retention,
  onUnlockAndSaveAvatar,
  onClose,
}: AvatarStudioModalProps) {
  const { palette } = usePalette();
  const [draft, setDraft] = useState<AvatarConfig>(retention.avatarConfig);
  const [section, setSection] = useState<MacroSection>('looks');
  const [faceSub, setFaceSub] = useState<FaceSubTab>('shape');
  const [exprSub, setExprSub] = useState<ExprSubTab>('eyes');
  const [extrasSub, setExtrasSub] = useState<ExtrasSubTab>('hat');
  const catalogScrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  useEffect(() => {
    if (visible) {
      setDraft(retention.avatarConfig);
      setSection('looks');
      setFaceSub('shape');
      setExprSub('eyes');
      setExtrasSub('hat');
      catalogScrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [visible, retention.avatarConfig]);

  useEffect(() => {
    catalogScrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [section, faceSub, exprSub, extrasSub, draft.bodyType]);

  const ownedSet = useMemo(
    () => new Set(retention.unlockedCosmetics),
    [retention.unlockedCosmetics]
  );

  const pendingUnlockKeys = useMemo(
    () => getLockedKeysInConfig(draft, ownedSet),
    [draft, ownedSet]
  );

  const totalCost = useMemo(
    () =>
      pendingUnlockKeys.reduce(
        (sum, k) => sum + (AVATAR_COSMETIC_PRICES[k] ?? 0),
        0
      ),
    [pendingUnlockKeys]
  );

  const canAffordAll = retention.clubChips >= totalCost;

  const hasChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(retention.avatarConfig),
    [draft, retention.avatarConfig]
  );

  const handleSelectBase = (bodyType: AvatarBodyType) => {
    hapticLight();
    const baseTemplate =
      bodyType === 'feminine' ? BASE_FEMALE_AVATAR : BASE_MALE_AVATAR;
    setDraft((prev) => ({
      ...baseTemplate,
      skinTone: prev.skinTone,
      eyeColor: prev.eyeColor,
      frame: prev.frame,
    }));
  };

  const handleRandomizeFreeOrOwned = () => {
    hapticLight();
    const pick = <T,>(arr: T[]): T =>
      arr[Math.floor(Math.random() * arr.length)];
    const ownedOrFreeForBase = <T extends string>(list: AvatarItemOption<T>[]) =>
      list.filter(
        (i) =>
          (!i.cosmeticKey || ownedSet.has(i.cosmeticKey)) &&
          (!i.affinity || i.affinity === 'unisex' || i.affinity === draft.bodyType)
      );

    setDraft({
      bodyType: draft.bodyType,
      skinTone: pick(AVATAR_SKIN_TONES).id,
      faceShape: pick(AVATAR_FACE_SHAPE_OPTIONS).id,
      eyeStyle: pick(ownedOrFreeForBase(AVATAR_EYE_OPTIONS)).id,
      eyeColor: pick(AVATAR_EYE_COLORS).hex,
      eyebrows: pick(AVATAR_EYEBROW_OPTIONS).id,
      nose: pick(AVATAR_NOSE_OPTIONS).id,
      mouth: pick(ownedOrFreeForBase(AVATAR_MOUTH_OPTIONS)).id,
      hair: pick(ownedOrFreeForBase(AVATAR_HAIR_OPTIONS)).id,
      hairColor: pick(AVATAR_HAIR_COLORS).hex,
      facial: pick(ownedOrFreeForBase(AVATAR_FACIAL_OPTIONS)).id,
      outfit: pick(ownedOrFreeForBase(AVATAR_OUTFIT_OPTIONS)).id,
      outfitColor: pick(AVATAR_OUTFIT_COLORS).hex,
      glasses: pick(ownedOrFreeForBase(AVATAR_GLASSES_OPTIONS)).id,
      hat: pick(ownedOrFreeForBase(AVATAR_HAT_OPTIONS)).id,
      frame: pick(ownedOrFreeForBase(AVATAR_FRAME_OPTIONS)).id,
    });
  };

  const sortedHairOptions = useMemo(
    () => sortOptionsForBodyType(AVATAR_HAIR_OPTIONS, draft.bodyType, ownedSet),
    [draft.bodyType, ownedSet]
  );
  const sortedFacialOptions = useMemo(
    () => sortOptionsForBodyType(AVATAR_FACIAL_OPTIONS, draft.bodyType, ownedSet),
    [draft.bodyType, ownedSet]
  );
  const sortedOutfitOptions = useMemo(
    () => sortOptionsForBodyType(AVATAR_OUTFIT_OPTIONS, draft.bodyType, ownedSet),
    [draft.bodyType, ownedSet]
  );
  const sortedEyeOptions = useMemo(
    () => sortOptionsForBodyType(AVATAR_EYE_OPTIONS, draft.bodyType, ownedSet),
    [draft.bodyType, ownedSet]
  );
  const sortedMouthOptions = useMemo(
    () => sortOptionsForBodyType(AVATAR_MOUTH_OPTIONS, draft.bodyType, ownedSet),
    [draft.bodyType, ownedSet]
  );
  const sortedGlassesOptions = useMemo(
    () => sortOptionsForBodyType(AVATAR_GLASSES_OPTIONS, draft.bodyType, ownedSet),
    [draft.bodyType, ownedSet]
  );
  const sortedHatOptions = useMemo(
    () => sortOptionsForBodyType(AVATAR_HAT_OPTIONS, draft.bodyType, ownedSet),
    [draft.bodyType, ownedSet]
  );
  const sortedFrameOptions = useMemo(
    () => sortOptionsForBodyType(AVATAR_FRAME_OPTIONS, draft.bodyType, ownedSet),
    [draft.bodyType, ownedSet]
  );

  const handleStripLockedItems = () => {
    hapticLight();
    const fallback = retention.avatarConfig;
    const isLocked = (key: string) =>
      key in AVATAR_COSMETIC_PRICES && !ownedSet.has(key);

    setDraft((prev) => ({
      ...prev,
      hair: isLocked(`hair:${prev.hair}`) ? fallback.hair : prev.hair,
      eyeStyle: isLocked(`eye:${prev.eyeStyle}`) ? fallback.eyeStyle : prev.eyeStyle,
      mouth: isLocked(`mouth:${prev.mouth}`) ? fallback.mouth : prev.mouth,
      facial: isLocked(`facial:${prev.facial}`) ? fallback.facial : prev.facial,
      outfit: isLocked(`outfit:${prev.outfit}`) ? fallback.outfit : prev.outfit,
      glasses: isLocked(`glasses:${prev.glasses}`) ? fallback.glasses : prev.glasses,
      hat: isLocked(`hat:${prev.hat}`) ? fallback.hat : prev.hat,
      frame: isLocked(`frame:${prev.frame}`) ? fallback.frame : prev.frame,
    }));
  };

  const handleCommit = () => {
    if (totalCost > 0 && !canAffordAll) {
      hapticWarning();
      return;
    }
    hapticSnap();
    onUnlockAndSaveAvatar(draft, pendingUnlockKeys);
    onClose();
  };

  const renderSubPills = <T extends string>(
    options: { id: T; label: string }[],
    activeId: T,
    onSelect: (id: T) => void
  ) => (
    <View
      style={[
        styles.subPillBar,
        {
          backgroundColor: palette.modalInputBg,
          borderColor: palette.modalCardBorder,
        },
      ]}
    >
      {options.map((opt) => {
        const active = activeId === opt.id;
        return (
          <Pressable
            key={opt.id}
            onPress={() => {
              hapticLight();
              onSelect(opt.id);
            }}
            style={[
              styles.subPillBtn,
              active && {
                backgroundColor: palette.selectedBg,
              },
            ]}
          >
            <Text
              style={[
                styles.subPillText,
                {
                  color: active ? palette.selectedText : palette.textSecondary,
                },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderLooksGrid = () => (
    <View style={styles.looksList}>
      {AVATAR_THEMATIC_LOOKS.map((look) => {
        const previewCfg = look.build(draft);
        const missingKeys = getLockedKeysInConfig(previewCfg, ownedSet);
        const lookCost = missingKeys.reduce(
          (sum, k) => sum + (AVATAR_COSMETIC_PRICES[k] ?? 0),
          0
        );
        const isCurrent =
          draft.outfit === previewCfg.outfit &&
          draft.hat === previewCfg.hat &&
          draft.glasses === previewCfg.glasses &&
          draft.hair === previewCfg.hair;

        return (
          <Pressable
            key={look.id}
            onPress={() => {
              hapticSnap();
              setDraft(previewCfg);
            }}
            style={({ pressed }) => [
              styles.lookCard,
              {
                backgroundColor: isCurrent
                  ? palette.winnerCardBg
                  : palette.modalCardBg,
                borderColor: isCurrent
                  ? palette.winnerCardBorder
                  : palette.modalCardBorder,
                borderBottomColor: isCurrent
                  ? palette.winnerCardBorder
                  : palette.modalCardLip,
              },
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <ModularAvatar config={previewCfg} size={66} showFrameRing />
            <View style={styles.lookTextCol}>
              <View style={styles.lookTopRow}>
                <Text style={[styles.lookName, { color: palette.textPrimary }]}>
                  {look.name}
                </Text>
                <View
                  style={[
                    styles.lookTagBadge,
                    { backgroundColor: palette.accentBg },
                  ]}
                >
                  <Text style={[styles.lookTagText, { color: palette.accent }]}>
                    {look.tag}
                  </Text>
                </View>
              </View>
              <Text
                style={[styles.lookSub, { color: palette.textSecondary }]}
                numberOfLines={2}
              >
                {look.subtitle}
              </Text>
            </View>
            <View
              style={[
                styles.lookPriceBadge,
                {
                  backgroundColor:
                    lookCost === 0 ? palette.positiveBg : palette.chipPillBg,
                  borderColor:
                    lookCost === 0 ? palette.positiveBorder : palette.borderWarm,
                },
              ]}
            >
              {lookCost === 0 ? (
                <Text
                  style={[styles.lookPriceText, { color: palette.positiveText }]}
                >
                  {isCurrent ? 'Puesto' : 'Probar'}
                </Text>
              ) : (
                <>
                  <ChipIcon size={12} color={palette.chipIconColor} />
                  <Text
                    style={[
                      styles.lookPriceText,
                      { color: palette.chipPillText },
                    ]}
                  >
                    {lookCost.toLocaleString('es-ES')}
                  </Text>
                </>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );

  const renderItemGrid = <T extends string>(
    items: AvatarItemOption<T>[],
    selectedId: T,
    applyItem: (id: T) => AvatarConfig,
    options?: { useFaceCamera?: boolean; stripGlasses?: boolean; stripHat?: boolean; showRing?: boolean }
  ) => (
    <View style={styles.grid}>
      {items.map((item) => {
        const isFree = !item.cosmeticKey || item.costChips === 0;
        const isOwned = isFree || ownedSet.has(item.cosmeticKey!);
        const isSelected = selectedId === item.id;
        const nextCfg = applyItem(item.id);
        const thumbCfg: AvatarConfig = {
          ...nextCfg,
          glasses: options?.stripGlasses ? 'none' : nextCfg.glasses,
          hat: options?.stripHat ? 'none' : nextCfg.hat,
        };

        return (
          <Pressable
            key={item.id}
            onPress={() => {
              hapticLight();
              setDraft(nextCfg);
            }}
            style={({ pressed }) => [
              styles.itemCard,
              {
                backgroundColor: isSelected
                  ? palette.winnerCardBg
                  : palette.modalCardBg,
                borderColor: isSelected
                  ? palette.winnerCardBorder
                  : palette.modalCardBorder,
                borderBottomColor: isSelected
                  ? palette.winnerCardBorder
                  : palette.modalCardLip,
              },
              pressed && { transform: [{ scale: 0.96 }] },
            ]}
          >
            {item.tag && (
              <View
                style={[
                  styles.tagBadge,
                  {
                    backgroundColor: palette.chipPillBg,
                    borderColor: palette.borderWarm,
                  },
                ]}
              >
                <Text style={[styles.tagText, { color: palette.chipPillText }]}>
                  {item.tag}
                </Text>
              </View>
            )}
            <View style={styles.thumbWindow}>
              <ModularAvatar
                config={thumbCfg}
                size={68}
                camera={options?.useFaceCamera ? 'face' : 'bust'}
                showFrameRing={Boolean(options?.showRing)}
              />
            </View>
            <Text
              style={[styles.itemName, { color: palette.textPrimary }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <View
              style={[
                styles.pricePill,
                {
                  backgroundColor: isOwned
                    ? isSelected
                      ? palette.accent
                      : palette.modalInputBg
                    : palette.chipPillBg,
                },
              ]}
            >
              {isOwned ? (
                <>
                  {isSelected && (
                    <CheckIcon size={11} color={palette.textOnAccent} />
                  )}
                  <Text
                    style={[
                      styles.priceTextOwned,
                      {
                        color: isSelected
                          ? palette.textOnAccent
                          : palette.textSecondary,
                      },
                    ]}
                  >
                    {isSelected ? 'Puesto' : isFree ? 'Gratis' : 'Tuyo'}
                  </Text>
                </>
              ) : (
                <>
                  <LockIcon size={10} color={palette.chipPillText} />
                  <ChipIcon size={11} color={palette.chipIconColor} />
                  <Text
                    style={[
                      styles.priceTextLocked,
                      { color: palette.chipPillText },
                    ]}
                  >
                    {item.costChips.toLocaleString('es-ES')}
                  </Text>
                </>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: palette.modalBackdrop }]}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: palette.modalBg,
              borderColor: palette.modalBorder,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: palette.textPrimary }]}>
                Vestidor del Club
              </Text>
              <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
                Crea tu identidad y pruébala en vivo
              </Text>
            </View>
            <View style={styles.headerRight}>
              <View
                style={[
                  styles.chipsBadge,
                  {
                    backgroundColor: palette.chipPillBg,
                    borderColor: palette.borderWarm,
                  },
                ]}
              >
                <ChipIcon size={14} color={palette.chipIconColor} />
                <Text style={[styles.chipsText, { color: palette.chipPillText }]}>
                  {retention.clubChips.toLocaleString('es-ES')}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Cerrar vestidor"
                style={[styles.closeBtn, { backgroundColor: palette.closeBtnBg }]}
              >
                <CloseIcon size={18} color={palette.textPrimary} />
              </Pressable>
            </View>
          </View>

          {/* Studio Stage Card */}
          <View
            style={[
              styles.stageCard,
              {
                backgroundColor: palette.modalCardBg,
                borderColor: palette.modalCardBorder,
                borderBottomColor: palette.modalCardLip,
              },
            ]}
          >
            <View
              style={[
                styles.stagePortraitHalo,
                { borderColor: palette.brandAccent },
              ]}
            >
              <ModularAvatar config={draft} size={108} showFrameRing />
            </View>
            <View style={styles.stageRight}>
              <Text style={[styles.presetsLabel, { color: palette.textMuted }]}>
                FIGURA BASE
              </Text>
              <View style={styles.baseToggleRow}>
                <Pressable
                  onPress={() => handleSelectBase('feminine')}
                  style={({ pressed }) => [
                    styles.baseBtn,
                    {
                      backgroundColor:
                        draft.bodyType === 'feminine'
                          ? palette.selectedBg
                          : palette.modalInputBg,
                      borderColor:
                        draft.bodyType === 'feminine'
                          ? palette.selectedBorder
                          : palette.modalCardBorder,
                    },
                    pressed && { opacity: 0.86 },
                  ]}
                >
                  <ModularAvatar config={BASE_FEMALE_AVATAR} size={26} />
                  <Text
                    style={[
                      styles.baseBtnText,
                      {
                        color:
                          draft.bodyType === 'feminine'
                            ? palette.selectedText
                            : palette.textPrimary,
                      },
                    ]}
                  >
                    Mujer
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleSelectBase('masculine')}
                  style={({ pressed }) => [
                    styles.baseBtn,
                    {
                      backgroundColor:
                        draft.bodyType === 'masculine'
                          ? palette.selectedBg
                          : palette.modalInputBg,
                      borderColor:
                        draft.bodyType === 'masculine'
                          ? palette.selectedBorder
                          : palette.modalCardBorder,
                    },
                    pressed && { opacity: 0.86 },
                  ]}
                >
                  <ModularAvatar config={BASE_MALE_AVATAR} size={26} />
                  <Text
                    style={[
                      styles.baseBtnText,
                      {
                        color:
                          draft.bodyType === 'masculine'
                            ? palette.selectedText
                            : palette.textPrimary,
                      },
                    ]}
                  >
                    Hombre
                  </Text>
                </Pressable>
              </View>

              <Pressable
                onPress={handleRandomizeFreeOrOwned}
                style={({ pressed }) => [
                  styles.presetChipRandom,
                  { backgroundColor: palette.accent },
                  pressed && { opacity: 0.86 },
                ]}
              >
                <Text
                  style={[
                    styles.presetChipRandomText,
                    { color: palette.textOnAccent },
                  ]}
                >
                  Sorpréndeme (Aleatorio)
                </Text>
              </Pressable>
            </View>
          </View>

          {/* 6 Clear Macro-Sections */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
            style={styles.tabsScroll}
          >
            {MACRO_SECTIONS.map((t) => {
              const active = section === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => {
                    hapticLight();
                    setSection(t.id);
                  }}
                  style={[
                    styles.tabPill,
                    {
                      backgroundColor: active
                        ? palette.selectedBg
                        : palette.modalCardBg,
                      borderColor: active
                        ? palette.selectedBorder
                        : palette.modalCardBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabPillText,
                      {
                        color: active
                          ? palette.selectedText
                          : palette.textSecondary,
                      },
                    ]}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Contextual Color Swatches & Sub-Selectors */}
          {section === 'face' && (
            <>
              <View style={styles.swatchRow}>
                <Text style={[styles.swatchLabel, { color: palette.textSecondary }]}>
                  Piel:
                </Text>
                {AVATAR_SKIN_TONES.map((s) => {
                  const active = draft.skinTone === s.id;
                  return (
                    <Pressable
                      key={s.id}
                      onPress={() => {
                        hapticLight();
                        setDraft((prev) => ({ ...prev, skinTone: s.id }));
                      }}
                      accessibilityLabel={`Piel ${s.name}`}
                      style={[
                        styles.swatchDot,
                        { backgroundColor: s.base },
                        active && styles.swatchDotActive,
                      ]}
                    />
                  );
                })}
              </View>
              {renderSubPills<FaceSubTab>(
                [
                  { id: 'shape', label: 'Forma' },
                  { id: 'nose', label: 'Nariz' },
                  {
                    id: 'facial',
                    label: draft.bodyType === 'feminine' ? 'Detalles' : 'Barba y Extras',
                  },
                ],
                faceSub,
                setFaceSub
              )}
            </>
          )}

          {section === 'hair' && draft.hair !== 'bald' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.swatchScroll}
              contentContainerStyle={styles.swatchRow}
            >
              <Text style={[styles.swatchLabel, { color: palette.textSecondary }]}>
                Color:
              </Text>
              {AVATAR_HAIR_COLORS.map((c) => {
                const active = draft.hairColor === c.hex;
                return (
                  <Pressable
                    key={c.hex}
                    onPress={() => {
                      hapticLight();
                      setDraft((prev) => ({ ...prev, hairColor: c.hex }));
                    }}
                    style={[
                      styles.swatchDot,
                      { backgroundColor: c.hex },
                      active && styles.swatchDotActive,
                    ]}
                  />
                );
              })}
            </ScrollView>
          )}

          {section === 'expression' && (
            <>
              {exprSub === 'eyes' &&
                !EYE_STYLES_WITHOUT_IRIS_COLOR.has(draft.eyeStyle) && (
                  <View style={styles.swatchRow}>
                    <Text
                      style={[styles.swatchLabel, { color: palette.textSecondary }]}
                    >
                      Iris:
                    </Text>
                    {AVATAR_EYE_COLORS.map((c) => {
                      const active = draft.eyeColor === c.hex;
                      return (
                        <Pressable
                          key={c.hex}
                          onPress={() => {
                            hapticLight();
                            setDraft((prev) => ({ ...prev, eyeColor: c.hex }));
                          }}
                          style={[
                            styles.swatchDot,
                            { backgroundColor: c.hex },
                            active && styles.swatchDotActive,
                          ]}
                        />
                      );
                    })}
                  </View>
                )}
              {renderSubPills<ExprSubTab>(
                [
                  { id: 'eyes', label: 'Ojos' },
                  { id: 'mouth', label: 'Boca' },
                  { id: 'brows', label: 'Cejas' },
                ],
                exprSub,
                setExprSub
              )}
            </>
          )}

          {section === 'outfit' && !OUTFITS_WITH_FIXED_COLOR.has(draft.outfit) && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.swatchScroll}
              contentContainerStyle={styles.swatchRow}
            >
              <Text style={[styles.swatchLabel, { color: palette.textSecondary }]}>
                Tono:
              </Text>
              {AVATAR_OUTFIT_COLORS.map((c) => {
                const active = draft.outfitColor === c.hex;
                return (
                  <Pressable
                    key={c.hex}
                    onPress={() => {
                      hapticLight();
                      setDraft((prev) => ({ ...prev, outfitColor: c.hex }));
                    }}
                    style={[
                      styles.swatchDot,
                      { backgroundColor: c.hex },
                      active && styles.swatchDotActive,
                    ]}
                  />
                );
              })}
            </ScrollView>
          )}

          {section === 'extras' &&
            renderSubPills<ExtrasSubTab>(
              [
                { id: 'hat', label: 'Cabeza' },
                { id: 'glasses', label: 'Gafas' },
                { id: 'frame', label: 'Fondo' },
              ],
              extrasSub,
              setExtrasSub
            )}

          {/* Catalog Grid with Automatic Face-Zoom Camera on Facial Traits */}
          <ScrollView
            ref={catalogScrollRef}
            style={styles.catalogScroll}
            contentContainerStyle={styles.catalogContent}
            showsVerticalScrollIndicator={false}
          >
            {section === 'looks' && renderLooksGrid()}

            {section === 'face' &&
              faceSub === 'shape' &&
              renderItemGrid(
                AVATAR_FACE_SHAPE_OPTIONS,
                draft.faceShape,
                (id) => ({ ...draft, faceShape: id }),
                { useFaceCamera: true, stripGlasses: true }
              )}

            {section === 'face' &&
              faceSub === 'nose' &&
              renderItemGrid(
                AVATAR_NOSE_OPTIONS,
                draft.nose,
                (id) => ({ ...draft, nose: id }),
                { useFaceCamera: true, stripGlasses: true }
              )}

            {section === 'face' &&
              faceSub === 'facial' &&
              renderItemGrid(
                sortedFacialOptions,
                draft.facial,
                (id) => ({ ...draft, facial: id }),
                { useFaceCamera: true }
              )}

            {section === 'hair' &&
              renderItemGrid(
                sortedHairOptions,
                draft.hair,
                (id) => ({ ...draft, hair: id }),
                { stripHat: true }
              )}

            {section === 'expression' &&
              exprSub === 'eyes' &&
              renderItemGrid(
                sortedEyeOptions,
                draft.eyeStyle,
                (id) => ({ ...draft, eyeStyle: id }),
                { useFaceCamera: true, stripGlasses: true }
              )}

            {section === 'expression' &&
              exprSub === 'mouth' &&
              renderItemGrid(
                sortedMouthOptions,
                draft.mouth,
                (id) => ({ ...draft, mouth: id }),
                { useFaceCamera: true }
              )}

            {section === 'expression' &&
              exprSub === 'brows' &&
              renderItemGrid(
                AVATAR_EYEBROW_OPTIONS,
                draft.eyebrows,
                (id) => ({ ...draft, eyebrows: id }),
                { useFaceCamera: true, stripGlasses: true }
              )}

            {section === 'outfit' &&
              renderItemGrid(sortedOutfitOptions, draft.outfit, (id) => ({
                ...draft,
                outfit: id,
              }))}

            {section === 'extras' &&
              extrasSub === 'hat' &&
              renderItemGrid(sortedHatOptions, draft.hat, (id) => ({
                ...draft,
                hat: id,
              }))}

            {section === 'extras' &&
              extrasSub === 'glasses' &&
              renderItemGrid(
                sortedGlassesOptions,
                draft.glasses,
                (id) => ({ ...draft, glasses: id }),
                { useFaceCamera: true }
              )}

            {section === 'extras' &&
              extrasSub === 'frame' &&
              renderItemGrid(
                sortedFrameOptions,
                draft.frame,
                (id) => ({ ...draft, frame: id }),
                { showRing: true }
              )}
          </ScrollView>

          {/* Sticky Bottom Action Bar */}
          <View style={styles.footer}>
            {totalCost > 0 && !canAffordAll ? (
              <View
                style={[
                  styles.insufficientBox,
                  {
                    backgroundColor: palette.dangerBg,
                    borderColor: palette.dangerBorder,
                  },
                ]}
              >
                <Text
                  style={[styles.insufficientText, { color: palette.dangerText }]}
                >
                  Faltan{' '}
                  {(totalCost - retention.clubChips).toLocaleString('es-ES')}{' '}
                  fichas para desbloquear este conjunto.
                </Text>
                <Pressable
                  onPress={handleStripLockedItems}
                  style={({ pressed }) => [
                    styles.stripLockedBtn,
                    { backgroundColor: palette.modalCardBg },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text
                    style={[
                      styles.stripLockedBtnText,
                      { color: palette.textPrimary },
                    ]}
                  >
                    Quitar bloqueados
                  </Text>
                </Pressable>
              </View>
            ) : null}

            <GlossyButton
              variant={
                totalCost > 0
                  ? canAffordAll
                    ? 'gold'
                    : 'glass'
                  : 'emerald'
              }
              title={
                totalCost > 0
                  ? `Desbloquear y usar (${totalCost.toLocaleString('es-ES')} fichas)`
                  : hasChanges
                  ? 'Guardar mi Avatar'
                  : 'Listo'
              }
              disabled={totalCost > 0 && !canAffordAll}
              onPress={handleCommit}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '92%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1.5,
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 22,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontFamily: FONT.display,
    fontSize: 20,
  },
  subtitle: {
    fontFamily: FONT.semi,
    fontSize: 12,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipsText: {
    fontFamily: FONT.extraBold,
    fontSize: 12.5,
    fontVariant: ['tabular-nums'],
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 22,
    borderWidth: 1.25,
    borderBottomWidth: 4,
    padding: 12,
  },
  stagePortraitHalo: {
    padding: 3,
    borderRadius: 64,
    borderWidth: 2,
  },
  stageRight: {
    flex: 1,
    gap: 7,
  },
  presetsLabel: {
    fontFamily: FONT.extraBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  baseToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  baseBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.25,
    borderRadius: 13,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  baseBtnText: {
    fontFamily: FONT.extraBold,
    fontSize: 12.5,
  },
  presetChipRandom: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  presetChipRandomText: {
    fontFamily: FONT.extraBold,
    fontSize: 12,
  },
  tabsScroll: {
    flexGrow: 0,
  },
  tabsRow: {
    gap: 6,
    paddingVertical: 2,
  },
  tabPill: {
    paddingHorizontal: 13,
    paddingVertical: 7.5,
    borderRadius: 13,
    borderWidth: 1.25,
  },
  tabPillText: {
    fontFamily: FONT.extraBold,
    fontSize: 12.5,
  },
  subPillBar: {
    flexDirection: 'row',
    gap: 5,
    padding: 4,
    borderRadius: 13,
    borderWidth: 1,
  },
  subPillBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 9,
    alignItems: 'center',
  },
  subPillText: {
    fontFamily: FONT.extraBold,
    fontSize: 12,
  },
  swatchScroll: {
    flexGrow: 0,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  swatchLabel: {
    fontFamily: FONT.extraBold,
    fontSize: 11.5,
  },
  swatchDot: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    borderWidth: 2,
    borderColor: 'rgba(148, 163, 184, 0.45)',
  },
  swatchDotActive: {
    borderColor: CLUB.gold,
    borderWidth: 3,
    transform: [{ scale: 1.14 }],
  },
  catalogScroll: {
    flex: 1,
  },
  catalogContent: {
    paddingBottom: 14,
  },
  looksList: {
    gap: 10,
  },
  lookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1.25,
    borderBottomWidth: 4,
    padding: 11,
  },
  lookTextCol: {
    flex: 1,
    gap: 3,
  },
  lookTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  lookName: {
    fontFamily: FONT.display,
    fontSize: 15.5,
  },
  lookTagBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  lookTagText: {
    fontFamily: FONT.extraBold,
    fontSize: 9.5,
  },
  lookSub: {
    fontFamily: FONT.semi,
    fontSize: 11.5,
    lineHeight: 16,
  },
  lookPriceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  lookPriceText: {
    fontFamily: FONT.extraBold,
    fontSize: 11.5,
    fontVariant: ['tabular-nums'],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  itemCard: {
    width: '31.3%',
    borderRadius: 16,
    borderWidth: 1.25,
    borderBottomWidth: 3.5,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 5,
    position: 'relative',
  },
  tagBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    zIndex: 4,
  },
  tagText: {
    fontFamily: FONT.extraBold,
    fontSize: 8.5,
  },
  thumbWindow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemName: {
    fontFamily: FONT.extraBold,
    fontSize: 11,
    textAlign: 'center',
  },
  pricePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    minWidth: 62,
  },
  priceTextOwned: {
    fontFamily: FONT.extraBold,
    fontSize: 10,
  },
  priceTextLocked: {
    fontFamily: FONT.extraBold,
    fontSize: 10.5,
    fontVariant: ['tabular-nums'],
  },
  footer: {
    gap: 8,
    paddingTop: 4,
  },
  insufficientBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  insufficientText: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: 11.5,
  },
  stripLockedBtn: {
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stripLockedBtnText: {
    fontFamily: FONT.extraBold,
    fontSize: 11,
  },
});
