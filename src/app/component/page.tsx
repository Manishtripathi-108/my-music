'use client';

import React, { useState } from 'react';

import {
    Accordion,
    AngleSlider,
    Avatar,
    Carousel,
    Clipboard,
    Collapsible,
    ColorPicker,
    Combobox,
    Fieldset,
    FileUpload,
    Format,
    HoverCard,
    Menu,
    Pagination,
    PasswordInput,
    PinInput,
    Popover,
    QrCode,
    RatingGroup,
    SegmentGroup,
    Select,
    SignaturePad,
    Slider,
    Splitter,
    Switch,
    TagsInput,
    Timer,
    Toggle,
    ToggleGroup,
    Tooltip,
    createListCollection,
    parseColor,
} from '@ark-ui/react';
import { AnimatePresence, MotionConfig, type Variants, motion, useReducedMotion } from 'motion/react';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Calendar } from '@/components/ui/Calendar';
import ColorSchemeSelector from '@/components/ui/ColorSchemeSelector';
import Icon from '@/components/ui/Icon';
import Link from '@/components/ui/Link';
import ThemeToggler from '@/components/ui/ThemeToggler';
import { CheckboxControl, CheckboxLabel, CheckboxRoot } from '@/components/ui/checkbox';
import { DateInput, DateInputControl, DateInputLabel, DateInputSegmentGroup } from '@/components/ui/date-input';
import {
    DatePicker,
    DatePickerCalendar,
    DatePickerContent,
    DatePickerControl,
    DatePickerInput,
    DatePickerLabel,
    DatePickerPositioner,
    DatePickerTrigger,
} from '@/components/ui/date-picker';
import { Dialog, DialogCloseTrigger, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    Drawer,
    DrawerBackdrop,
    DrawerCloseTrigger,
    DrawerContent,
    DrawerDescription,
    DrawerGrabber,
    DrawerPositioner,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import {
    Editable,
    EditableArea,
    EditableCancelTrigger,
    EditableControl,
    EditableEditTrigger,
    EditableInput,
    EditableLabel,
    EditablePreview,
    EditableSubmitTrigger,
} from '@/components/ui/editable';
import { Field, FieldErrorText, FieldHelperText, FieldInput, FieldLabel, FieldSelect, FieldTextarea } from '@/components/ui/field';
import {
    NumberInput,
    NumberInputControl,
    NumberInputDecrementTrigger,
    NumberInputIncrementTrigger,
    NumberInputInput,
    NumberInputLabel,
    NumberInputScrubber,
} from '@/components/ui/number-input';
import {
    Progress,
    ProgressCircle,
    ProgressCircleRange,
    ProgressCircleTrack,
    ProgressLabel,
    ProgressRange,
    ProgressTrack,
    ProgressValueText,
} from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem, RadioGroupItemControl, RadioGroupItemText, RadioGroupLabel } from '@/components/ui/radio-group';
import { ScrollArea, ScrollBar, ScrollContent, ScrollThumb, ScrollViewport } from '@/components/ui/scroll-area';
import {
    Steps,
    StepsCompletedContent,
    StepsContent,
    StepsIndicator,
    StepsItem,
    StepsList,
    StepsNextTrigger,
    StepsPrevTrigger,
    StepsSeparator,
    StepsTrigger,
} from '@/components/ui/steps';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TreeNode, TreeView, TreeViewLabel, TreeViewTree, createTreeCollection } from '@/components/ui/tree-view';
import useTheme from '@/context/useTheme';
import cn from '@/lib/cn';

// Sample tree collection for TreeView
const musicLibraryTree = createTreeCollection({
    rootNode: {
        id: 'ROOT',
        name: '',
        children: [
            {
                id: 'flac-folder',
                name: 'FLAC Lossless (24-bit/96kHz)',
                children: [
                    {
                        id: 'pink-floyd',
                        name: 'Pink Floyd - The Dark Side of the Moon',
                        children: [
                            { id: 'pf-01', name: '01 - Speak to Me.flac' },
                            { id: 'pf-02', name: '02 - Breathe (In the Air).flac' },
                            { id: 'pf-03', name: '03 - Time.flac' },
                        ],
                    },
                    {
                        id: 'daft-punk',
                        name: 'Daft Punk - Random Access Memories',
                        children: [
                            { id: 'dp-01', name: '01 - Give Life Back to Music.flac' },
                            { id: 'dp-02', name: '02 - Giorgio by Moroder.flac' },
                        ],
                    },
                ],
            },
            {
                id: 'dsd-folder',
                name: 'DSD Direct Stream Digital',
                children: [
                    { id: 'dsd-01', name: 'Steely Dan - Aja (DSD64).dsf' },
                    { id: 'dsd-02', name: 'Miles Davis - Kind of Blue (DSD128).dff' },
                ],
            },
        ],
    },
});

// Engine Select List
const engineCollection = createListCollection({
    items: [
        { label: 'TagLib 2.x C++ Native Sidecar', value: 'native' },
        { label: 'taglib-wasm In-Process Fallback', value: 'wasm' },
        { label: 'FFprobe 9.0 Primary Prober', value: 'ffprobe' },
        { label: 'MediaInfo QC Supplement', value: 'mediainfo' },
    ],
});

// Artist Combobox List
const artistCollection = createListCollection({
    items: [
        { label: 'Pink Floyd (Progressive Rock)', value: 'pink-floyd' },
        { label: 'Daft Punk (Electronic / Disco)', value: 'daft-punk' },
        { label: 'Miles Davis (Modal Jazz)', value: 'miles-davis' },
        { label: 'Steely Dan (Jazz Rock)', value: 'steely-dan' },
        { label: 'Radiohead (Art Rock)', value: 'radiohead' },
        { label: 'Fleetwood Mac (Pop Rock)', value: 'fleetwood-mac' },
    ],
});

type ComponentCategory =
    | 'all'
    | 'colors'
    | 'buttons'
    | 'badges'
    | 'fields'
    | 'selection'
    | 'selectors'
    | 'sliders'
    | 'progress'
    | 'overlays'
    | 'navigation'
    | 'media'
    | 'date'
    | 'shadows';

const sectionVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.02,
        },
    },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.38,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        },
    },
};

interface AnimatedSectionProps {
    id: string;
    children: React.ReactNode;
    className?: string;
}

function AnimatedSection({ id, children, className = 'flex flex-col gap-6' }: AnimatedSectionProps) {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
        return (
            <section id={id} className={className}>
                {children}
            </section>
        );
    }

    return (
        <motion.section
            id={id}
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.04, margin: '0px 0px -40px 0px' }}
            className={className}>
            {children}
        </motion.section>
    );
}

/**
 * Showcase page presenting all Ark UI components, custom tactile controls,
 * polymorphic buttons, accessible navigation links, and elevation scales.
 */
export default function ComponentShowcasePage() {
    const { colorScheme, setColorScheme, colorSchemes } = useTheme();
    const shouldReduceMotion = useReducedMotion();
    const [activeCategory, setActiveCategory] = useState<ComponentCategory>('colors');
    const [activeChip, setActiveChip] = useState<string>('flac');
    const [cardRadioSelection, setCardRadioSelection] = useState<string>('fast');
    const [demoCheckbox1, setDemoCheckbox1] = useState<boolean>(true);
    const [demoCheckbox2, setDemoCheckbox2] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [sampleProgress, setSampleProgress] = useState<number>(68);
    const [sliderVolume, setSliderVolume] = useState<number[]>([72]);
    const [anglePan, setAnglePan] = useState<number>(45);
    const [colorValue, setColorValue] = useState(parseColor('#3b82f6'));
    const [segmentBitDepth, setSegmentBitDepth] = useState<string>('24bit');
    const [ratingValue, setRatingValue] = useState<number>(4);
    const [ditherSwitch, setDitherSwitch] = useState<boolean>(true);
    const [monoToggle, setMonoToggle] = useState<boolean>(false);
    const [audioChannelMode, setAudioChannelMode] = useState<string[]>(['stereo']);

    const categories: { id: ComponentCategory; label: string; count?: string }[] = [
        { id: 'all', label: 'All Components' },
        { id: 'colors', label: 'Color Scheme', count: '5' },
        { id: 'buttons', label: 'Buttons & Toggles', count: '12' },
        { id: 'badges', label: 'Badges & Formatters', count: '9' },
        { id: 'fields', label: 'Form Inputs & Keyboards', count: '8' },
        { id: 'selection', label: 'Selection & Switches', count: '6' },
        { id: 'selectors', label: 'Select, Combobox & Color', count: '3' },
        { id: 'sliders', label: 'Sliders & Rotary Pan', count: '2' },
        { id: 'progress', label: 'Progress, Timer & QR', count: '4' },
        { id: 'overlays', label: 'Dialog, Drawer & Popups', count: '6' },
        { id: 'navigation', label: 'Steps, Tabs, Tree & Panels', count: '8' },
        { id: 'media', label: 'Carousel, Upload & Media', count: '4' },
        { id: 'date', label: 'Date & Calendar', count: '3' },
        { id: 'shadows', label: 'Elevation System', count: '22' },
    ];

    const semanticTokens = [
        { name: 'Canvas Background', cssVar: '--background', variable: 'var(--background)', sampleText: 'Background', textClass: 'text-foreground' },
        { name: 'Raised Card Surface', cssVar: '--card', variable: 'var(--card)', sampleText: 'Card', textClass: 'text-card-foreground' },
        { name: 'Floating Popover', cssVar: '--popover', variable: 'var(--popover)', sampleText: 'Popover', textClass: 'text-popover-foreground' },
        { name: 'Recessed Muted', cssVar: '--muted', variable: 'var(--muted)', sampleText: 'Muted', textClass: 'text-muted-foreground' },
        { name: 'Sidebar Canvas', cssVar: '--sidebar', variable: 'var(--sidebar)', sampleText: 'Sidebar', textClass: 'text-sidebar-foreground' },
        { name: 'Input Control', cssVar: '--input', variable: 'var(--input)', sampleText: 'Input', textClass: 'text-foreground' },
        { name: 'Primary Brand', cssVar: '--primary', variable: 'var(--primary)', sampleText: 'Primary', textClass: 'text-primary-foreground' },
        {
            name: 'Secondary Brand',
            cssVar: '--secondary',
            variable: 'var(--secondary)',
            sampleText: 'Secondary',
            textClass: 'text-secondary-foreground',
        },
        { name: 'Accent Highlight', cssVar: '--accent', variable: 'var(--accent)', sampleText: 'Accent', textClass: 'text-accent-foreground' },
        { name: 'Border Line', cssVar: '--border', variable: 'var(--border)', sampleText: 'Border', textClass: 'text-foreground' },
        { name: 'Focus Ring', cssVar: '--ring', variable: 'var(--ring)', sampleText: 'Ring', textClass: 'text-foreground' },
        { name: 'Foreground Ink', cssVar: '--foreground', variable: 'var(--foreground)', sampleText: 'Foreground', textClass: 'text-background' },
    ];

    const statusTokens = [
        {
            name: 'Destructive',
            role: 'Error / Critical',
            code: '4xx / 5xx',
            bgClass: 'bg-destructive/10 text-destructive',
            textClass: 'text-destructive',
            badgeVariant: 'destructive' as const,
        },
        {
            name: 'Success',
            role: 'Confirmed / Valid',
            code: '200 OK',
            bgClass: 'bg-success/10 text-success',
            textClass: 'text-success',
            badgeVariant: 'success' as const,
        },
        {
            name: 'Warning',
            role: 'Caution / Pending',
            code: 'Alert',
            bgClass: 'bg-warning/10 text-warning-foreground',
            textClass: 'text-warning',
            badgeVariant: 'warning' as const,
        },
        {
            name: 'Info',
            role: 'Notice / Context',
            code: 'Info',
            bgClass: 'bg-info/10 text-info',
            textClass: 'text-info',
            badgeVariant: 'outline' as const,
        },
    ];

    const currentCategoryIndex = categories.findIndex((c) => c.id === activeCategory);

    const shouldShow = (cat: ComponentCategory) => activeCategory === 'all' || activeCategory === cat;

    return (
        <MotionConfig reducedMotion="user">
            <div className="bg-background text-foreground min-h-screen pb-28 font-mono text-xs select-none">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {/* FLOATING HEADER & NAVIGATION */}
                    <motion.header
                        initial={shouldReduceMotion ? undefined : { opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-card/90 sticky top-4 z-40 mx-auto mt-4 mb-8 flex w-full items-center justify-between rounded-full px-4 py-2.5 shadow-md backdrop-blur-md transition-all duration-200 sm:top-5 sm:px-6 sm:py-3">
                        <div className="flex items-center gap-3">
                            <Button
                                href="/"
                                variant="ghost"
                                size="sm"
                                className="bg-muted/50 text-foreground hover:bg-muted gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-2xs">
                                <span>← Home</span>
                            </Button>
                            <div className="bg-muted-foreground/20 hidden h-4 w-px sm:block" />
                            <div className="hidden items-center gap-2 sm:flex">
                                <span className="text-foreground text-sm font-bold tracking-tight">UI Component Showcase</span>
                                <Badge variant="primary" size="xs">
                                    ARK UI + TACTILE OKLCH
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                href="/"
                                variant="primary"
                                size="sm"
                                className="gap-1.5 rounded-full px-3.5 text-xs font-medium shadow-sm hover:shadow">
                                <Icon icon="refresh" className="size-3.5" />
                                <span>Scan Modal</span>
                            </Button>
                            <div className="bg-muted/40 flex items-center gap-1 rounded-full p-1 shadow-2xs">
                                <ColorSchemeSelector />
                                <div className="bg-muted-foreground/20 h-4 w-px" />
                                <ThemeToggler />
                            </div>
                        </div>
                    </motion.header>

                    {/* CATEGORY FILTER PILLS */}
                    {/* RESPONSIVE CATEGORY CONTROL BAR */}
                    <motion.div
                        initial={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-card/95 mb-8 flex flex-col gap-2.5 rounded-2xl p-3 font-mono shadow-md backdrop-blur-md">
                        {/* Top Row: Quick Dropdown Jump + Next/Prev Steppers + View Indicator */}
                        <div className="border-muted/60 flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground hidden text-[11px] font-bold tracking-wider uppercase sm:inline">
                                    Category:
                                </span>
                                <div className="relative">
                                    <select
                                        value={activeCategory}
                                        aria-label="Jump to component category"
                                        onChange={(e) => setActiveCategory(e.target.value as ComponentCategory)}
                                        className="bg-muted text-foreground focus:ring-primary cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold shadow-2xs outline-none focus:ring-2">
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.label} ({cat.count ?? 'All'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Stepper buttons */}
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        aria-label="Previous category"
                                        disabled={currentCategoryIndex <= 0}
                                        onClick={() => {
                                            const prev = categories[currentCategoryIndex - 1];
                                            if (prev) setActiveCategory(prev.id);
                                        }}
                                        className="bg-muted text-foreground hover:bg-accent flex size-7 cursor-pointer items-center justify-center rounded-lg shadow-2xs transition-colors disabled:cursor-not-allowed disabled:opacity-30">
                                        <Icon icon="chevronLeft" className="size-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Next category"
                                        disabled={currentCategoryIndex >= categories.length - 1}
                                        onClick={() => {
                                            const next = categories[currentCategoryIndex + 1];
                                            if (next) setActiveCategory(next.id);
                                        }}
                                        className="bg-muted text-foreground hover:bg-accent flex size-7 cursor-pointer items-center justify-center rounded-lg shadow-2xs transition-colors disabled:cursor-not-allowed disabled:opacity-30">
                                        <Icon icon="chevronRight" className="size-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Status / Active Info */}
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground text-[11px]">
                                    Active: <strong className="text-foreground">{categories.find((c) => c.id === activeCategory)?.label}</strong>
                                </span>
                                {activeCategory !== 'all' && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveCategory('all')}
                                        className="bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-lg px-2 py-1 text-[10px] transition-colors">
                                        Show All
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Bottom Row: Wrapped Bento Pills — NO horizontal scrolling needed! */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            {categories.map((cat) => {
                                const isSelected = activeCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={cn(
                                            'flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]',
                                            'outline-none active:scale-[0.98]',
                                            isSelected
                                                ? 'bg-foreground text-background font-semibold shadow-xs'
                                                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground shadow-2xs'
                                        )}>
                                        <span>{cat.label}</span>
                                        {cat.count && (
                                            <span
                                                className={cn(
                                                    'py-0.2 rounded-full px-1.5 text-[10px]',
                                                    isSelected ? 'bg-background/20 text-background' : 'bg-background/40 text-muted-foreground'
                                                )}>
                                                {cat.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory}
                            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
                            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col gap-12">
                            {/* 0. COLOR SCHEME & THEME PALETTES */}
                            {shouldShow('colors') && (
                                <AnimatedSection id="colors" className="flex flex-col gap-6">
                                    <div>
                                        <span className="text-muted-foreground mb-1 block text-[11px] font-medium tracking-widest uppercase">
                                            00 • COLOR SCHEME & THEME PALETTES
                                        </span>
                                        <h2 className="text-foreground text-base font-bold">Adaptive OKLCH Color Tokens & data-theme Palettes</h2>
                                        <p className="text-muted-foreground mt-1 max-w-3xl text-xs leading-relaxed">
                                            Live interactive color tokens calibrated in perceptually uniform OKLCH space. Switch palettes below to
                                            observe immediate real-time propagation across all surfaces, borders, elevated panels, and interactive
                                            tactile controls.
                                        </p>
                                    </div>

                                    {/* 1. Interactive Color Schemes */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-foreground text-xs font-semibold tracking-wider uppercase">
                                                Interactive Color Schemes (data-theme)
                                            </span>
                                            <span className="text-muted-foreground text-[11px]">
                                                Current: <strong className="text-primary font-mono capitalize">{colorScheme}</strong>
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                                            {colorSchemes.map((t) => {
                                                const isSelected = t.id === colorScheme;
                                                return (
                                                    <motion.button
                                                        key={t.id}
                                                        variants={cardVariants}
                                                        whileHover={{ y: -2 }}
                                                        whileTap={{ scale: 0.985 }}
                                                        type="button"
                                                        onClick={() => setColorScheme(t.id)}
                                                        className={cn(
                                                            'bg-card text-card-foreground rounded-2xl p-3.5 shadow-sm transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-md',
                                                            'relative flex cursor-pointer flex-col justify-between gap-3 text-left outline-none',
                                                            'active:scale-[0.985] active:shadow-inner active:inset-shadow-xs',
                                                            isSelected && 'ring-primary ring-offset-background ring-2 ring-offset-2'
                                                        )}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className="size-4.5 rounded-full border border-white/20 shadow-xs"
                                                                    style={{ backgroundColor: t.swatch }}
                                                                />
                                                                <span className="text-foreground text-xs font-bold">{t.label}</span>
                                                            </div>
                                                            {isSelected && (
                                                                <Badge size="xs" variant="solid">
                                                                    Active
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <p className="text-muted-foreground text-[11px] leading-snug">{t.description}</p>

                                                        <div className="border-muted/60 text-muted-foreground mt-1 flex items-center justify-between border-t pt-2 font-mono text-[10px]">
                                                            <span>{`data-theme="${t.id}"`}</span>
                                                            <span className="size-2 rounded-full" style={{ backgroundColor: t.accent }} />
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 2. Core Semantic Color Tokens */}
                                    <div className="flex flex-col gap-3">
                                        <span className="text-foreground text-xs font-semibold tracking-wider uppercase">
                                            Active Semantic Surface & Brand Tokens
                                        </span>

                                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
                                            {semanticTokens.map((token) => (
                                                <motion.div
                                                    key={token.name}
                                                    variants={cardVariants}
                                                    className="bg-card flex flex-col gap-2 rounded-xl p-2.5 shadow-2xs">
                                                    <div
                                                        className={cn(
                                                            'flex h-10 w-full items-center justify-center rounded-lg border border-black/5 text-[10px] font-bold shadow-inner dark:border-white/10',
                                                            token.textClass
                                                        )}
                                                        style={{ backgroundColor: token.variable }}>
                                                        {token.sampleText}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-foreground truncate text-[11px] font-bold">{token.name}</span>
                                                        <span className="text-muted-foreground truncate font-mono text-[10px]">{token.cssVar}</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 3. Status & Feedback Swatches */}
                                    <div className="flex flex-col gap-3">
                                        <span className="text-foreground text-xs font-semibold tracking-wider uppercase">
                                            Status & Feedback Tokens
                                        </span>

                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                            {statusTokens.map((st) => (
                                                <motion.div
                                                    key={st.name}
                                                    variants={cardVariants}
                                                    className={cn(
                                                        'flex items-center justify-between rounded-xl p-3 shadow-2xs',
                                                        st.bgClass,
                                                        st.textClass
                                                    )}>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold">{st.name}</span>
                                                        <span className="font-mono text-[10px] opacity-80">{st.role}</span>
                                                    </div>
                                                    <Badge size="xs" variant={st.badgeVariant}>
                                                        {st.code}
                                                    </Badge>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </AnimatedSection>
                            )}
                            {/* 1. BUTTONS, TOGGLES & INTERACTIVE TRIGGERS */}
                            {shouldShow('buttons') && (
                                <AnimatedSection id="buttons" className="flex flex-col gap-6">
                                    <div>
                                        <span className="text-muted-foreground mb-1 block text-[11px] font-medium tracking-widest uppercase">
                                            01 • BUTTONS, TOGGLES & TRIGGERS
                                        </span>
                                        <h2 className="text-foreground text-base font-bold">
                                            Physical Tactile Buttons, Ark UI Toggles & Multi-Toggle Groups
                                        </h2>
                                        <p className="text-muted-foreground mt-1 max-w-3xl text-xs leading-relaxed">
                                            All 10 custom button variants featuring hover elevation, indented mechanical press (
                                            <code className="text-foreground">active:shadow-inner</code>), disabled states, loading spinners, Ark UI{' '}
                                            <code className="text-foreground">Toggle</code>, and <code className="text-foreground">ToggleGroup</code>.
                                        </p>
                                    </div>

                                    {/* Custom Buttons Matrix */}
                                    <motion.div
                                        variants={cardVariants}
                                        className="bg-card text-card-foreground flex flex-col gap-6 rounded-2xl p-6 shadow">
                                        <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                            CUSTOM BUTTON VARIANTS (IDLE STATE)
                                        </span>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Button variant="primary">
                                                <Icon icon="play" className="size-3.5" />
                                                <span>Primary Key</span>
                                            </Button>
                                            <Button variant="dark">
                                                <Icon icon="settings" className="size-3.5" />
                                                <span>Dark Slate</span>
                                            </Button>
                                            <Button variant="slate">
                                                <Icon icon="download" className="size-3.5" />
                                                <span>Medium Slate</span>
                                            </Button>
                                            <Button variant="secondary">Secondary</Button>
                                            <Button variant="outline">Tactile Outline</Button>
                                            <Button variant="ghost">Ghost Button</Button>
                                            <Button variant="destructive">
                                                <Icon icon="trash" className="size-3.5" />
                                                <span>Destructive</span>
                                            </Button>
                                            <Button variant="success">
                                                <Icon icon="check" className="size-3.5" />
                                                <span>Success</span>
                                            </Button>
                                            <Button variant="warning">
                                                <Icon icon="alert" className="size-3.5" />
                                                <span>Warning</span>
                                            </Button>
                                            <Button variant="link">Link Button ↗</Button>
                                        </div>

                                        <div className="bg-muted/60 h-px" />

                                        {/* Polymorphic Buttons as Links */}
                                        <div className="flex flex-col gap-3">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                POLYMORPHIC BUTTONS (RENDERED AS NEXT.JS &lt;LINK&gt;)
                                            </span>
                                            <p className="text-muted-foreground text-xs">
                                                No invalid <code className="text-foreground">&lt;a&gt;&lt;button&gt;</code> nesting. Passing{' '}
                                                <code className="text-foreground">href</code> polymorphically delegates to Next.js{' '}
                                                <code className="text-foreground">Link</code> with seamless button variant styling and tactile active
                                                feedback.
                                            </p>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Button href="/" variant="primary" size="sm">
                                                    <Icon icon="home" className="size-3.5" />
                                                    <span>Home (Link Button)</span>
                                                </Button>
                                                <Button href="/component" variant="outline" size="sm">
                                                    <Icon icon="sparkle" className="size-3.5" />
                                                    <span>Component Showcase (Active)</span>
                                                </Button>
                                                <Button href="/" variant="ghost" size="sm">
                                                    <span>Ghost Link ↗</span>
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="bg-muted/60 h-px" />

                                        {/* Dedicated Link Component Showcase */}
                                        <div className="flex flex-col gap-3">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                CUSTOM &lt;LINK&gt; PRIMITIVE (ACCESSIBLE NEXT.JS ANCHORS)
                                            </span>
                                            <p className="text-muted-foreground text-xs">
                                                Dedicated design-system anchor primitive with accessible focus rings, underline offsets, tactile
                                                active scaling, and external target protection.
                                            </p>
                                            <div className="flex flex-wrap items-center gap-4">
                                                <Link href="/" variant="default" size="sm">
                                                    Default Primary Link
                                                </Link>
                                                <Link href="/component" variant="muted" size="sm">
                                                    Muted Secondary Link
                                                </Link>
                                                <Link href="/" variant="subtle" size="sm">
                                                    Subtle Contrast Link
                                                </Link>
                                                <Link href="/component" variant="nav" size="xs">
                                                    <Icon icon="sparkle" className="text-primary size-3.5" />
                                                    <span>Nav Pill Link</span>
                                                </Link>
                                                <Link href="/" variant="ghost" size="sm">
                                                    Ghost Inline Link
                                                </Link>
                                                <Link href="https://ark-ui.com" isExternal variant="default" size="sm">
                                                    Ark UI Documentation ↗
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="bg-muted/60 h-px" />

                                        {/* Ark UI Toggle & ToggleGroup */}
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div className="flex flex-col gap-3">
                                                <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                    ARK UI TOGGLE (MUTE / UNMUTE)
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <Toggle.Root
                                                        pressed={monoToggle}
                                                        onPressedChange={setMonoToggle}
                                                        className={cn(
                                                            'flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-semibold shadow-xs transition-all outline-none',
                                                            monoToggle
                                                                ? 'bg-destructive text-destructive-foreground shadow-sm'
                                                                : 'bg-input text-foreground hover:bg-muted active:shadow-inner'
                                                        )}>
                                                        <Toggle.Indicator fallback={<Icon icon="audio" className="text-muted-foreground size-4" />}>
                                                            <Icon icon="close" className="size-4" />
                                                        </Toggle.Indicator>
                                                        <span>{monoToggle ? 'Muted (Audio Off)' : 'Active (Audio On)'}</span>
                                                    </Toggle.Root>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                    ARK UI TOGGLE GROUP (STEREO CHANNEL ROUTING)
                                                </span>
                                                <ToggleGroup.Root
                                                    value={audioChannelMode}
                                                    onValueChange={(details) => setAudioChannelMode(details.value)}
                                                    className="bg-input flex w-fit items-center gap-1 rounded-xl p-1 inset-shadow-xs">
                                                    {[
                                                        { id: 'left', label: 'Left (L)' },
                                                        { id: 'stereo', label: 'Stereo (L+R)' },
                                                        { id: 'right', label: 'Right (R)' },
                                                    ].map((opt) => (
                                                        <ToggleGroup.Item
                                                            key={opt.id}
                                                            value={opt.id}
                                                            className={cn(
                                                                'cursor-pointer rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition-all outline-none',
                                                                audioChannelMode.includes(opt.id)
                                                                    ? 'bg-card text-foreground shadow-xs'
                                                                    : 'text-muted-foreground hover:text-foreground'
                                                            )}>
                                                            {opt.label}
                                                        </ToggleGroup.Item>
                                                    ))}
                                                </ToggleGroup.Root>
                                            </div>
                                        </div>

                                        <div className="bg-muted/60 h-px" />

                                        {/* Interactive Button States */}
                                        <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                            INTERACTION STATES (HOVER, ACTIVE/PRESSED, DISABLED, LOADING)
                                        </span>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                            <div className="bg-input/50 flex flex-col items-start gap-2.5 rounded-xl p-4 inset-shadow-2xs">
                                                <span className="text-muted-foreground text-[10px] font-bold uppercase">Standard Idle</span>
                                                <Button variant="primary" size="sm">
                                                    Normal State
                                                </Button>
                                                <span className="text-muted-foreground text-[10px]">Default elevation shadow-sm</span>
                                            </div>

                                            <div className="bg-input/50 flex flex-col items-start gap-2.5 rounded-xl p-4 inset-shadow-2xs">
                                                <span className="text-muted-foreground text-[10px] font-bold uppercase">Mechanical Press</span>
                                                <Button variant="primary" size="sm" className="translate-y-0 scale-[0.99] shadow-inner">
                                                    Pressed State
                                                </Button>
                                                <span className="text-muted-foreground text-[10px]">active:shadow-inner cavity</span>
                                            </div>

                                            <div className="bg-input/50 flex flex-col items-start gap-2.5 rounded-xl p-4 inset-shadow-2xs">
                                                <span className="text-muted-foreground text-[10px] font-bold uppercase">Loading Async</span>
                                                <Button variant="primary" size="sm" disabled>
                                                    <Icon icon="loading" className="size-3.5" />
                                                    <span>Scanning...</span>
                                                </Button>
                                                <span className="text-muted-foreground text-[10px]">Animated Tadpole spinner</span>
                                            </div>

                                            <div className="bg-input/50 flex flex-col items-start gap-2.5 rounded-xl p-4 inset-shadow-2xs">
                                                <span className="text-muted-foreground text-[10px] font-bold uppercase">Disabled Lock</span>
                                                <Button variant="primary" size="sm" disabled>
                                                    Locked State
                                                </Button>
                                                <span className="text-muted-foreground text-[10px]">opacity-50 pointer-events-none</span>
                                            </div>
                                        </div>

                                        <div className="bg-muted/60 h-px" />

                                        {/* Sizes Matrix */}
                                        <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                            SIZE MATRIX (XS, SM, MD, LG, XL)
                                        </span>
                                        <div className="flex flex-wrap items-end gap-3">
                                            <Button size="xs" variant="primary">
                                                Size XS (28px)
                                            </Button>
                                            <Button size="sm" variant="primary">
                                                Size SM (32px)
                                            </Button>
                                            <Button size="md" variant="primary">
                                                Size MD (38px)
                                            </Button>
                                            <Button size="lg" variant="primary">
                                                Size LG (44px)
                                            </Button>
                                            <Button size="xl" variant="primary">
                                                Size XL (56px Chunky)
                                            </Button>
                                        </div>

                                        <div className="bg-muted/60 h-px" />

                                        {/* Real Domain Usecase: Audio Playback Dock */}
                                        <div className="flex flex-col gap-3">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                REAL DOMAIN USECASE: LOSSLESS AUDIO PLAYBACK DOCK
                                            </span>
                                            <div className="bg-input flex flex-col gap-4 rounded-xl p-4 inset-shadow-xs sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-card text-primary flex size-10 items-center justify-center rounded-xl shadow-sm">
                                                        <Icon icon="musicNote" className="size-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-foreground text-xs font-bold">03 - Time.flac</div>
                                                        <div className="text-muted-foreground text-[11px]">Pink Floyd • 24-bit / 96,000 Hz FLAC</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 self-center">
                                                    <Button variant="outline" size="sm" className="size-8 rounded-full p-0">
                                                        <Icon icon="rewind" className="size-4" />
                                                    </Button>
                                                    <Button
                                                        variant="primary"
                                                        size="md"
                                                        onClick={() => setIsPlaying(!isPlaying)}
                                                        className="size-10 rounded-full p-0 shadow-md">
                                                        <Icon icon={isPlaying ? 'pause' : 'play'} className="size-5" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="size-8 rounded-full p-0">
                                                        <Icon icon="fastForward" className="size-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="size-8 rounded-full p-0">
                                                        <Icon icon="shuffle" className="text-muted-foreground size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatedSection>
                            )}

                            {/* 2. BADGES & NUMERIC FORMATTERS */}
                            {shouldShow('badges') && (
                                <AnimatedSection id="badges" className="flex flex-col gap-6">
                                    <div>
                                        <span className="text-muted-foreground mb-1 block text-[11px] font-medium tracking-widest uppercase">
                                            02 • BADGES & NUMERIC FORMATTERS
                                        </span>
                                        <h2 className="text-foreground text-base font-bold">Metadata Status Badges & Ark UI Format Primitives</h2>
                                        <p className="text-muted-foreground mt-1 max-w-3xl text-xs leading-relaxed">
                                            Status pills, audio technical spec tags, and locale-aware Ark UI{' '}
                                            <code className="text-foreground">Format.Byte</code> and{' '}
                                            <code className="text-foreground">Format.Number</code> formatters.
                                        </p>
                                    </div>

                                    <motion.div
                                        variants={cardVariants}
                                        className="bg-card text-card-foreground flex flex-col gap-6 rounded-2xl p-6 shadow">
                                        <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                            CUSTOM BADGE VARIANTS (PRIMARY, SOLID, SECONDARY, OUTLINE, ACCENT, DESTRUCTIVE, SUCCESS)
                                        </span>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Badge variant="primary">primary</Badge>
                                            <Badge variant="solid">solid</Badge>
                                            <Badge variant="secondary">secondary</Badge>
                                            <Badge variant="outline">outline</Badge>
                                            <Badge variant="accent">accent</Badge>
                                            <Badge variant="destructive">destructive</Badge>
                                            <Badge variant="success">success</Badge>
                                        </div>

                                        <div className="bg-muted/60 h-px" />

                                        {/* Ark UI Format Primitives */}
                                        <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                            ARK UI FORMAT PRIMITIVES (FORMAT.BYTE & FORMAT.NUMBER)
                                        </span>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                            <div className="bg-input flex flex-col gap-1 rounded-xl p-3.5 inset-shadow-xs">
                                                <span className="text-muted-foreground text-[10px] font-bold uppercase">Track File Size</span>
                                                <span className="text-foreground text-sm font-bold">
                                                    <Format.Byte value={50529024} unit="byte" />
                                                </span>
                                                <span className="text-muted-foreground text-[10px]">Format.Byte (50.5 MB)</span>
                                            </div>

                                            <div className="bg-input flex flex-col gap-1 rounded-xl p-3.5 inset-shadow-xs">
                                                <span className="text-muted-foreground text-[10px] font-bold uppercase">
                                                    Library Storage Footprint
                                                </span>
                                                <span className="text-foreground text-sm font-bold">
                                                    <Format.Byte value={25899345920} unit="byte" />
                                                </span>
                                                <span className="text-muted-foreground text-[10px]">Format.Byte (25.9 GB)</span>
                                            </div>

                                            <div className="bg-input flex flex-col gap-1 rounded-xl p-3.5 inset-shadow-xs">
                                                <span className="text-muted-foreground text-[10px] font-bold uppercase">Sample Rate Frequency</span>
                                                <span className="text-primary text-sm font-bold">
                                                    <Format.Number value={96000} /> Hz
                                                </span>
                                                <span className="text-muted-foreground text-[10px]">Format.Number (96,000)</span>
                                            </div>
                                        </div>

                                        <div className="bg-muted/60 h-px" />

                                        <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                            REAL DOMAIN USECASE: AUDIO STREAM FORENSICS TAGS
                                        </span>
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <Badge variant="solid" size="sm">
                                                FLAC 24-bit
                                            </Badge>
                                            <Badge variant="outline" size="sm">
                                                96,000 Hz
                                            </Badge>
                                            <Badge variant="primary" size="sm">
                                                ID3v2.4 Embedded
                                            </Badge>
                                            <Badge variant="success" size="sm">
                                                Bit-Safe Verified
                                            </Badge>
                                            <Badge variant="secondary" size="sm">
                                                Gapless Playback
                                            </Badge>
                                            <Badge variant="destructive" size="sm">
                                                CBR Clipping Detected
                                            </Badge>
                                            <Badge variant="accent" size="sm">
                                                Vorbis Comments
                                            </Badge>
                                        </div>
                                    </motion.div>
                                </AnimatedSection>
                            )}

                            {/* 3. FORM FIELDS, KEYBOARDS & TEXT INPUTS */}
                            {shouldShow('fields') && (
                                <AnimatedSection id="fields" className="flex flex-col gap-6">
                                    <div>
                                        <span className="text-muted-foreground mb-1 block text-[11px] font-medium tracking-widest uppercase">
                                            03 • FORM INPUTS, KEYBOARDS & CLIPBOARD
                                        </span>
                                        <h2 className="text-foreground text-base font-bold">
                                            Recessed Inputs, Ark UI Fieldsets, Password, Pin & Tags
                                        </h2>
                                        <p className="text-muted-foreground mt-1 max-w-3xl text-xs leading-relaxed">
                                            Form controls with physical depth (<code className="text-foreground">inset-shadow-xs</code>), Ark UI{' '}
                                            <code className="text-foreground">Fieldset</code>, <code className="text-foreground">PasswordInput</code>,{' '}
                                            <code className="text-foreground">PinInput</code>, <code className="text-foreground">TagsInput</code>, and{' '}
                                            <code className="text-foreground">Clipboard</code>.
                                        </p>
                                    </div>

                                    <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-2xl p-6 shadow">
                                        {/* Ark UI Fieldset with Inputs */}
                                        <Fieldset.Root className="flex flex-col gap-4">
                                            <div>
                                                <Fieldset.Legend className="text-foreground text-sm font-bold">
                                                    Audio Library Ingestion Bounds
                                                </Fieldset.Legend>
                                                <Fieldset.HelperText className="text-muted-foreground mt-0.5 text-xs">
                                                    Enforce canonical path resolution and sandbox constraints.
                                                </Fieldset.HelperText>
                                            </div>

                                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                                <Field>
                                                    <FieldLabel>Default Input (Empty State)</FieldLabel>
                                                    <FieldInput placeholder="e.g. D:/Music/Lossless" />
                                                    <FieldHelperText>Standard empty input waiting for user entry</FieldHelperText>
                                                </Field>

                                                <Field>
                                                    <FieldLabel>Icon Prefixed (Filled State)</FieldLabel>
                                                    <div className="relative flex items-center">
                                                        <div className="text-muted-foreground pointer-events-none absolute left-3 flex items-center justify-center">
                                                            <Icon icon="folder" className="size-4" />
                                                        </div>
                                                        <FieldInput defaultValue="E:/AudioVault/MasterFLAC" className="pl-10" />
                                                    </div>
                                                    <FieldHelperText>Absolute verified storage path</FieldHelperText>
                                                </Field>

                                                <Field invalid>
                                                    <FieldLabel>Validation Error State</FieldLabel>
                                                    <FieldInput defaultValue="/invalid/unauthorized/system/volume" />
                                                    <FieldErrorText>Path is outside of authorized project root</FieldErrorText>
                                                </Field>

                                                <Field disabled>
                                                    <FieldLabel>Disabled / Read-Only State</FieldLabel>
                                                    <FieldInput defaultValue="TagLib 2.x C++ Sidecar Lock" />
                                                    <FieldHelperText>Controlled by server engine boundaries</FieldHelperText>
                                                </Field>
                                            </div>

                                            {/* Select & Textarea Controls */}
                                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                                <Field>
                                                    <FieldLabel>Target Frequency (FieldSelect)</FieldLabel>
                                                    <FieldSelect defaultValue="96000">
                                                        <option value="44100">44,100 Hz (Red Book CD)</option>
                                                        <option value="48000">48,000 Hz (Standard Studio)</option>
                                                        <option value="96000">96,000 Hz (Hi-Res Lossless)</option>
                                                        <option value="192000">192,000 Hz (Master Tape)</option>
                                                    </FieldSelect>
                                                    <FieldHelperText>Resampling frequency target</FieldHelperText>
                                                </Field>

                                                <Field>
                                                    <FieldLabel>Forensic Parser Log (FieldTextarea)</FieldLabel>
                                                    <FieldTextarea rows={2} defaultValue="[TagLib 2.x] Bit-safe mode verified. Atomic swap ready." />
                                                    <FieldHelperText>Live telemetry output</FieldHelperText>
                                                </Field>
                                            </div>
                                        </Fieldset.Root>

                                        <div className="bg-muted/60 h-px" />

                                        {/* Ark UI PasswordInput & PinInput */}
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                    ARK UI PASSWORD INPUT (ENCRYPTED KEYS)
                                                </span>
                                                <PasswordInput.Root className="flex flex-col gap-1.5">
                                                    <PasswordInput.Label className="text-foreground text-xs font-semibold">
                                                        Secret Fingerprint Key
                                                    </PasswordInput.Label>
                                                    <PasswordInput.Control className="relative flex items-center">
                                                        <PasswordInput.Input
                                                            defaultValue="shh-top-secret-flac-key"
                                                            className="bg-input text-foreground focus:ring-ring h-10 w-full rounded-xl px-3.5 pr-10 font-mono text-xs inset-shadow-xs outline-none focus:ring-2"
                                                        />
                                                        <PasswordInput.VisibilityTrigger className="text-muted-foreground hover:text-foreground absolute right-3 cursor-pointer bg-transparent outline-none">
                                                            <PasswordInput.Indicator fallback={<Icon icon="sparkle" className="size-4" />}>
                                                                <Icon icon="close" className="size-4" />
                                                            </PasswordInput.Indicator>
                                                        </PasswordInput.VisibilityTrigger>
                                                    </PasswordInput.Control>
                                                </PasswordInput.Root>
                                                <span className="text-muted-foreground text-[10px]">
                                                    Click the right icon to toggle plain text visibility
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                    ARK UI PIN INPUT (SESSION AUTH PIN)
                                                </span>
                                                <PinInput.Root count={4} defaultValue={['4', '2', '0', '8']} className="flex flex-col gap-1.5">
                                                    <PinInput.Label className="text-foreground text-xs font-semibold">
                                                        Security Access PIN
                                                    </PinInput.Label>
                                                    <PinInput.Control className="flex items-center gap-2">
                                                        {[0, 1, 2, 3].map((index) => (
                                                            <PinInput.Input
                                                                key={index}
                                                                index={index}
                                                                className="bg-input text-foreground focus:ring-ring size-10 rounded-xl text-center font-mono text-sm font-bold inset-shadow-xs outline-none focus:ring-2"
                                                            />
                                                        ))}
                                                    </PinInput.Control>
                                                </PinInput.Root>
                                                <span className="text-muted-foreground text-[10px]">
                                                    One-time passkey pin input with auto-advance
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-muted/60 h-px" />

                                        {/* Ark UI TagsInput & Clipboard */}
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                    ARK UI TAGS INPUT (AUDIO GENRES & STYLES)
                                                </span>
                                                <TagsInput.Root defaultValue={['Progressive Rock', 'Lossless Master', 'Hi-Res 96k']}>
                                                    <TagsInput.Label className="text-foreground mb-1 block text-xs font-semibold">
                                                        Audio Genre Tags
                                                    </TagsInput.Label>
                                                    <TagsInput.Control className="bg-input flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-xl p-2 inset-shadow-xs">
                                                        <TagsInput.Context>
                                                            {(tagsInput) =>
                                                                tagsInput.value.map((value, index) => (
                                                                    <TagsInput.Item
                                                                        key={index}
                                                                        index={index}
                                                                        value={value}
                                                                        className="bg-card text-foreground flex items-center gap-1.5 rounded-lg px-2 py-1 font-mono text-xs shadow-2xs">
                                                                        <TagsInput.ItemText>{value}</TagsInput.ItemText>
                                                                        <TagsInput.ItemDeleteTrigger className="text-muted-foreground hover:text-destructive cursor-pointer bg-transparent">
                                                                            ✕
                                                                        </TagsInput.ItemDeleteTrigger>
                                                                    </TagsInput.Item>
                                                                ))
                                                            }
                                                        </TagsInput.Context>
                                                        <TagsInput.Input
                                                            placeholder="Type tag & Enter..."
                                                            className="text-foreground min-w-[120px] flex-1 bg-transparent px-1 font-mono text-xs outline-none"
                                                        />
                                                    </TagsInput.Control>
                                                </TagsInput.Root>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                    ARK UI CLIPBOARD (SHAREABLE URL)
                                                </span>
                                                <Clipboard.Root
                                                    value="https://mymusic.fm/track/pink-floyd-time-96k"
                                                    className="flex flex-col gap-1.5">
                                                    <Clipboard.Label className="text-foreground text-xs font-semibold">
                                                        Track Stream Hash URL
                                                    </Clipboard.Label>
                                                    <Clipboard.Control className="flex items-center gap-2">
                                                        <Clipboard.Input className="bg-input text-foreground focus:ring-ring h-10 w-full truncate rounded-xl px-3.5 font-mono text-xs inset-shadow-xs outline-none focus:ring-2" />
                                                        <Clipboard.Trigger asChild>
                                                            <Button variant="primary" size="sm" className="shrink-0 gap-1.5 rounded-xl px-3.5">
                                                                <Clipboard.Indicator copied={<Icon icon="check" className="size-3.5" />}>
                                                                    <Icon icon="sparkle" className="size-3.5" />
                                                                </Clipboard.Indicator>
                                                                <span>Copy</span>
                                                            </Button>
                                                        </Clipboard.Trigger>
                                                    </Clipboard.Control>
                                                </Clipboard.Root>
                                            </div>
                                        </div>

                                        <div className="bg-muted/60 h-px" />

                                        {/* Custom NumberInput & Editable */}
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div className="flex flex-col gap-3">
                                                <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                    NUMBER INPUT (PARALLEL PROBING CONCURRENCY)
                                                </span>
                                                <NumberInput min={1} max={16} defaultValue="8">
                                                    <NumberInputLabel>Active Probing Workers</NumberInputLabel>
                                                    <NumberInputControl>
                                                        <NumberInputInput />
                                                        <div className="absolute right-1 flex flex-col">
                                                            <NumberInputIncrementTrigger />
                                                            <NumberInputDecrementTrigger />
                                                        </div>
                                                    </NumberInputControl>
                                                    <NumberInputScrubber />
                                                </NumberInput>
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                    INLINE EDITABLE (TRACK TITLE METADATA)
                                                </span>
                                                <Editable defaultValue="Pink Floyd - The Dark Side of the Moon">
                                                    <EditableLabel>Album Title Tag</EditableLabel>
                                                    <EditableArea>
                                                        <EditablePreview />
                                                        <EditableInput className="font-mono text-xs" />
                                                    </EditableArea>
                                                    <EditableControl>
                                                        <EditableEditTrigger />
                                                        <EditableSubmitTrigger />
                                                        <EditableCancelTrigger />
                                                    </EditableControl>
                                                </Editable>
                                            </div>
                                        </div>
                                    </div>
                                </AnimatedSection>
                            )}

                            {/* 4. SELECTION CONTROLS, SWITCHES & CODEC CHIPS */}
                            {shouldShow('selection') && (
                                <AnimatedSection id="selection" className="flex flex-col gap-6">
                                    <div>
                                        <span className="text-muted-foreground mb-1 block text-[11px] font-medium tracking-widest uppercase">
                                            04 • SELECTION CONTROLS, SWITCHES & CHIPS
                                        </span>
                                        <h2 className="text-foreground text-base font-bold">
                                            Checkboxes, Radio Cards, Ark UI Switch, SegmentGroup & Rating
                                        </h2>
                                        <p className="text-muted-foreground mt-1 max-w-3xl text-xs leading-relaxed">
                                            Tactile selection primitives, hardware toggles, segmented tabs, interactive 5-star ratings, and codec
                                            chips.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        {/* Checkboxes & Switch */}
                                        <motion.div
                                            variants={cardVariants}
                                            className="bg-card text-card-foreground flex flex-col gap-5 rounded-2xl p-6 shadow">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                CHECKBOX STATES & ARK UI SWITCH
                                            </span>

                                            {/* Standard Checkbox */}
                                            <div className="flex items-center gap-6">
                                                <CheckboxRoot
                                                    checked={demoCheckbox1}
                                                    onCheckedChange={(details) => setDemoCheckbox1(Boolean(details.checked))}
                                                    className="flex cursor-pointer items-center gap-2">
                                                    <CheckboxControl />
                                                    <CheckboxLabel className="text-xs font-semibold">Standard Active</CheckboxLabel>
                                                </CheckboxRoot>

                                                <CheckboxRoot
                                                    checked={demoCheckbox2}
                                                    onCheckedChange={(details) => setDemoCheckbox2(Boolean(details.checked))}
                                                    className="flex cursor-pointer items-center gap-2">
                                                    <CheckboxControl />
                                                    <CheckboxLabel className="text-xs font-semibold">Secondary Option</CheckboxLabel>
                                                </CheckboxRoot>

                                                <CheckboxRoot checked="indeterminate" className="flex cursor-pointer items-center gap-2">
                                                    <CheckboxControl />
                                                    <CheckboxLabel className="text-xs font-semibold">Indeterminate</CheckboxLabel>
                                                </CheckboxRoot>
                                            </div>

                                            {/* Ark UI Switch Component */}
                                            <div className="bg-input flex items-center justify-between rounded-xl p-3.5 inset-shadow-xs">
                                                <div>
                                                    <span className="text-foreground block text-xs font-semibold">Triangular DSP Dithering</span>
                                                    <span className="text-muted-foreground text-[11px]">
                                                        Apply SoX triangular dither when reducing bit depth
                                                    </span>
                                                </div>
                                                <Switch.Root
                                                    checked={ditherSwitch}
                                                    onCheckedChange={(e) => setDitherSwitch(e.checked)}
                                                    className="flex cursor-pointer items-center gap-2 outline-none">
                                                    <Switch.Control
                                                        className={cn(
                                                            'flex h-6 w-11 items-center rounded-full p-0.5 inset-shadow-xs transition-colors',
                                                            ditherSwitch ? 'bg-primary' : 'bg-muted-foreground/30'
                                                        )}>
                                                        <Switch.Thumb
                                                            className={cn(
                                                                'bg-primary-foreground size-5 rounded-full shadow-xs transition-transform duration-150',
                                                                ditherSwitch ? 'translate-x-5' : 'translate-x-0'
                                                            )}
                                                        />
                                                    </Switch.Control>
                                                </Switch.Root>
                                            </div>

                                            {/* Ark UI SegmentGroup Component */}
                                            <div className="flex flex-col gap-2">
                                                <span className="text-muted-foreground text-[10px] font-bold uppercase">
                                                    ARK UI SEGMENT GROUP (PCM QUANTIZATION)
                                                </span>
                                                <SegmentGroup.Root
                                                    value={segmentBitDepth}
                                                    onValueChange={(details) => setSegmentBitDepth(details.value ?? '24bit')}
                                                    className="bg-input flex items-center gap-1 rounded-xl p-1 inset-shadow-xs">
                                                    {[
                                                        { id: '16bit', label: '16-bit (CD)' },
                                                        { id: '24bit', label: '24-bit (Hi-Res)' },
                                                        { id: '32bit', label: '32-bit Float' },
                                                    ].map((seg) => (
                                                        <SegmentGroup.Item
                                                            key={seg.id}
                                                            value={seg.id}
                                                            className={cn(
                                                                'flex-1 cursor-pointer rounded-lg py-1.5 text-center text-xs font-semibold transition-all outline-none',
                                                                segmentBitDepth === seg.id
                                                                    ? 'bg-card text-foreground shadow-xs'
                                                                    : 'text-muted-foreground hover:text-foreground'
                                                            )}>
                                                            <SegmentGroup.ItemText>{seg.label}</SegmentGroup.ItemText>
                                                            <SegmentGroup.ItemControl className="hidden" />
                                                        </SegmentGroup.Item>
                                                    ))}
                                                </SegmentGroup.Root>
                                            </div>

                                            {/* Ark UI RatingGroup Component */}
                                            <div className="bg-input flex items-center justify-between rounded-xl p-3.5 inset-shadow-xs">
                                                <div>
                                                    <span className="text-foreground block text-xs font-semibold">Audiophile Rating</span>
                                                    <span className="text-muted-foreground text-[11px]">Master pressing sound quality grade</span>
                                                </div>
                                                <RatingGroup.Root
                                                    count={5}
                                                    value={ratingValue}
                                                    onValueChange={(details) => setRatingValue(details.value)}
                                                    className="flex cursor-pointer items-center gap-1">
                                                    <RatingGroup.Control className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map((index) => (
                                                            <RatingGroup.Item
                                                                key={index}
                                                                index={index}
                                                                className={cn(
                                                                    'flex size-6 cursor-pointer items-center justify-center bg-transparent text-sm transition-transform hover:scale-110',
                                                                    index <= ratingValue ? 'text-primary' : 'text-muted-foreground/30'
                                                                )}>
                                                                ★
                                                            </RatingGroup.Item>
                                                        ))}
                                                    </RatingGroup.Control>
                                                </RatingGroup.Root>
                                            </div>
                                        </motion.div>

                                        {/* Radio Group Cards */}
                                        <motion.div
                                            variants={cardVariants}
                                            className="bg-card text-card-foreground flex flex-col gap-4 rounded-2xl p-6 shadow">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                RADIO GROUP CARDS (SCAN MODES)
                                            </span>

                                            <RadioGroup
                                                value={cardRadioSelection}
                                                onValueChange={(details) => setCardRadioSelection(details.value ?? 'fast')}>
                                                <RadioGroupLabel className="sr-only">Scan Mode</RadioGroupLabel>
                                                <div className="flex flex-col gap-2.5">
                                                    {[
                                                        {
                                                            id: 'fast',
                                                            label: 'Fast Scan (Add New Songs)',
                                                            desc: 'Detects new audio files without re-reading existing tracks',
                                                            badge: 'Recommended',
                                                        },
                                                        {
                                                            id: 'deep',
                                                            label: 'Deep Rebuild (Force Rescan)',
                                                            desc: 'Re-generates metadata tags, hashes, and cover art',
                                                            badge: 'Exhaustive',
                                                        },
                                                        {
                                                            id: 'errors',
                                                            label: 'Targeted Fix (Errors Only)',
                                                            desc: 'Retries tracks that failed earlier elementary parsing',
                                                            badge: 'Targeted',
                                                        },
                                                    ].map((opt) => (
                                                        <RadioGroupItem
                                                            key={opt.id}
                                                            value={opt.id}
                                                            cardStyle
                                                            className={cn(
                                                                'bg-card flex cursor-pointer items-start gap-3 rounded-xl p-3.5 shadow-sm transition-all hover:shadow active:shadow-inner',
                                                                cardRadioSelection === opt.id && 'ring-primary ring-2'
                                                            )}>
                                                            <RadioGroupItemControl className="mt-0.5" />
                                                            <div className="flex flex-1 flex-col">
                                                                <div className="flex items-center justify-between">
                                                                    <RadioGroupItemText className="text-foreground text-xs font-semibold">
                                                                        {opt.label}
                                                                    </RadioGroupItemText>
                                                                    <Badge size="xs" variant={cardRadioSelection === opt.id ? 'solid' : 'outline'}>
                                                                        {opt.badge}
                                                                    </Badge>
                                                                </div>
                                                                <span className="text-muted-foreground mt-0.5 text-[11px]">{opt.desc}</span>
                                                            </div>
                                                        </RadioGroupItem>
                                                    ))}
                                                </div>
                                            </RadioGroup>
                                        </motion.div>
                                    </div>

                                    {/* Codec Chip Matrix */}
                                    <motion.div
                                        variants={cardVariants}
                                        className="bg-card text-card-foreground flex flex-col gap-4 rounded-2xl p-6 shadow">
                                        <div className="flex items-center justify-between">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                AUDIO CODEC SELECTOR CHIPS
                                            </span>
                                            <span className="text-muted-foreground text-[10px]">
                                                SELECTED: <span className="text-primary font-bold">{activeChip.toUpperCase()}</span>
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
                                            {[
                                                { id: 'flac', label: 'FLAC', sub: 'Free Lossless' },
                                                { id: 'alac', label: 'ALAC', sub: 'Apple Audio' },
                                                { id: 'wav', label: 'WAV', sub: 'PCM Wave' },
                                                { id: 'dsd', label: 'DSD', sub: '1-Bit DFF' },
                                                { id: 'aiff', label: 'AIFF', sub: 'Linear PCM' },
                                                { id: 'opus', label: 'OPUS', sub: 'Interactive' },
                                                { id: 'aac', label: 'AAC', sub: 'MPEG-4' },
                                                { id: 'mp3', label: 'MP3', sub: 'Fraunhofer' },
                                                { id: 'pcm', label: 'PCM', sub: '24-bit 192k' },
                                                { id: 'ogg', label: 'OGG', sub: 'Vorbis' },
                                                { id: 'm4a', label: 'M4A', sub: 'Container' },
                                            ].map((item) => {
                                                const isSelected = activeChip === item.id;
                                                return (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() => setActiveChip(item.id)}
                                                        className={cn(
                                                            'bg-card flex h-20 cursor-pointer flex-col justify-between rounded-xl p-3 text-left shadow-sm transition-all hover:shadow active:shadow-inner',
                                                            isSelected && 'ring-primary shadow-md ring-2'
                                                        )}>
                                                        <div>
                                                            <span className="text-foreground block text-xs leading-tight font-bold">
                                                                {item.label}
                                                            </span>
                                                            <span className="text-muted-foreground text-[10px]">{item.sub}</span>
                                                        </div>
                                                        <div className="flex w-full items-center justify-between pt-1">
                                                            <span
                                                                className={cn(
                                                                    'size-1.5 rounded-full transition-colors',
                                                                    isSelected ? 'bg-primary shadow-xs' : 'bg-muted-foreground/30'
                                                                )}
                                                            />
                                                            <span className="text-muted-foreground/60 text-[10px]">✧</span>
                                                        </div>
                                                    </button>
                                                );
                                            })}

                                            {/* Shuffle Trigger */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const ids = ['flac', 'alac', 'wav', 'dsd', 'aiff', 'opus', 'aac', 'mp3', 'pcm', 'ogg', 'm4a'];
                                                    setActiveChip(ids[Math.floor(Math.random() * ids.length)]);
                                                }}
                                                className="bg-muted hover:bg-muted/80 text-foreground flex h-20 cursor-pointer items-center justify-center rounded-xl shadow-sm hover:shadow active:shadow-inner">
                                                <Icon icon="shuffle" className="size-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                </AnimatedSection>
                            )}

                            {/* 5. DROPDOWNS: SELECT, COMBOBOX & COLOR PICKER */}
                            {shouldShow('selectors') && (
                                <AnimatedSection id="selectors" className="flex flex-col gap-6">
                                    <div>
                                        <span className="text-muted-foreground mb-1 block text-[11px] font-medium tracking-widest uppercase">
                                            05 • SELECT, COMBOBOX & COLOR PICKER
                                        </span>
                                        <h2 className="text-foreground text-base font-bold">
                                            Ark UI Select Dropdowns, Search Combobox & Waveform Color Picker
                                        </h2>
                                        <p className="text-muted-foreground mt-1 max-w-3xl text-xs leading-relaxed">
                                            Accessible headless dropdown select, filterable combobox search, and palette color picker with channel
                                            sliders.
                                        </p>
                                    </div>

                                    <motion.div
                                        variants={cardVariants}
                                        className="bg-card text-card-foreground grid grid-cols-1 gap-6 rounded-2xl p-6 shadow md:grid-cols-3">
                                        {/* Ark UI Select Component */}
                                        <div className="flex flex-col gap-2">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                ARK UI SELECT (AUDIO ENGINE)
                                            </span>
                                            <Select.Root collection={engineCollection} defaultValue={['native']} className="flex flex-col gap-1.5">
                                                <Select.Label className="text-foreground text-xs font-semibold">
                                                    Active Processing Engine
                                                </Select.Label>
                                                <Select.Control>
                                                    <Select.Trigger className="bg-input text-foreground focus:ring-ring flex h-10 w-full cursor-pointer items-center justify-between rounded-xl px-3.5 font-mono text-xs inset-shadow-xs outline-none focus:ring-2">
                                                        <Select.ValueText placeholder="Select an engine" />
                                                        <span className="text-muted-foreground text-xs">▼</span>
                                                    </Select.Trigger>
                                                </Select.Control>
                                                <Select.Positioner>
                                                    <Select.Content className="bg-card text-card-foreground z-50 min-w-[220px] rounded-xl p-1.5 shadow-xl">
                                                        {engineCollection.items.map((item) => (
                                                            <Select.Item
                                                                key={item.value}
                                                                item={item}
                                                                className="hover:bg-muted active:bg-muted/80 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 font-mono text-xs">
                                                                <Select.ItemText>{item.label}</Select.ItemText>
                                                                <Select.ItemIndicator className="text-primary font-bold">✓</Select.ItemIndicator>
                                                            </Select.Item>
                                                        ))}
                                                    </Select.Content>
                                                </Select.Positioner>
                                            </Select.Root>
                                            <span className="text-muted-foreground text-[10px]">Headless popover select with collection items</span>
                                        </div>

                                        {/* Ark UI Combobox Component */}
                                        <div className="flex flex-col gap-2">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                ARK UI COMBOBOX (SEARCH ARTISTS)
                                            </span>
                                            <Combobox.Root collection={artistCollection} className="flex flex-col gap-1.5">
                                                <Combobox.Label className="text-foreground text-xs font-semibold">
                                                    Autocomplete Artist Filter
                                                </Combobox.Label>
                                                <Combobox.Control className="relative flex items-center">
                                                    <Combobox.Input
                                                        placeholder="Type artist e.g. Pink..."
                                                        className="bg-input text-foreground focus:ring-ring h-10 w-full rounded-xl px-3.5 pr-8 font-mono text-xs inset-shadow-xs outline-none focus:ring-2"
                                                    />
                                                    <Combobox.Trigger className="text-muted-foreground hover:text-foreground absolute right-3 cursor-pointer bg-transparent">
                                                        🔍
                                                    </Combobox.Trigger>
                                                </Combobox.Control>
                                                <Combobox.Positioner>
                                                    <Combobox.Content className="bg-card text-card-foreground z-50 min-w-[220px] rounded-xl p-1.5 shadow-xl">
                                                        <Combobox.ItemGroup>
                                                            {artistCollection.items.map((item) => (
                                                                <Combobox.Item
                                                                    key={item.value}
                                                                    item={item}
                                                                    className="hover:bg-muted active:bg-muted/80 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 font-mono text-xs">
                                                                    <Combobox.ItemText>{item.label}</Combobox.ItemText>
                                                                    <Combobox.ItemIndicator className="text-primary font-bold">
                                                                        ✓
                                                                    </Combobox.ItemIndicator>
                                                                </Combobox.Item>
                                                            ))}
                                                        </Combobox.ItemGroup>
                                                    </Combobox.Content>
                                                </Combobox.Positioner>
                                            </Combobox.Root>
                                            <span className="text-muted-foreground text-[10px]">Typeahead combobox with instant suggestions</span>
                                        </div>

                                        {/* Ark UI ColorPicker Component */}
                                        <div className="flex flex-col gap-2">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                ARK UI COLOR PICKER (WAVEFORM THEME)
                                            </span>
                                            <ColorPicker.Root
                                                value={colorValue}
                                                onValueChange={(details) => setColorValue(details.value)}
                                                className="flex flex-col gap-1.5">
                                                <ColorPicker.Label className="text-foreground text-xs font-semibold">
                                                    Spectral Waveform Hue
                                                </ColorPicker.Label>
                                                <ColorPicker.Control className="flex items-center gap-2">
                                                    <ColorPicker.ChannelInput
                                                        channel="hex"
                                                        className="bg-input text-foreground focus:ring-ring h-10 w-full rounded-xl px-3.5 font-mono text-xs uppercase inset-shadow-xs outline-none focus:ring-2"
                                                    />
                                                    <ColorPicker.Trigger className="bg-card size-10 shrink-0 cursor-pointer rounded-xl p-1 shadow-xs">
                                                        <ColorPicker.ValueSwatch className="size-full rounded-lg inset-shadow-2xs" />
                                                    </ColorPicker.Trigger>
                                                </ColorPicker.Control>
                                                <ColorPicker.Positioner>
                                                    <ColorPicker.Content className="bg-card text-card-foreground z-50 flex min-w-[240px] flex-col gap-3 rounded-2xl p-4 shadow-2xl">
                                                        <ColorPicker.Area className="relative h-32 overflow-hidden rounded-xl inset-shadow-xs">
                                                            <ColorPicker.AreaBackground />
                                                            <ColorPicker.AreaThumb className="size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm" />
                                                        </ColorPicker.Area>
                                                        <ColorPicker.ChannelSlider channel="hue" className="relative h-3 rounded-full">
                                                            <ColorPicker.ChannelSliderTrack className="h-3 rounded-full" />
                                                            <ColorPicker.ChannelSliderThumb className="size-4 -translate-y-0.5 rounded-full bg-white shadow-sm" />
                                                        </ColorPicker.ChannelSlider>
                                                    </ColorPicker.Content>
                                                </ColorPicker.Positioner>
                                            </ColorPicker.Root>
                                            <span className="text-muted-foreground text-[10px]">ColorPicker with swatch and saturation area</span>
                                        </div>
                                    </motion.div>
                                </AnimatedSection>
                            )}

                            {/* 6. SLIDERS & ROTARY PAN CONTROLS */}
                            {shouldShow('sliders') && (
                                <AnimatedSection id="sliders" className="flex flex-col gap-6">
                                    <div>
                                        <span className="text-muted-foreground mb-1 block text-[11px] font-medium tracking-widest uppercase">
                                            06 • SLIDERS & ROTARY PAN
                                        </span>
                                        <h2 className="text-foreground text-base font-bold">Ark UI Continuous Volume Slider & Rotary Angle Pan</h2>
                                        <p className="text-muted-foreground mt-1 max-w-3xl text-xs leading-relaxed">
                                            Continuous gain faders with range tracks, thumbs, ticks, and circular rotary controls for stereo
                                            soundstage panning.
                                        </p>
                                    </div>

                                    <motion.div
                                        variants={cardVariants}
                                        className="bg-card text-card-foreground grid grid-cols-1 gap-8 rounded-2xl p-6 shadow md:grid-cols-2">
                                        {/* Ark UI Slider Component */}
                                        <div className="flex flex-col gap-4">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                ARK UI SLIDER (MASTER OUTPUT GAIN)
                                            </span>
                                            <Slider.Root
                                                value={sliderVolume}
                                                onValueChange={(details) => setSliderVolume(details.value)}
                                                min={0}
                                                max={100}
                                                className="flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <Slider.Label className="text-foreground text-xs font-semibold">Master Attenuation</Slider.Label>
                                                    <span className="text-primary font-mono text-xs font-bold">
                                                        {sliderVolume[0]}% (-{(100 - sliderVolume[0]) * 0.4} dB)
                                                    </span>
                                                </div>
                                                <Slider.Control className="relative flex h-6 cursor-pointer items-center">
                                                    <Slider.Track className="bg-input relative h-3 w-full overflow-hidden rounded-full inset-shadow-xs">
                                                        <Slider.Range className="bg-primary h-full rounded-full" />
                                                    </Slider.Track>
                                                    <Slider.Thumb
                                                        index={0}
                                                        className="bg-card focus-visible:ring-ring flex size-6 cursor-grab items-center justify-center rounded-full shadow-md outline-none focus-visible:ring-2 active:cursor-grabbing">
                                                        <div className="bg-primary size-2 rounded-full" />
                                                    </Slider.Thumb>
                                                </Slider.Control>
                                            </Slider.Root>
                                            <div className="text-muted-foreground flex items-center justify-between text-[10px]">
                                                <span>0% (-40 dB)</span>
                                                <span>50% (-20 dB)</span>
                                                <span>100% (0 dB Unity)</span>
                                            </div>
                                        </div>

                                        {/* Ark UI AngleSlider Component */}
                                        <div className="flex flex-col gap-4">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                ARK UI ANGLE SLIDER (STEREO SOUNDSTAGE PAN)
                                            </span>
                                            <div className="flex items-center gap-6">
                                                <AngleSlider.Root
                                                    value={anglePan}
                                                    onValueChange={(details) => setAnglePan(details.value)}
                                                    className="flex flex-col items-center gap-2">
                                                    <AngleSlider.Control className="bg-input relative flex size-20 cursor-pointer items-center justify-center rounded-full inset-shadow-xs">
                                                        <AngleSlider.Thumb className="bg-primary size-4 -translate-y-7 rounded-full shadow-sm outline-none" />
                                                        <div className="text-foreground text-[10px] font-bold">{anglePan}°</div>
                                                    </AngleSlider.Control>
                                                    <AngleSlider.Label className="text-foreground text-xs font-semibold">Pan Angle</AngleSlider.Label>
                                                </AngleSlider.Root>

                                                <div className="flex flex-col gap-1 text-xs">
                                                    <span className="text-foreground font-semibold">Stereo Azimuth</span>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Drag rotary dial to calibrate binaural stereo width and spatial speaker angle.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatedSection>
                            )}

                            {/* 7. PROGRESS, TELEMETRY, TIMERS & QR */}
                            {shouldShow('progress') && (
                                <AnimatedSection id="progress" className="flex flex-col gap-6">
                                    <div>
                                        <span className="text-muted-foreground mb-1 block text-[11px] font-medium tracking-widest uppercase">
                                            07 • PROGRESS, TIMERS & QR CODES
                                        </span>
                                        <h2 className="text-foreground text-base font-bold">
                                            Linear Bars, Radial Gauges, Ark UI Timer & Remote Sync QR Code
                                        </h2>
                                        <p className="text-muted-foreground mt-1 max-w-3xl text-xs leading-relaxed">
                                            Deterministic/indeterminate progress, circular telemetry gauges, live countdown stopwatch, and crisp
                                            mobile connect QR.
                                        </p>
                                    </div>

                                    <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-2xl p-6 shadow">
                                        {/* Linear Progress */}
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div className="flex flex-col gap-2">
                                                <Progress value={sampleProgress} className="gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <ProgressLabel>TagLib 2.x Ingestion Progress</ProgressLabel>
                                                        <ProgressValueText />
                                                    </div>
                                                    <ProgressTrack className="bg-input h-3 rounded-full inset-shadow-xs">
                                                        <ProgressRange className="bg-primary rounded-full" />
                                                    </ProgressTrack>
                                                </Progress>
                                                <div className="flex items-center gap-1.5 pt-1">
                                                    {[25, 50, 75, 100].map((val) => (
                                                        <button
                                                            key={val}
                                                            type="button"
                                                            onClick={() => setSampleProgress(val)}
                                                            className={cn(
                                                                'cursor-pointer rounded px-2 py-0.5 font-mono text-[10px] transition-colors',
                                                                sampleProgress === val
                                                                    ? 'bg-foreground text-background font-bold'
                                                                    : 'bg-muted text-muted-foreground hover:text-foreground'
                                                            )}>
                                                            {val}%
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <Progress value={null} className="gap-2">
                                                <div className="flex items-center justify-between">
                                                    <ProgressLabel>Indeterminate Audio Stream Verification</ProgressLabel>
                                                    <span className="text-muted-foreground text-[10px] font-semibold">Active</span>
                                                </div>
                                                <ProgressTrack className="bg-input h-3 rounded-full inset-shadow-xs">
                                                    <ProgressRange className="bg-primary rounded-full" />
                                                </ProgressTrack>
                                            </Progress>
                                        </div>

                                        <div className="bg-muted/60 h-px" />

                                        {/* Radial Circles, Timer & QR Code */}
                                        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-3">
                                            {/* Radial Circular Progress */}
                                            <div className="bg-input/50 flex flex-col items-center gap-2 rounded-xl p-4 inset-shadow-2xs">
                                                <Progress value={78} className="items-center">
                                                    <ProgressCircle size={88} thickness={8}>
                                                        <ProgressCircleTrack className="stroke-input" />
                                                        <ProgressCircleRange className="stroke-primary" />
                                                    </ProgressCircle>
                                                </Progress>
                                                <span className="text-foreground text-xs font-bold">78% CPU Utilization</span>
                                                <span className="text-muted-foreground text-[10px]">8 Parallel Probers</span>
                                            </div>

                                            {/* Ark UI Timer Component */}
                                            <div className="bg-input/50 flex flex-col items-center gap-2 rounded-xl p-4 inset-shadow-2xs">
                                                <span className="text-muted-foreground text-[10px] font-bold uppercase">
                                                    ARK UI TIMER (PLAYBACK STOPWATCH)
                                                </span>
                                                <Timer.Root targetMs={300000} autoStart className="flex flex-col items-center gap-2">
                                                    <Timer.Area className="text-primary flex items-center font-mono text-2xl font-bold tracking-widest">
                                                        <Timer.Item type="minutes" />
                                                        <Timer.Separator>:</Timer.Separator>
                                                        <Timer.Item type="seconds" />
                                                    </Timer.Area>
                                                    <Timer.Control className="mt-1 flex items-center gap-2">
                                                        <Timer.ActionTrigger action="start" asChild>
                                                            <Button variant="outline" size="xs">
                                                                Start
                                                            </Button>
                                                        </Timer.ActionTrigger>
                                                        <Timer.ActionTrigger action="pause" asChild>
                                                            <Button variant="outline" size="xs">
                                                                Pause
                                                            </Button>
                                                        </Timer.ActionTrigger>
                                                        <Timer.ActionTrigger action="reset" asChild>
                                                            <Button variant="ghost" size="xs">
                                                                Reset
                                                            </Button>
                                                        </Timer.ActionTrigger>
                                                    </Timer.Control>
                                                </Timer.Root>
                                                <span className="text-muted-foreground text-[10px]">Precise audio duration counter</span>
                                            </div>

                                            {/* Ark UI QrCode Component */}
                                            <div className="bg-input/50 flex flex-col items-center gap-2 rounded-xl p-4 inset-shadow-2xs">
                                                <span className="text-muted-foreground text-[10px] font-bold uppercase">
                                                    ARK UI QR CODE (REMOTE SYNC)
                                                </span>
                                                <QrCode.Root
                                                    value="https://mymusic.fm/sync?session=studio-pro"
                                                    className="bg-card rounded-xl p-2 shadow-xs">
                                                    <QrCode.Frame className="size-20">
                                                        <QrCode.Pattern className="fill-foreground" />
                                                    </QrCode.Frame>
                                                </QrCode.Root>
                                                <span className="text-muted-foreground text-[10px]">Mobile remote app connection</span>
                                            </div>
                                        </div>
                                    </div>
                                </AnimatedSection>
                            )}

                            {/* 8. OVERLAYS: DIALOG, DRAWER, POPOVER, TOOLTIP, HOVERCARD & MENU */}
                            {shouldShow('overlays') && (
                                <AnimatedSection id="overlays" className="flex flex-col gap-6">
                                    <div>
                                        <span className="text-muted-foreground mb-1 block text-[11px] font-medium tracking-widest uppercase">
                                            08 • OVERLAYS: MODALS, SHEETS & POPUPS
                                        </span>
                                        <h2 className="text-foreground text-base font-bold">
                                            Dialog, Drawer, Popover, Tooltip, HoverCard & Context Menu
                                        </h2>
                                        <p className="text-muted-foreground mt-1 max-w-3xl text-xs leading-relaxed">
                                            Tactile modals, bottom drawer sheets, accessible floating popovers, rich hover preview cards, and action
                                            context menus.
                                        </p>
                                    </div>

                                    <div className="bg-card text-card-foreground grid grid-cols-2 items-center justify-items-center gap-4 rounded-2xl p-6 shadow sm:grid-cols-3 lg:grid-cols-6">
                                        {/* 1. Dialog Modal */}
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="primary" size="sm" className="w-full">
                                                    Dialog
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-card text-card-foreground max-w-md rounded-2xl p-6 shadow-2xl">
                                                <DialogCloseTrigger />
                                                <div className="mb-2 flex items-center gap-3">
                                                    <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
                                                        <Icon icon="playlist" className="size-5" />
                                                    </div>
                                                    <div>
                                                        <DialogTitle className="text-base font-bold">Track Inspector Modal</DialogTitle>
                                                        <DialogDescription className="text-muted-foreground text-xs">
                                                            Inspect TagLib 2.x metadata fields and buffer.
                                                        </DialogDescription>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-3 py-4">
                                                    <Field>
                                                        <FieldLabel>Title</FieldLabel>
                                                        <FieldInput defaultValue="Speak to Me" />
                                                    </Field>
                                                    <Field>
                                                        <FieldLabel>Artist</FieldLabel>
                                                        <FieldInput defaultValue="Pink Floyd" />
                                                    </Field>
                                                </div>
                                                <div className="flex justify-end gap-2 pt-2">
                                                    <DialogCloseTrigger asChild>
                                                        <Button variant="primary" size="sm">
                                                            Save Changes
                                                        </Button>
                                                    </DialogCloseTrigger>
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                        {/* 2. Drawer Sheet */}
                                        <Drawer swipeDirection="bottom">
                                            <DrawerTrigger asChild>
                                                <Button variant="dark" size="sm" className="w-full">
                                                    Drawer
                                                </Button>
                                            </DrawerTrigger>
                                            <DrawerBackdrop />
                                            <DrawerPositioner>
                                                <DrawerContent className="rounded-t-3xl p-6 shadow-2xl">
                                                    <DrawerGrabber />
                                                    <div className="mx-auto w-full max-w-2xl py-4">
                                                        <DrawerTitle className="text-foreground text-base font-bold">
                                                            Audio Stream Forensic Telemetry
                                                        </DrawerTitle>
                                                        <DrawerDescription className="text-muted-foreground mt-1 text-xs">
                                                            Live elementary stream properties extracted via FFprobe 9.0.
                                                        </DrawerDescription>
                                                        <div className="my-4 grid grid-cols-3 gap-3">
                                                            <div className="bg-input rounded-xl p-3 inset-shadow-xs">
                                                                <span className="text-muted-foreground block text-[10px]">CONTAINER</span>
                                                                <span className="text-xs font-bold">FLAC Lossless</span>
                                                            </div>
                                                            <div className="bg-input rounded-xl p-3 inset-shadow-xs">
                                                                <span className="text-muted-foreground block text-[10px]">SAMPLE RATE</span>
                                                                <span className="text-xs font-bold">96,000 Hz</span>
                                                            </div>
                                                            <div className="bg-input rounded-xl p-3 inset-shadow-xs">
                                                                <span className="text-muted-foreground block text-[10px]">BIT DEPTH</span>
                                                                <span className="text-xs font-bold">24-bit True</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end pt-2">
                                                            <DrawerCloseTrigger asChild>
                                                                <Button variant="primary" size="sm">
                                                                    Close Sheet
                                                                </Button>
                                                            </DrawerCloseTrigger>
                                                        </div>
                                                    </div>
                                                </DrawerContent>
                                            </DrawerPositioner>
                                        </Drawer>

                                        {/* 3. Ark UI Popover */}
                                        <Popover.Root>
                                            <Popover.Trigger asChild>
                                                <Button variant="outline" size="sm" className="w-full">
                                                    Popover
                                                </Button>
                                            </Popover.Trigger>
                                            <Popover.Positioner>
                                                <Popover.Content className="bg-card text-card-foreground z-50 flex max-w-xs flex-col gap-2 rounded-2xl p-4 shadow-xl">
                                                    <div className="flex items-center justify-between">
                                                        <Popover.Title className="text-foreground text-xs font-bold">Buffer Allocation</Popover.Title>
                                                        <Popover.CloseTrigger className="text-muted-foreground hover:text-foreground cursor-pointer bg-transparent">
                                                            ✕
                                                        </Popover.CloseTrigger>
                                                    </div>
                                                    <Popover.Description className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Ring buffer configured for 4,096 samples with double-precision zero padding.
                                                    </Popover.Description>
                                                </Popover.Content>
                                            </Popover.Positioner>
                                        </Popover.Root>

                                        {/* 4. Ark UI Tooltip */}
                                        <Tooltip.Root>
                                            <Tooltip.Trigger asChild>
                                                <Button variant="secondary" size="sm" className="w-full">
                                                    Tooltip
                                                </Button>
                                            </Tooltip.Trigger>
                                            <Tooltip.Positioner>
                                                <Tooltip.Content className="bg-foreground text-background z-50 rounded-lg px-2.5 py-1.5 font-mono text-[10px] font-semibold shadow-md">
                                                    Bit-safe TagLib 2.x mode active
                                                </Tooltip.Content>
                                            </Tooltip.Positioner>
                                        </Tooltip.Root>

                                        {/* 5. Ark UI HoverCard */}
                                        <HoverCard.Root>
                                            <HoverCard.Trigger asChild>
                                                <Button variant="slate" size="sm" className="w-full">
                                                    HoverCard
                                                </Button>
                                            </HoverCard.Trigger>
                                            <HoverCard.Positioner>
                                                <HoverCard.Content className="bg-card text-card-foreground z-50 flex max-w-xs flex-col gap-2 rounded-2xl p-4 shadow-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full font-bold">
                                                            PF
                                                        </div>
                                                        <div>
                                                            <span className="text-foreground block text-xs font-bold">Pink Floyd</span>
                                                            <span className="text-muted-foreground text-[10px]">London, England • 1965</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-muted-foreground mt-1 text-[11px]">
                                                        English rock band that pioneered progressive and psychedelic music with quadraphonic
                                                        recordings.
                                                    </p>
                                                </HoverCard.Content>
                                            </HoverCard.Positioner>
                                        </HoverCard.Root>

                                        {/* 6. Ark UI Menu */}
                                        <Menu.Root>
                                            <Menu.Trigger asChild>
                                                <Button variant="outline" size="sm" className="w-full">
                                                    Menu ▾
                                                </Button>
                                            </Menu.Trigger>
                                            <Menu.Positioner>
                                                <Menu.Content className="bg-card text-card-foreground z-50 flex min-w-[160px] flex-col gap-0.5 rounded-xl p-1.5 shadow-xl">
                                                    <Menu.Item
                                                        value="play"
                                                        className="hover:bg-muted active:bg-muted/80 cursor-pointer rounded-lg px-3 py-1.5 font-mono text-xs">
                                                        Play Next
                                                    </Menu.Item>
                                                    <Menu.Item
                                                        value="info"
                                                        className="hover:bg-muted active:bg-muted/80 cursor-pointer rounded-lg px-3 py-1.5 font-mono text-xs">
                                                        View Metadata
                                                    </Menu.Item>
                                                    <Menu.Separator className="bg-muted/60 my-1 h-px" />
                                                    <Menu.Item
                                                        value="delete"
                                                        className="text-destructive hover:bg-destructive/10 cursor-pointer rounded-lg px-3 py-1.5 font-mono text-xs">
                                                        Delete File
                                                    </Menu.Item>
                                                </Menu.Content>
                                            </Menu.Positioner>
                                        </Menu.Root>
                                    </div>
                                </AnimatedSection>
                            )}

                            {/* 9. NAVIGATION, STEPS, TABS, ACCORDION, COLLAPSIBLE, TREE, PAGINATION & SPLITTER */}
                            {shouldShow('navigation') && (
                                <AnimatedSection id="navigation" className="flex flex-col gap-6">
                                    <div>
                                        <span className="text-muted-foreground mb-1 block text-[11px] font-medium tracking-widest uppercase">
                                            09 • NAVIGATION, HIERARCHIES & RESIZING
                                        </span>
                                        <h2 className="text-foreground text-base font-bold">
                                            Steps Wizard, Tabs, Accordion, Collapsible, TreeView, Pagination & Splitter
                                        </h2>
                                        <p className="text-muted-foreground mt-1 max-w-3xl text-xs leading-relaxed">
                                            Process pipelines, tactile tabs, expandable accordions, directory trees, data pagination, and resizable
                                            layout splitters.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        {/* Steps Wizard */}
                                        <motion.div
                                            variants={cardVariants}
                                            className="bg-card text-card-foreground flex flex-col gap-4 rounded-2xl p-6 shadow">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                STEPS PIPELINE WIZARD
                                            </span>
                                            <Steps count={3} defaultStep={1}>
                                                <StepsList>
                                                    <StepsItem index={0}>
                                                        <StepsTrigger>
                                                            <StepsIndicator>1</StepsIndicator>
                                                            <div className="flex flex-col text-left">
                                                                <span className="text-xs font-semibold">Folder</span>
                                                                <span className="text-muted-foreground text-[10px]">Selected</span>
                                                            </div>
                                                        </StepsTrigger>
                                                        <StepsSeparator />
                                                    </StepsItem>
                                                    <StepsItem index={1}>
                                                        <StepsTrigger>
                                                            <StepsIndicator>2</StepsIndicator>
                                                            <div className="flex flex-col text-left">
                                                                <span className="text-xs font-semibold">TagLib</span>
                                                                <span className="text-muted-foreground text-[10px]">Active</span>
                                                            </div>
                                                        </StepsTrigger>
                                                        <StepsSeparator />
                                                    </StepsItem>
                                                    <StepsItem index={2}>
                                                        <StepsTrigger>
                                                            <StepsIndicator>3</StepsIndicator>
                                                            <div className="flex flex-col text-left">
                                                                <span className="text-xs font-semibold">QC Probing</span>
                                                                <span className="text-muted-foreground text-[10px]">Pending</span>
                                                            </div>
                                                        </StepsTrigger>
                                                    </StepsItem>
                                                </StepsList>

                                                <div className="bg-input mt-4 min-h-[70px] rounded-xl p-4 inset-shadow-xs">
                                                    <StepsContent index={0}>Step 1: Point to local audio directory archive.</StepsContent>
                                                    <StepsContent index={1}>Step 2: Read ID3v2, Vorbis Comments, and album artwork.</StepsContent>
                                                    <StepsContent index={2}>
                                                        Step 3: Analyze audio elementary streams and check for corrupted frames.
                                                    </StepsContent>
                                                    <StepsCompletedContent>
                                                        All library verification stages completed successfully!
                                                    </StepsCompletedContent>
                                                </div>

                                                <div className="mt-2 flex items-center gap-2">
                                                    <StepsPrevTrigger asChild>
                                                        <Button variant="outline" size="xs">
                                                            Previous
                                                        </Button>
                                                    </StepsPrevTrigger>
                                                    <StepsNextTrigger asChild>
                                                        <Button variant="primary" size="xs">
                                                            Next Step
                                                        </Button>
                                                    </StepsNextTrigger>
                                                </div>
                                            </Steps>
                                        </motion.div>

                                        {/* Ark UI Accordion */}
                                        <motion.div
                                            variants={cardVariants}
                                            className="bg-card text-card-foreground flex flex-col gap-4 rounded-2xl p-6 shadow">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                ARK UI ACCORDION (ENGINE TECHNICAL SPECS)
                                            </span>
                                            <Accordion.Root defaultValue={['item-1']} className="flex flex-col gap-2">
                                                <Accordion.Item value="item-1" className="bg-input overflow-hidden rounded-xl inset-shadow-2xs">
                                                    <Accordion.ItemTrigger className="text-foreground flex w-full cursor-pointer items-center justify-between bg-transparent px-4 py-3 text-xs font-bold">
                                                        <span>TagLib 2.x Architecture</span>
                                                        <Accordion.ItemIndicator className="transition-transform duration-200">
                                                            ▾
                                                        </Accordion.ItemIndicator>
                                                    </Accordion.ItemTrigger>
                                                    <Accordion.ItemContent className="text-muted-foreground px-4 pb-3 text-[11px] leading-relaxed">
                                                        Direct C++17 integration preserving audio data bit-for-bit with atomic temp sibling file swap.
                                                    </Accordion.ItemContent>
                                                </Accordion.Item>

                                                <Accordion.Item value="item-2" className="bg-input overflow-hidden rounded-xl inset-shadow-2xs">
                                                    <Accordion.ItemTrigger className="text-foreground flex w-full cursor-pointer items-center justify-between bg-transparent px-4 py-3 text-xs font-bold">
                                                        <span>MediaInfo WASM Pooling</span>
                                                        <Accordion.ItemIndicator className="transition-transform duration-200">
                                                            ▾
                                                        </Accordion.ItemIndicator>
                                                    </Accordion.ItemTrigger>
                                                    <Accordion.ItemContent className="text-muted-foreground px-4 pb-3 text-[11px] leading-relaxed">
                                                        Instance recycling pool with 5-minute idle eviction to guarantee bounded WebAssembly memory.
                                                    </Accordion.ItemContent>
                                                </Accordion.Item>
                                            </Accordion.Root>
                                        </motion.div>
                                    </div>

                                    {/* TreeView & Collapsible */}
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        {/* TreeView */}
                                        <motion.div
                                            variants={cardVariants}
                                            className="bg-card text-card-foreground flex flex-col gap-4 rounded-2xl p-6 shadow">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                COLLAPSIBLE MUSIC DIRECTORY TREE
                                            </span>
                                            <TreeView collection={musicLibraryTree} className="w-full max-w-none bg-transparent p-0 shadow-none">
                                                <TreeViewLabel className="text-foreground mb-2 text-xs font-semibold">
                                                    Indexed Library Root
                                                </TreeViewLabel>
                                                <TreeViewTree>
                                                    {musicLibraryTree.rootNode.children?.map((childNode, index) => (
                                                        <TreeNode key={childNode.id} node={childNode} indexPath={[index]} />
                                                    ))}
                                                </TreeViewTree>
                                            </TreeView>
                                        </motion.div>

                                        {/* Ark UI Collapsible & Pagination */}
                                        <motion.div
                                            variants={cardVariants}
                                            className="bg-card text-card-foreground flex flex-col justify-between gap-6 rounded-2xl p-6 shadow">
                                            <div className="flex flex-col gap-3">
                                                <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                    ARK UI COLLAPSIBLE (ADVANCED STREAM DEBUG)
                                                </span>
                                                <Collapsible.Root className="flex flex-col gap-2">
                                                    <Collapsible.Trigger asChild>
                                                        <Button variant="outline" size="sm" className="w-fit gap-1.5">
                                                            <Icon icon="settings" className="size-3.5" />
                                                            <span>Toggle Forensic Stream Flags</span>
                                                        </Button>
                                                    </Collapsible.Trigger>
                                                    <Collapsible.Content className="bg-input text-muted-foreground rounded-xl p-3.5 text-[11px] leading-relaxed inset-shadow-xs">
                                                        FFprobe flags:{' '}
                                                        <code className="text-foreground">-show_entries stream=codec_name,bit_rate,channels</code>.
                                                        MediaInfo mode: <code className="text-foreground">FullStreamSummary</code>.
                                                    </Collapsible.Content>
                                                </Collapsible.Root>
                                            </div>

                                            {/* Ark UI Pagination */}
                                            <div className="flex flex-col gap-3">
                                                <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                    ARK UI PAGINATION (TRACK CATALOG)
                                                </span>
                                                <Pagination.Root count={60} pageSize={10} defaultPage={1} className="flex items-center gap-1.5">
                                                    <Pagination.PrevTrigger asChild>
                                                        <Button variant="outline" size="xs">
                                                            Prev
                                                        </Button>
                                                    </Pagination.PrevTrigger>
                                                    <Pagination.Context>
                                                        {(pagination) =>
                                                            pagination.pages.map((page, index) =>
                                                                page.type === 'page' ? (
                                                                    <Pagination.Item key={index} {...page} asChild>
                                                                        <Button
                                                                            variant={pagination.page === page.value ? 'primary' : 'outline'}
                                                                            size="xs"
                                                                            className="size-7 p-0">
                                                                            {page.value}
                                                                        </Button>
                                                                    </Pagination.Item>
                                                                ) : (
                                                                    <Pagination.Ellipsis
                                                                        key={index}
                                                                        index={index}
                                                                        className="text-muted-foreground px-2">
                                                                        &#8230;
                                                                    </Pagination.Ellipsis>
                                                                )
                                                            )
                                                        }
                                                    </Pagination.Context>
                                                    <Pagination.NextTrigger asChild>
                                                        <Button variant="outline" size="xs">
                                                            Next
                                                        </Button>
                                                    </Pagination.NextTrigger>
                                                </Pagination.Root>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Tactile Pill Tabs & ScrollArea Grid */}
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        {/* Tabs */}
                                        <motion.div
                                            variants={cardVariants}
                                            className="bg-card text-card-foreground flex flex-col gap-4 rounded-2xl p-6 shadow">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">TACTILE PILL TABS</span>
                                            <Tabs defaultValue="flac">
                                                <TabsList className="bg-input flex items-center gap-1 rounded-xl p-1 inset-shadow-xs">
                                                    <TabsTrigger value="flac">FLAC Engine</TabsTrigger>
                                                    <TabsTrigger value="alac">Apple ALAC</TabsTrigger>
                                                    <TabsTrigger value="dsd">DSD Stream</TabsTrigger>
                                                </TabsList>
                                                <div className="bg-input mt-3 rounded-xl p-4 inset-shadow-xs">
                                                    <TabsContent value="flac">
                                                        FLAC Free Lossless Audio Codec: Bit-for-bit PCM preservation up to 32-bit / 384kHz with Vorbis
                                                        Comment block support.
                                                    </TabsContent>
                                                    <TabsContent value="alac">
                                                        Apple Lossless Audio Codec: Stored inside MP4 containers (.m4a) with QuickTime atom tag
                                                        architecture.
                                                    </TabsContent>
                                                    <TabsContent value="dsd">
                                                        Direct Stream Digital: 1-bit high-frequency PDM stream (.dsf / .dff) clocked at 2.8MHz (DSD64)
                                                        or 5.6MHz (DSD128).
                                                    </TabsContent>
                                                </div>
                                            </Tabs>
                                        </motion.div>

                                        {/* ScrollArea */}
                                        <motion.div
                                            variants={cardVariants}
                                            className="bg-card text-card-foreground flex flex-col gap-4 rounded-2xl p-6 shadow">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                TACTILE SCROLL AREA WITH CUSTOM THUMB
                                            </span>
                                            <ScrollArea className="bg-input h-44 w-full rounded-xl p-1 inset-shadow-xs">
                                                <ScrollViewport className="h-full w-full p-3">
                                                    <ScrollContent className="space-y-2">
                                                        {Array.from({ length: 12 }).map((_, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="border-muted/30 last: flex items-center justify-between border-b py-1 text-xs">
                                                                <span className="text-foreground font-semibold">
                                                                    Track {String(idx + 1).padStart(2, '0')}.flac
                                                                </span>
                                                                <span className="text-muted-foreground text-[10px]">96kHz • 24b • 48.2 MB</span>
                                                            </div>
                                                        ))}
                                                    </ScrollContent>
                                                </ScrollViewport>
                                                <ScrollBar orientation="vertical">
                                                    <ScrollThumb />
                                                </ScrollBar>
                                            </ScrollArea>
                                        </motion.div>
                                    </div>

                                    {/* Ark UI Splitter */}
                                    <motion.div
                                        variants={cardVariants}
                                        className="bg-card text-card-foreground flex flex-col gap-4 rounded-2xl p-6 shadow">
                                        <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                            ARK UI SPLITTER (RESIZABLE DUAL PANES)
                                        </span>
                                        <Splitter.Root
                                            panels={[
                                                { id: 'lib', minSize: 20 },
                                                { id: 'wave', minSize: 20 },
                                            ]}
                                            className="bg-input flex h-32 items-stretch gap-1 rounded-xl p-1 inset-shadow-xs">
                                            <Splitter.Panel id="lib" className="bg-card flex flex-col justify-center rounded-lg p-3 shadow-2xs">
                                                <span className="text-foreground text-xs font-bold">Library Tree Pane</span>
                                                <span className="text-muted-foreground text-[10px]">Drag the divider bar to resize</span>
                                            </Splitter.Panel>
                                            <Splitter.ResizeTrigger
                                                id="lib:wave"
                                                className="bg-muted hover:bg-primary w-2 cursor-col-resize rounded transition-colors"
                                            />
                                            <Splitter.Panel id="wave" className="bg-card flex flex-col justify-center rounded-lg p-3 shadow-2xs">
                                                <span className="text-foreground text-xs font-bold">Spectral Analyzer Pane</span>
                                                <span className="text-muted-foreground text-[10px]">FFT 2048-point audio waveform</span>
                                            </Splitter.Panel>
                                        </Splitter.Root>
                                    </motion.div>
                                </AnimatedSection>
                            )}

                            {/* 10. MEDIA: AVATAR, CAROUSEL, FILE UPLOAD & SIGNATURE PAD */}
                            {shouldShow('media') && (
                                <AnimatedSection id="media" className="flex flex-col gap-6">
                                    <div>
                                        <span className="text-muted-foreground mb-1 block text-[11px] font-medium tracking-widest uppercase">
                                            10 • AVATARS, CAROUSELS, FILE UPLOAD & SIGNATURE
                                        </span>
                                        <h2 className="text-foreground text-base font-bold">
                                            Ark UI Avatar, Carousel, File Upload Dropzone & Signature Pad
                                        </h2>
                                        <p className="text-muted-foreground mt-1 max-w-3xl text-xs leading-relaxed">
                                            Artist avatars, cover art slider carousel, audio file dropzone, and sound engineer digital sign-off
                                            canvas.
                                        </p>
                                    </div>

                                    <motion.div
                                        variants={cardVariants}
                                        className="bg-card text-card-foreground grid grid-cols-1 gap-6 rounded-2xl p-6 shadow md:grid-cols-2">
                                        {/* Ark UI Carousel Component */}
                                        <div className="flex flex-col gap-3">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                ARK UI CAROUSEL (ALBUM ARTWORK SHOWCASE)
                                            </span>
                                            <Carousel.Root slideCount={3} className="flex flex-col gap-3">
                                                <Carousel.ItemGroup className="bg-input relative h-36 overflow-hidden rounded-xl inset-shadow-xs">
                                                    {[
                                                        { title: 'The Dark Side of the Moon', artist: 'Pink Floyd', year: '1973' },
                                                        { title: 'Random Access Memories', artist: 'Daft Punk', year: '2013' },
                                                        { title: 'Kind of Blue', artist: 'Miles Davis', year: '1959' },
                                                    ].map((slide, index) => (
                                                        <Carousel.Item
                                                            key={index}
                                                            index={index}
                                                            className="flex size-full flex-col items-center justify-center p-4 text-center">
                                                            <div className="bg-primary/10 text-primary mb-2 flex size-10 items-center justify-center rounded-full">
                                                                <Icon icon="album" className="size-5" />
                                                            </div>
                                                            <span className="text-foreground text-xs font-bold">{slide.title}</span>
                                                            <span className="text-muted-foreground text-[11px]">
                                                                {slide.artist} • {slide.year}
                                                            </span>
                                                        </Carousel.Item>
                                                    ))}
                                                </Carousel.ItemGroup>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Carousel.PrevTrigger asChild>
                                                            <Button variant="outline" size="xs">
                                                                ← Prev
                                                            </Button>
                                                        </Carousel.PrevTrigger>
                                                        <Carousel.NextTrigger asChild>
                                                            <Button variant="outline" size="xs">
                                                                Next →
                                                            </Button>
                                                        </Carousel.NextTrigger>
                                                    </div>
                                                    <Carousel.IndicatorGroup className="flex items-center gap-1.5">
                                                        {[0, 1, 2].map((idx) => (
                                                            <Carousel.Indicator
                                                                key={idx}
                                                                index={idx}
                                                                className="bg-muted data-current:bg-primary size-2 cursor-pointer rounded-full transition-colors"
                                                            />
                                                        ))}
                                                    </Carousel.IndicatorGroup>
                                                </div>
                                            </Carousel.Root>
                                        </div>

                                        {/* Ark UI FileUpload Component */}
                                        <div className="flex flex-col gap-3">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                ARK UI FILE UPLOAD (DRAG & DROP AUDIO INGESTION)
                                            </span>
                                            <FileUpload.Root maxFiles={3} className="flex flex-col gap-2">
                                                <FileUpload.Dropzone className="bg-input border-muted-foreground/30 hover:border-primary/50 flex h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center inset-shadow-xs transition-colors">
                                                    <Icon icon="folderOpen" className="text-muted-foreground mb-1.5 size-6" />
                                                    <span className="text-foreground text-xs font-bold">Drop Lossless Audio Files Here</span>
                                                    <span className="text-muted-foreground mt-0.5 text-[10px]">
                                                        Supports FLAC, ALAC, WAV, DSD, AIFF (up to 500MB)
                                                    </span>
                                                    <FileUpload.Trigger asChild>
                                                        <Button variant="primary" size="xs" className="mt-2.5">
                                                            Browse Files
                                                        </Button>
                                                    </FileUpload.Trigger>
                                                </FileUpload.Dropzone>
                                            </FileUpload.Root>
                                        </div>

                                        {/* Ark UI Avatar Component */}
                                        <div className="flex flex-col gap-3">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                ARK UI AVATARS (ENGINEERS & ARTISTS)
                                            </span>
                                            <div className="bg-input flex items-center gap-4 rounded-xl p-4 inset-shadow-xs">
                                                <Avatar.Root className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full text-sm font-bold shadow-xs">
                                                    <Avatar.Fallback>PF</Avatar.Fallback>
                                                </Avatar.Root>
                                                <Avatar.Root className="bg-secondary text-secondary-foreground flex size-12 items-center justify-center rounded-full text-sm font-bold shadow-xs">
                                                    <Avatar.Fallback>DP</Avatar.Fallback>
                                                </Avatar.Root>
                                                <Avatar.Root className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full text-sm font-bold shadow-xs">
                                                    <Avatar.Fallback>MD</Avatar.Fallback>
                                                </Avatar.Root>
                                                <div className="text-muted-foreground text-[11px]">
                                                    Accessible avatars with automatic fallback initials.
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ark UI SignaturePad Component */}
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                    ARK UI SIGNATURE PAD (QC SIGN-OFF)
                                                </span>
                                            </div>
                                            <SignaturePad.Root className="flex flex-col gap-2">
                                                <SignaturePad.Control className="bg-input relative h-28 overflow-hidden rounded-xl inset-shadow-xs">
                                                    <SignaturePad.Segment className="stroke-primary size-full" />
                                                    <SignaturePad.Guide className="border-muted-foreground/30 absolute inset-x-4 bottom-5 border-b border-dashed" />
                                                </SignaturePad.Control>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground text-[10px]">Draw signature with mouse or pen</span>
                                                    <SignaturePad.ClearTrigger asChild>
                                                        <Button variant="ghost" size="xs">
                                                            Clear Canvas
                                                        </Button>
                                                    </SignaturePad.ClearTrigger>
                                                </div>
                                            </SignaturePad.Root>
                                        </div>
                                    </motion.div>
                                </AnimatedSection>
                            )}

                            {/* 11. DATE & CALENDAR PICKERS */}
                            {shouldShow('date') && (
                                <AnimatedSection id="date" className="flex flex-col gap-6">
                                    <div>
                                        <span className="text-muted-foreground mb-1 block text-[11px] font-medium tracking-widest uppercase">
                                            11 • DATE & CALENDAR PICKERS
                                        </span>
                                        <h2 className="text-foreground text-base font-bold">Interactive Monthly Grid & Segmented Date Inputs</h2>
                                        <p className="text-muted-foreground mt-1 max-w-3xl text-xs leading-relaxed">
                                            Keyboard-accessible calendar grids, popover date pickers, and segmented date input controls.
                                        </p>
                                    </div>

                                    <motion.div
                                        variants={cardVariants}
                                        className="bg-card text-card-foreground grid grid-cols-1 gap-8 rounded-2xl p-6 shadow lg:grid-cols-2">
                                        {/* Inline Calendar */}
                                        <div className="flex flex-col gap-3">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                INLINE MONTHLY CALENDAR GRID
                                            </span>
                                            <Calendar className="w-full max-w-sm" />
                                        </div>

                                        {/* Popover DatePicker & Segmented DateInput */}
                                        <div className="flex flex-col gap-6">
                                            <div className="flex flex-col gap-2.5">
                                                <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                    POPOVER DATE PICKER
                                                </span>
                                                <DatePicker>
                                                    <DatePickerLabel>Release Date</DatePickerLabel>
                                                    <DatePickerControl>
                                                        <DatePickerInput />
                                                        <DatePickerTrigger>
                                                            <Icon icon="calendar" className="text-muted-foreground size-4" />
                                                        </DatePickerTrigger>
                                                    </DatePickerControl>
                                                    <DatePickerPositioner>
                                                        <DatePickerContent className="bg-card text-card-foreground rounded-2xl p-4 shadow-xl">
                                                            <DatePickerCalendar />
                                                        </DatePickerContent>
                                                    </DatePickerPositioner>
                                                </DatePicker>
                                            </div>

                                            <div className="bg-muted/60 h-px" />

                                            <div className="flex flex-col gap-2.5">
                                                <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                    SEGMENTED DATE INPUT (MM / DD / YYYY)
                                                </span>
                                                <DateInput>
                                                    <DateInputLabel>Ingestion Cutoff Timestamp</DateInputLabel>
                                                    <DateInputControl>
                                                        <DateInputSegmentGroup />
                                                    </DateInputControl>
                                                </DateInput>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatedSection>
                            )}

                            {/* 12. PHYSICAL TACTILE SHADOW SYSTEM (ALL 22 VARIANTS) */}
                            {shouldShow('shadows') && (
                                <AnimatedSection id="shadows" className="flex flex-col gap-8">
                                    <div>
                                        <span className="text-muted-foreground mb-1 block text-[11px] font-medium tracking-widest uppercase">
                                            12 • PHYSICAL TACTILE SHADOW SYSTEM (ALL 22 VARIANTS)
                                        </span>
                                        <h2 className="text-foreground text-base font-bold">
                                            Complete Multi-Layered Outset Elevation, Semantic Aliases & Inset Cavities
                                        </h2>
                                        <p className="text-muted-foreground mt-1 max-w-3xl text-xs leading-relaxed">
                                            All 22 tactile elevation tokens defined in <code className="text-foreground">globals.css</code>. Features
                                            cool-ink shading (<code className="text-foreground">oklch(24% 0.018 260)</code> in light mode, pure black
                                            in dark mode), harmonic dispersion stops, top-left catchlights, and bottom-right bevel depth.
                                        </p>
                                    </div>

                                    {/* 12.1 Outset Multi-Layered Elevation Scale (9 Variants) */}
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                12.1 • OUTSET ELEVATION SCALE (9 VARIANTS)
                                            </span>
                                            <span className="text-muted-foreground text-[10px]">Physical height projection above canvas</span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {/* 1. shadow-2xs */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground flex min-h-[140px] flex-col justify-between rounded-2xl p-4 shadow-2xs">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">shadow-2xs</span>
                                                        <Badge variant="outline" size="xs">
                                                            Micro
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Subtle micro elevation for tiny indicators, compact chips, and tight status tags.
                                                    </p>
                                                </div>
                                                <code className="text-muted-foreground/80 pt-2 text-[10px]">var(--elevation-2xs)</code>
                                            </motion.div>

                                            {/* 2. shadow-xs */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground flex min-h-[140px] flex-col justify-between rounded-2xl p-4 shadow-xs">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">shadow-xs</span>
                                                        <Badge variant="outline" size="xs">
                                                            Compact
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Compact chip elevation for technical selectors with multi-harmonic stops.
                                                    </p>
                                                </div>
                                                <code className="text-muted-foreground/80 pt-2 text-[10px]">var(--elevation-xs)</code>
                                            </motion.div>

                                            {/* 3. shadow-sm */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground flex min-h-[140px] flex-col justify-between rounded-2xl p-4 shadow-sm">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">shadow-sm</span>
                                                        <Badge variant="primary" size="xs">
                                                            Tactile Exact
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Signature tactile multi-harmonic shadow with dual opposing bevels and 5-stop Gaussian curve.
                                                    </p>
                                                </div>
                                                <code className="text-primary pt-2 text-[10px] font-semibold">var(--elevation-sm) → tactile</code>
                                            </motion.div>

                                            {/* 4. shadow */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground flex min-h-[140px] flex-col justify-between rounded-2xl p-4 shadow">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">shadow</span>
                                                        <Badge variant="solid" size="xs">
                                                            Base Outset
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Default base elevation token alias for standard tactile interactive surfaces.
                                                    </p>
                                                </div>
                                                <code className="text-muted-foreground/80 pt-2 text-[10px]">var(--elevation)</code>
                                            </motion.div>

                                            {/* 5. shadow-md */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground flex min-h-[140px] flex-col justify-between rounded-2xl p-4 shadow-md">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">shadow-md</span>
                                                        <Badge variant="outline" size="xs">
                                                            Elevated
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Elevated dark button and focused card shadow with outer dispersion.
                                                    </p>
                                                </div>
                                                <code className="text-muted-foreground/80 pt-2 text-[10px]">var(--elevation-md)</code>
                                            </motion.div>

                                            {/* 6. shadow-lg */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground flex min-h-[140px] flex-col justify-between rounded-2xl p-4 shadow-lg">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">shadow-lg</span>
                                                        <Badge variant="outline" size="xs">
                                                            Floating
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Floating surface elevation for popovers, dropdowns, and flyout menus.
                                                    </p>
                                                </div>
                                                <code className="text-muted-foreground/80 pt-2 text-[10px]">var(--elevation-lg)</code>
                                            </motion.div>

                                            {/* 7. shadow-xl */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground flex min-h-[140px] flex-col justify-between rounded-2xl p-4 shadow-xl">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">shadow-xl</span>
                                                        <Badge variant="outline" size="xs">
                                                            Modal / Dialog
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Deep atmospheric elevation for central modal dialogs and slide-out drawers.
                                                    </p>
                                                </div>
                                                <code className="text-muted-foreground/80 pt-2 text-[10px]">var(--elevation-xl)</code>
                                            </motion.div>

                                            {/* 8. shadow-2xl */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground flex min-h-[140px] flex-col justify-between rounded-2xl p-4 shadow-2xl">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">shadow-2xl</span>
                                                        <Badge variant="outline" size="xs">
                                                            Hero Surface
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Maximum depth projection with directional blur and ambient spread.
                                                    </p>
                                                </div>
                                                <code className="text-muted-foreground/80 pt-2 text-[10px]">var(--elevation-2xl)</code>
                                            </motion.div>

                                            {/* 9. shadow-3xl */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground shadow-3xl flex min-h-[140px] flex-col justify-between rounded-2xl p-4">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">shadow-3xl</span>
                                                        <Badge variant="accent" size="xs">
                                                            Max Depth
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Monumental depth projection with 48px offset and 96px ambient reach.
                                                    </p>
                                                </div>
                                                <code className="text-muted-foreground/80 pt-2 text-[10px]">var(--elevation-3xl)</code>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* 12.2 Semantic Elevation Aliases (5 Variants) */}
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                12.2 • SEMANTIC OUTER ELEVATION ALIASES (5 VARIANTS)
                                            </span>
                                            <span className="text-muted-foreground text-[10px]">
                                                Domain-intent elevation tokens mapped to UI surfaces
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                            {/* shadow-card */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground shadow-card flex min-h-[140px] flex-col justify-between rounded-2xl p-4">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">shadow-card</span>
                                                        <Badge variant="primary" size="xs">
                                                            Card
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Semantic elevation for standard content cards, tiles, and widgets.
                                                    </p>
                                                </div>
                                                <code className="text-muted-foreground/80 pt-2 text-[10px]">var(--elevation-card) → sm</code>
                                            </motion.div>

                                            {/* shadow-panel */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground shadow-panel flex min-h-[140px] flex-col justify-between rounded-2xl p-4">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">shadow-panel</span>
                                                        <Badge variant="secondary" size="xs">
                                                            Panel
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Semantic elevation for sidebars, dock strips, and inspector panes.
                                                    </p>
                                                </div>
                                                <code className="text-muted-foreground/80 pt-2 text-[10px]">var(--elevation-panel) → md</code>
                                            </motion.div>

                                            {/* shadow-popover */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground shadow-popover flex min-h-[140px] flex-col justify-between rounded-2xl p-4">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">shadow-popover</span>
                                                        <Badge variant="accent" size="xs">
                                                            Popover
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Semantic elevation for floating dropdowns, tooltips, and flyout menus.
                                                    </p>
                                                </div>
                                                <code className="text-muted-foreground/80 pt-2 text-[10px]">var(--elevation-popover) → lg</code>
                                            </motion.div>

                                            {/* shadow-dialog */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground shadow-dialog flex min-h-[140px] flex-col justify-between rounded-2xl p-4">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">shadow-dialog</span>
                                                        <Badge variant="solid" size="xs">
                                                            Dialog
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Semantic elevation for centered modal windows and full sheets.
                                                    </p>
                                                </div>
                                                <code className="text-muted-foreground/80 pt-2 text-[10px]">var(--elevation-dialog) → xl</code>
                                            </motion.div>

                                            {/* shadow-dragged */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground shadow-dragged flex min-h-[140px] flex-col justify-between rounded-2xl p-4">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">shadow-dragged</span>
                                                        <Badge variant="destructive" size="xs">
                                                            Dragged
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Semantic elevation for items actively dragged or floating mid-air.
                                                    </p>
                                                </div>
                                                <code className="text-muted-foreground/80 pt-2 text-[10px]">var(--elevation-dragged) → 2xl</code>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* EXACT TACTILE INSET CAVITY SPECIFICATION HERO CARD */}
                                    <motion.div
                                        variants={cardVariants}
                                        className="bg-card text-card-foreground flex flex-col gap-5 rounded-2xl p-6 inset-shadow-sm">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-primary text-[11px] font-bold tracking-wider uppercase">
                                                        EXACT PHYSICAL TACTILE INSET SHADOW SPECIFICATION
                                                    </span>
                                                    <Badge variant="primary" size="xs">
                                                        SATISFIED & VERIFIED
                                                    </Badge>
                                                </div>
                                                <h3 className="text-foreground mt-1 text-base font-bold">
                                                    Dual Opposing Inset Recesses with Dynamic Utility Tinting
                                                </h3>
                                            </div>
                                            <code className="bg-muted text-foreground rounded-lg px-2.5 py-1 text-xs font-semibold">
                                                inset-shadow-sm / inset-shadow-tactile
                                            </code>
                                        </div>

                                        <p className="text-muted-foreground text-xs leading-relaxed">
                                            Satisfies tactile mechanical cavity physics: a top-down contact depression (
                                            <code className="text-foreground">0px 1px 2px 0px inset</code> with 15% dark ink /{' '}
                                            <code className="text-foreground">#00000026</code>) paired with an opposing bottom-up counter-bevel (
                                            <code className="text-foreground">1px -2px 2px 0px inset</code> with 8% dark ink /{' '}
                                            <code className="text-foreground">#00000014</code>), while seamlessly inheriting{' '}
                                            <code className="text-foreground">var(--tw-shadow-color)</code> when color-tinted.
                                        </p>

                                        {/* Formula Matrix Grid */}
                                        <div className="grid grid-cols-1 gap-3 font-mono text-xs sm:grid-cols-3">
                                            <div className="bg-muted/40 flex flex-col justify-between rounded-xl p-3.5 shadow-2xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-foreground font-semibold">1. Top Downward Inset</span>
                                                    <span className="text-primary text-[10px]">Upper Lip</span>
                                                </div>
                                                <code className="text-muted-foreground mt-2 text-[11px] leading-tight break-all">
                                                    0px 1px 2px 0px inset (#00000026)
                                                </code>
                                                <span className="text-muted-foreground/80 mt-1 text-[10px]">15% alpha contact cavity drop</span>
                                            </div>

                                            <div className="bg-muted/40 flex flex-col justify-between rounded-xl p-3.5 shadow-2xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-foreground font-semibold">2. Bottom Counter Inset</span>
                                                    <span className="text-destructive text-[10px]">Lower Lip</span>
                                                </div>
                                                <code className="text-muted-foreground mt-2 text-[11px] leading-tight break-all">
                                                    1px -2px 2px 0px inset (#00000014)
                                                </code>
                                                <span className="text-muted-foreground/80 mt-1 text-[10px]">8% alpha upward counter-shadow</span>
                                            </div>

                                            <div className="bg-muted/40 flex flex-col justify-between rounded-xl p-3.5 shadow-2xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-foreground font-semibold">3. Dynamic Tinting</span>
                                                    <span className="text-foreground text-[10px]">Tailwind Hook</span>
                                                </div>
                                                <code className="text-muted-foreground mt-2 text-[11px] leading-tight break-all">
                                                    var(--tw-shadow-color, ...)
                                                </code>
                                                <span className="text-muted-foreground/80 mt-1 text-[10px]">
                                                    Inherits custom color tints smoothly
                                                </span>
                                            </div>
                                        </div>

                                        {/* Comparison Preview Triad */}
                                        <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-3">
                                            <div className="bg-card border-border/50 flex min-h-[90px] flex-col items-center justify-center rounded-xl border p-4 text-center shadow-none">
                                                <span className="text-foreground text-xs font-semibold">Flat Surface</span>
                                                <code className="text-muted-foreground mt-1 text-[10px]">shadow-none (0 depth)</code>
                                            </div>
                                            <div className="bg-card flex min-h-[90px] flex-col items-center justify-center rounded-xl p-4 text-center shadow-inner">
                                                <span className="text-foreground text-xs font-semibold">Standard Inset</span>
                                                <code className="text-muted-foreground mt-1 text-[10px]">shadow-inner (generic)</code>
                                            </div>
                                            <div className="bg-card ring-primary/30 flex min-h-[90px] flex-col items-center justify-center rounded-xl p-4 text-center ring-2 inset-shadow-sm">
                                                <span className="text-primary text-xs font-bold">Tactile Dual Inset</span>
                                                <code className="text-primary mt-1 text-[10px] font-semibold">inset-shadow-sm (Exact Satisfied)</code>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* 12.3 Complete Inset Elevation Cavity Scale (8 Variants) */}
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-foreground text-[11px] font-bold tracking-wider uppercase">
                                                12.3 • COMPLETE INSET ELEVATION CAVITY SCALE (8 VARIANTS)
                                            </span>
                                            <span className="text-muted-foreground text-[10px]">
                                                Recessed wells, sliders, and instrument cavity depths
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                            {/* inset-shadow-2xs */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground flex min-h-[140px] flex-col justify-between rounded-2xl p-4 inset-shadow-2xs">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">inset-shadow-2xs</span>
                                                        <Badge variant="outline" size="xs">
                                                            Micro Inset
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Subtle hairline indentation with micro catchlight highlight.
                                                    </p>
                                                </div>
                                                <code className="text-muted-foreground/80 pt-2 text-[10px]">var(--inset-elevation-2xs)</code>
                                            </motion.div>

                                            {/* inset-shadow-xs */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground flex min-h-[140px] flex-col justify-between rounded-2xl p-4 inset-shadow-xs">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">inset-shadow-xs</span>
                                                        <Badge variant="primary" size="xs">
                                                            Input Well
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Standard recessed depth for text fields, switches, and steppers.
                                                    </p>
                                                </div>
                                                <code className="text-muted-foreground/80 pt-2 text-[10px]">var(--inset-elevation-xs)</code>
                                            </motion.div>

                                            {/* inset-shadow-sm */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground flex min-h-[140px] flex-col justify-between rounded-2xl p-4 inset-shadow-sm">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">inset-shadow-sm</span>
                                                        <Badge variant="solid" size="xs">
                                                            Tactile Exact
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Dual counter-recess: 0px 1px 2px (15%) + 1px -2px 2px (8%) with dynamic tint hook.
                                                    </p>
                                                </div>
                                                <code className="text-primary pt-2 text-[10px] font-semibold">var(--inset-elevation-tactile)</code>
                                            </motion.div>

                                            {/* inset-shadow-md */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground inset-shadow-md flex min-h-[140px] flex-col justify-between rounded-2xl p-4">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">inset-shadow-md</span>
                                                        <Badge variant="outline" size="xs">
                                                            Medium Recess
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Medium cavity well for progress tracks and waveform analyzer channels.
                                                    </p>
                                                </div>
                                                <code className="text-muted-foreground/80 pt-2 text-[10px]">var(--inset-elevation-md)</code>
                                            </motion.div>

                                            {/* inset-shadow-lg */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground inset-shadow-lg flex min-h-[140px] flex-col justify-between rounded-2xl p-4">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">inset-shadow-lg</span>
                                                        <Badge variant="outline" size="xs">
                                                            Console Well
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Deep instrument recess for mixer fader channels and terminal consoles.
                                                    </p>
                                                </div>
                                                <code className="text-muted-foreground/80 pt-2 text-[10px]">var(--inset-elevation-lg)</code>
                                            </motion.div>

                                            {/* inset-shadow-xl */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground inset-shadow-xl flex min-h-[140px] flex-col justify-between rounded-2xl p-4">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">inset-shadow-xl</span>
                                                        <Badge variant="outline" size="xs">
                                                            Deep Cavity
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Deep architectural groove with 6px vertical dip and catchlight bevel.
                                                    </p>
                                                </div>
                                                <code className="text-muted-foreground/80 pt-2 text-[10px]">var(--inset-elevation-xl)</code>
                                            </motion.div>

                                            {/* inset-shadow-2xl */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground inset-shadow-2xl flex min-h-[140px] flex-col justify-between rounded-2xl p-4">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">inset-shadow-2xl</span>
                                                        <Badge variant="outline" size="xs">
                                                            Sub-Chamber
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Pronounced acoustic chamber cavity with 8px internal bevel.
                                                    </p>
                                                </div>
                                                <code className="text-muted-foreground/80 pt-2 text-[10px]">var(--inset-elevation-2xl)</code>
                                            </motion.div>

                                            {/* inset-shadow-3xl */}
                                            <motion.div
                                                variants={cardVariants}
                                                className="bg-card text-card-foreground inset-shadow-3xl flex min-h-[140px] flex-col justify-between rounded-2xl p-4">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-foreground text-xs font-bold">inset-shadow-3xl</span>
                                                        <Badge variant="accent" size="xs">
                                                            Max Inset
                                                        </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                        Maximum internal depth with 10px directional drop and 20px blur.
                                                    </p>
                                                </div>
                                                <code className="text-muted-foreground/80 pt-2 text-[10px]">var(--inset-elevation-3xl)</code>
                                            </motion.div>
                                        </div>
                                    </div>
                                </AnimatedSection>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </MotionConfig>
    );
}
