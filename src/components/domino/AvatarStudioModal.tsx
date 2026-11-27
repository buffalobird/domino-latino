import { LinearGradient } from 'expo-linear-gradient';
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
  AvatarBodyType,
  AvatarConfig,
  AvatarItemOption,
  BASE_FEMALE_AVATAR,
  BASE_MALE_AVATAR,
  EYE_STYLES_WITHOUT_IRIS_COLOR,
  OUTFITS_WITH_FIXED_COLOR,
  sortOptionsForBodyType,
} from '@/constants/avatarCatalog';
import { CLUB } from '@/constants/tokens';
import { RetentionProgress } from '@/storage/gameStorage';
import { hapticLight, hapticSnap, hapticWarning } from '@/utils/feedback';
import { GlossyButton } from './GlossyButton';
import { CheckIcon, ChipIcon, CloseIcon, LockIcon } from './Icons';
import { ModularAvatar } from './ModularAvatar';

type StudioTab =
  | 'face'
  | 'eyes'
  | 'brows'
  | 'nose'
  | 'mouth'
  | 'hair'
  | 'facial'
  | 'outfit'
  | 'glasses'
  | 'hat'
  | 'frame';

const STUDIO_TABS: { id: StudioTab; label: string }[] = [
  { id: 'face', label: 'Rostro' },
  { id: 'hair', label: 'Cabello' },
  { id: 'eyes', label: 'Ojos' },
  { id: 'brows', label: 'Cejas' },
  { id: 'nose', label: 'Nariz' },
  { id: 'mouth', label: 'Boca' },
  { id: 'facial', label: 'Barba/Detalles' },
  { id: 'outfit', label: 'Ropa' },
  { id: 'glasses', label: 'Gafas' },
  { id: 'hat', label: 'Cabeza' },
  { id: 'frame', label: 'Fondo' },
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
  const [draft, setDraft] = useState<AvatarConfig>(retention.avatarConfig);
  const [activeTab, setActiveTab] = useState<StudioTab>('face');
  const catalogScrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const tabsScrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  useEffect(() => {
    if (visible) {
      setDraft(retention.avatarConfig);
      setActiveTab('face');
      tabsScrollRef.current?.scrollTo({ x: 0, animated: false });
      catalogScrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [visible, retention.avatarConfig]);

  useEffect(() => {
    catalogScrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [activeTab, draft.bodyType]);

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
    // Preserve user's chosen skinTone, eyeColor & frame when switching base figure
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

  const renderItemGrid = <T extends string>(
    items: AvatarItemOption<T>[],
    selectedId: T,
    applyItem: (id: T) => AvatarConfig
  ) => (
    <View style={styles.grid}>
      {items.map((item) => {
        const isFree = !item.cosmeticKey || item.costChips === 0;
        const isOwned = isFree || ownedSet.has(item.cosmeticKey!);
        const isSelected = selectedId === item.id;
        const nextCfg = applyItem(item.id);
        // Unobstructed thumbnail preview: never let sunglasses hide eyes/brows or hats hide hair!
        const thumbCfg: AvatarConfig =
          activeTab === 'eyes' || activeTab === 'brows'
            ? { ...nextCfg, glasses: 'none' }
            : activeTab === 'hair'
            ? { ...nextCfg, hat: 'none' }
            : nextCfg;

        return (
          <Pressable
            key={item.id}
            onPress={() => {
              hapticLight();
              setDraft(nextCfg);
            }}
            style={({ pressed }) => [
              styles.itemCard,
              isSelected && styles.itemCardSelected,
              pressed && { transform: [{ scale: 0.96 }] },
            ]}
          >
            {item.tag && (
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{item.tag}</Text>
              </View>
            )}
            <View style={styles.thumbWindow}>
              <ModularAvatar
                config={thumbCfg}
                size={68}
                showFrameRing={activeTab === 'frame'}
              />
            </View>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            <View
              style={[
                styles.pricePill,
                isOwned && styles.pricePillOwned,
                isSelected && isOwned && styles.pricePillSelected,
              ]}
            >
              {isOwned ? (
                <>
                  {isSelected && <CheckIcon size={11} color="#FFFFFF" />}
                  <Text
                    style={[
                      styles.priceTextOwned,
                      isSelected && { color: '#FFFFFF' },
                    ]}
                  >
                    {isSelected ? 'Puesto' : isFree ? 'Gratis' : 'Tuyo'}
                  </Text>
                </>
              ) : (
                <>
                  <LockIcon size={10} color="#92400E" />
                  <ChipIcon size={11} color="#D97706" />
                  <Text style={styles.priceTextLocked}>
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
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Personalizar Avatar</Text>
              <Text style={styles.subtitle}>
                Crea tu estilo único y pruébalo en vivo
              </Text>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.chipsBadge}>
                <ChipIcon size={14} color={CLUB.gold} />
                <Text style={styles.chipsText}>
                  {retention.clubChips.toLocaleString('es-ES')}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Cerrar vestidor"
                style={styles.closeBtn}
              >
                <CloseIcon size={18} color={CLUB.textPrimary} />
              </Pressable>
            </View>
          </View>

          {/* BRIGHT Luminous Studio Stage so every facial detail & outfit pops crisply! */}
          <LinearGradient
            colors={['#F8FAFC', '#E8F0FB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.stageCard}
          >
            <View style={styles.stagePortraitHalo}>
              <ModularAvatar config={draft} size={112} showFrameRing />
            </View>
            <View style={styles.stageRight}>
              <Text style={styles.presetsLabel}>FIGURA BASE</Text>
              <View style={styles.baseToggleRow}>
                <Pressable
                  onPress={() => handleSelectBase('feminine')}
                  style={({ pressed }) => [
                    styles.baseBtn,
                    draft.bodyType === 'feminine' && styles.baseBtnActive,
                    pressed && { opacity: 0.84 },
                  ]}
                >
                  <ModularAvatar config={BASE_FEMALE_AVATAR} size={28} />
                  <Text
                    style={[
                      styles.baseBtnText,
                      draft.bodyType === 'feminine' && styles.baseBtnTextActive,
                    ]}
                  >
                    Mujer
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleSelectBase('masculine')}
                  style={({ pressed }) => [
                    styles.baseBtn,
                    draft.bodyType === 'masculine' && styles.baseBtnActive,
                    pressed && { opacity: 0.84 },
                  ]}
                >
                  <ModularAvatar config={BASE_MALE_AVATAR} size={28} />
                  <Text
                    style={[
                      styles.baseBtnText,
                      draft.bodyType === 'masculine' && styles.baseBtnTextActive,
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
                  pressed && { opacity: 0.82 },
                ]}
              >
                <Text style={styles.presetChipRandomText}>
                  Sorpréndeme (Aleatorio)
                </Text>
              </Pressable>
            </View>
          </LinearGradient>

          {/* Category Tabs */}
          <ScrollView
            ref={tabsScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
            style={styles.tabsScroll}
          >
            {STUDIO_TABS.map((t) => {
              const active = activeTab === t.id;
              const tabLabel =
                t.id === 'facial'
                  ? draft.bodyType === 'feminine'
                    ? 'Detalles'
                    : 'Barba y Extras'
                  : t.label;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => {
                    hapticLight();
                    setActiveTab(t.id);
                  }}
                  style={[styles.tabPill, active && styles.tabPillActive]}
                >
                  <Text
                    style={[
                      styles.tabPillText,
                      active && styles.tabPillTextActive,
                    ]}
                  >
                    {tabLabel}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Color Swatch Strip for Skin / Eyes / Hair / Outfit */}
          {activeTab === 'face' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.swatchScroll}
              contentContainerStyle={styles.swatchRow}
            >
              <Text style={styles.swatchLabel}>Piel:</Text>
              {AVATAR_SKIN_TONES.map((s) => {
                const active = draft.skinTone === s.id;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => {
                      hapticLight();
                      setDraft((prev) => ({ ...prev, skinTone: s.id }));
                    }}
                    style={[
                      styles.swatchDot,
                      { backgroundColor: s.base },
                      active && styles.swatchDotActive,
                    ]}
                  />
                );
              })}
            </ScrollView>
          )}

          {activeTab === 'eyes' &&
            !EYE_STYLES_WITHOUT_IRIS_COLOR.has(draft.eyeStyle) && (
              <View style={styles.swatchRow}>
                <Text style={styles.swatchLabel}>Color de ojos:</Text>
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

          {activeTab === 'hair' && draft.hair !== 'bald' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.swatchScroll}
              contentContainerStyle={styles.swatchRow}
            >
              <Text style={styles.swatchLabel}>Color:</Text>
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

          {activeTab === 'outfit' &&
            !OUTFITS_WITH_FIXED_COLOR.has(draft.outfit) && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.swatchScroll}
                contentContainerStyle={styles.swatchRow}
              >
                <Text style={styles.swatchLabel}>Color:</Text>
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

          {/* Scrollable Item Catalog (Light high-contrast tiles so every trait reads clearly!) */}
          <ScrollView
            ref={catalogScrollRef}
            style={styles.catalogScroll}
            contentContainerStyle={styles.catalogContent}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'face' &&
              renderItemGrid(AVATAR_FACE_SHAPE_OPTIONS, draft.faceShape, (id) => ({
                ...draft,
                faceShape: id,
              }))}

            {activeTab === 'hair' &&
              renderItemGrid(sortedHairOptions, draft.hair, (id) => ({
                ...draft,
                hair: id,
              }))}

            {activeTab === 'eyes' &&
              renderItemGrid(sortedEyeOptions, draft.eyeStyle, (id) => ({
                ...draft,
                eyeStyle: id,
              }))}

            {activeTab === 'brows' &&
              renderItemGrid(AVATAR_EYEBROW_OPTIONS, draft.eyebrows, (id) => ({
                ...draft,
                eyebrows: id,
              }))}

            {activeTab === 'nose' &&
              renderItemGrid(AVATAR_NOSE_OPTIONS, draft.nose, (id) => ({
                ...draft,
                nose: id,
              }))}

            {activeTab === 'mouth' &&
              renderItemGrid(sortedMouthOptions, draft.mouth, (id) => ({
                ...draft,
                mouth: id,
              }))}

            {activeTab === 'facial' &&
              renderItemGrid(sortedFacialOptions, draft.facial, (id) => ({
                ...draft,
                facial: id,
              }))}

            {activeTab === 'outfit' &&
              renderItemGrid(sortedOutfitOptions, draft.outfit, (id) => ({
                ...draft,
                outfit: id,
              }))}

            {activeTab === 'glasses' &&
              renderItemGrid(sortedGlassesOptions, draft.glasses, (id) => ({
                ...draft,
                glasses: id,
              }))}

            {activeTab === 'hat' &&
              renderItemGrid(sortedHatOptions, draft.hat, (id) => ({
                ...draft,
                hat: id,
              }))}

            {activeTab === 'frame' &&
              renderItemGrid(sortedFrameOptions, draft.frame, (id) => ({
                ...draft,
                frame: id,
              }))}
          </ScrollView>

          {/* Sticky Bottom Action Bar */}
          <View style={styles.footer}>
            {totalCost > 0 && !canAffordAll ? (
              <View style={styles.insufficientBox}>
                <Text style={styles.insufficientText}>
                  Te faltan{' '}
                  {(totalCost - retention.clubChips).toLocaleString('es-ES')}{' '}
                  monedas para esta combinación.
                </Text>
                <Pressable
                  onPress={handleStripLockedItems}
                  style={({ pressed }) => [
                    styles.stripLockedBtn,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={styles.stripLockedBtnText}>
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
                  ? `Desbloquear y usar (${totalCost.toLocaleString('es-ES')})`
                  : hasChanges
                  ? 'Guardar Avatar'
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
    backgroundColor: 'rgba(4, 10, 22, 0.78)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '92%',
    backgroundColor: '#0E1C36',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1.5,
    borderColor: 'rgba(148, 190, 255, 0.3)',
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
    color: CLUB.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    color: CLUB.textSecondary,
    fontSize: 11.5,
    fontWeight: '600',
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
    backgroundColor: 'rgba(245, 196, 81, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(245, 196, 81, 0.45)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipsText: {
    color: CLUB.goldSoft,
    fontSize: 12.5,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    padding: 12,
    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.32)',
  },
  stagePortraitHalo: {
    padding: 3,
    borderRadius: 64,
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 4px 12px rgba(15, 23, 42, 0.18)',
  },
  stageRight: {
    flex: 1,
    gap: 7,
  },
  presetsLabel: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '900',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  baseBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    boxShadow: '0px 2px 8px rgba(37, 99, 235, 0.22)',
  },
  baseBtnText: {
    color: '#334155',
    fontSize: 12.5,
    fontWeight: '800',
  },
  baseBtnTextActive: {
    color: '#1D4ED8',
    fontWeight: '900',
  },
  presetChipRandom: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  presetChipRandomText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  tabsScroll: {
    flexGrow: 0,
  },
  tabsRow: {
    gap: 6,
    paddingVertical: 2,
  },
  tabPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(148, 190, 255, 0.18)',
  },
  tabPillActive: {
    backgroundColor: '#F8FAFC',
    borderColor: '#FFFFFF',
  },
  tabPillText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '800',
  },
  tabPillTextActive: {
    color: '#0F172A',
  },
  swatchScroll: {
    flexGrow: 0,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  swatchLabel: {
    color: CLUB.textSecondary,
    fontSize: 11.5,
    fontWeight: '800',
  },
  swatchDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  itemCard: {
    width: '31.3%',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 5,
    position: 'relative',
  },
  itemCardSelected: {
    borderColor: CLUB.gold,
    backgroundColor: '#FFFBEB',
    boxShadow: '0px 4px 12px rgba(245, 196, 81, 0.35)',
  },
  tagBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    zIndex: 4,
  },
  tagText: {
    color: '#92400E',
    fontSize: 8.5,
    fontWeight: '900',
  },
  thumbWindow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  itemName: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
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
    backgroundColor: '#FEF3C7',
    minWidth: 62,
  },
  pricePillOwned: {
    backgroundColor: '#E2E8F0',
  },
  pricePillSelected: {
    backgroundColor: '#10B981',
  },
  priceTextOwned: {
    color: '#334155',
    fontSize: 10,
    fontWeight: '900',
  },
  priceTextLocked: {
    color: '#92400E',
    fontSize: 10.5,
    fontWeight: '900',
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
    backgroundColor: 'rgba(244, 63, 94, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.38)',
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  insufficientText: {
    flex: 1,
    color: '#FDA4AF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  stripLockedBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(253, 164, 175, 0.45)',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stripLockedBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
});
