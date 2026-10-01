'use client';

import { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { goeyToast } from 'goey-toast';
import { Controller, useForm, useWatch } from 'react-hook-form';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { CheckboxControl, CheckboxHiddenInput, CheckboxLabel, CheckboxRoot } from '@/components/ui/checkbox';
import { Dialog, DialogCloseTrigger, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldErrorText, FieldHelperText, FieldInput, FieldLabel } from '@/components/ui/field';
import Icon from '@/components/ui/Icon';
import { RadioGroup, RadioGroupItem, RadioGroupItemControl, RadioGroupItemText, RadioGroupLabel } from '@/components/ui/radio-group';
import cn from '@/lib/cn';
import type { ApiError, ApiErrorDetail, ApiFieldError, ApiSuccess } from '@/types/api';

import { type ScanMode, type ScanRequestInput, scanRequestSchema } from '../schemas/scan-request.schema';
import { useScanModalStore } from '../stores/scan-modal.store';
import type { ScanResponseData } from '../types';

export interface ScanModalProps {
    /** Callback when a scan job has been queued/initiated successfully. */
    onScanSuccess?: (data: ScanResponseData) => void;
}

const scanModes = [
    {
        value: 'addNew' as const,
        label: 'Just add new songs',
        badge: 'Fast',
        description: 'Quickly detects and ingests newly added files without re-reading existing audio tracks.',
    },
    {
        value: 'forceAll' as const,
        label: 'Force rescan all songs',
        badge: 'Deep Rebuild',
        description: 'Completely re-indexes and regenerates tags, album covers, and audio fingerprints for every track.',
    },
    {
        value: 'rescanErrors' as const,
        label: 'Rescan files with error',
        badge: 'Targeted Fix',
        description: 'Retries previously failed files that encountered corrupt headers or encoding issues.',
    },
];

export function ScanModal({ onScanSuccess }: ScanModalProps = {}) {
    const { isModalOpen, setModalOpen, closeModal } = useScanModalStore();

    const {
        register,
        handleSubmit,
        control,
        reset,
        setError,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(scanRequestSchema),
        defaultValues: {
            directory: '',
            scanMode: 'addNew',
            recursive: true,
        },
    });

    const recursiveValue = useWatch({ control, name: 'recursive' });

    // Clear server errors whenever the modal opens or closes
    useEffect(() => {
        if (!isModalOpen) {
            clearErrors();
        }
    }, [isModalOpen, clearErrors]);

    /**
     * Map server-side error responses (including field validation errors and root errors)
     * directly into React Hook Form via setError.
     */
    const handleApiError = (errorDetail: ApiErrorDetail) => {
        const { message, details, code } = errorDetail;

        // 1. Process field-level validation errors returned by the server
        if (Array.isArray(details) && details.length > 0) {
            for (const item of details) {
                if (typeof item === 'object' && item !== null && 'message' in item) {
                    const fieldError = item as ApiFieldError;
                    const fieldName = fieldError.field;
                    const fieldMessage = fieldError.message;

                    if (fieldName === 'directory' || fieldName === 'scanMode' || fieldName === 'recursive') {
                        setError(fieldName, {
                            type: 'server',
                            message: fieldMessage,
                        });
                    } else if (fieldName === 'root') {
                        setError('root.serverError', {
                            type: 'server',
                            message: fieldMessage,
                        });
                    }
                }
            }
        }

        // 2. Set root level server error
        const rootMessage = message || (code ? `Server error: ${code}` : 'An unexpected server error occurred.');
        setError('root.serverError', {
            type: 'server',
            message: rootMessage,
        });

        goeyToast.error('Scan Request Failed', { description: rootMessage });
    };

    const onSubmit = async (values: ScanRequestInput) => {
        clearErrors();

        try {
            const response = await axios.post<ApiSuccess<ScanResponseData>>('/api/scan', values);
            const { success, message, data } = response.data;

            if (success) {
                goeyToast.success('Library Scan Started', {
                    description: `Job ID: ${data.scanId} • Mode: ${data.scanMode}`,
                });

                if (onScanSuccess) {
                    onScanSuccess(data);
                }

                // Close modal and reset form
                setModalOpen(false);
                reset();
                return;
            } else {
                // Handle unexpected success=false responses
                const fallbackMessage = message || 'Scan request failed without a specific error message.';
                setError('root.serverError', {
                    type: 'server',
                    message: fallbackMessage,
                });
                goeyToast.error('Scan Request Failed', { description: fallbackMessage });
            }
        } catch (error) {
            if (axios.isAxiosError<ApiError>(error) && error.response?.data) {
                const apiError = error.response.data;
                if (apiError.error) {
                    handleApiError(apiError.error);
                    return;
                }
            }

            // General or network error
            const fallbackMessage = error instanceof Error ? error.message : 'Failed to connect to scan service';
            setError('root.serverError', {
                type: 'server',
                message: fallbackMessage,
            });
            goeyToast.error('Scan Request Error', { description: fallbackMessage });
        }
    };

    const rootServerErrorMessage = errors.root?.serverError?.message || errors.root?.message;

    return (
        <Dialog open={isModalOpen} onOpenChange={(details) => setModalOpen(details.open)}>
            <DialogContent className="max-w-xl">
                <DialogCloseTrigger />

                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-2xl shadow-xs">
                        <Icon icon="refresh" className="size-6" />
                    </div>
                    <div>
                        <DialogTitle>Scan Music Library</DialogTitle>
                        <DialogDescription>Configure local directory indexation, metadata extraction, and audio cataloging.</DialogDescription>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
                    {/* Root Level Server Error Alert */}
                    {rootServerErrorMessage && (
                        <div
                            role="alert"
                            className="bg-destructive/10 border-destructive/25 text-destructive motion-preset-fade motion-duration-200 flex items-start gap-2.5 rounded-xl border p-3 text-xs font-medium">
                            <Icon icon="alert" className="mt-0.5 size-4 shrink-0" />
                            <div className="flex-1 leading-relaxed">{rootServerErrorMessage}</div>
                        </div>
                    )}
                    {/* Directory Input */}
                    <Field invalid={Boolean(errors.directory)} required disabled={isSubmitting}>
                        <FieldLabel>Directory Path</FieldLabel>
                        <div className="relative flex items-center">
                            <div className="text-muted-foreground pointer-events-none absolute left-3 flex items-center justify-center">
                                <Icon icon="folder" className="size-4" />
                            </div>
                            <FieldInput {...register('directory')} placeholder="e.g. D:/Music or /home/user/music" className="pl-10" />
                        </div>
                        <FieldErrorText>{errors.directory?.message}</FieldErrorText>
                        <FieldHelperText>Absolute path to audio folder on your system</FieldHelperText>
                    </Field>

                    {/* Scan Mode Options */}
                    <Field invalid={Boolean(errors.scanMode)}>
                        <Controller
                            name="scanMode"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup value={field.value} onValueChange={(details) => field.onChange(details.value as ScanMode)}>
                                    <RadioGroupLabel>Scan Mode</RadioGroupLabel>
                                    <div className="grid grid-cols-1 gap-2.5">
                                        {scanModes.map((item) => (
                                            <RadioGroupItem
                                                key={item.value}
                                                value={item.value}
                                                cardStyle
                                                className="hover:border-primary/50 transition-colors">
                                                <RadioGroupItemControl />
                                                <div className="flex flex-1 flex-col">
                                                    <div className="flex items-center justify-between">
                                                        <RadioGroupItemText className="font-semibold">{item.label}</RadioGroupItemText>
                                                        <Badge size="xs" variant={item.value === field.value ? 'solid' : 'outline'}>
                                                            {item.badge}
                                                        </Badge>
                                                    </div>
                                                    <span className="text-muted-foreground mt-0.5 text-xs leading-relaxed">{item.description}</span>
                                                </div>
                                            </RadioGroupItem>
                                        ))}
                                    </div>
                                </RadioGroup>
                            )}
                        />
                        <FieldErrorText>{errors.scanMode?.message}</FieldErrorText>
                    </Field>

                    <hr />

                    {/* Recursive Scan Toggle using Ark UI Checkbox */}
                    <Field invalid={Boolean(errors.recursive)}>
                        <CheckboxRoot
                            defaultChecked
                            disabled={isSubmitting}
                            className={cn(
                                'hover:border-primary/50 flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all',
                                errors.recursive && 'border-destructive/60 bg-destructive/5',
                                recursiveValue ? 'border-primary/40 bg-primary/5' : 'bg-card'
                            )}>
                            <CheckboxHiddenInput {...register('recursive')} />
                            <div className="flex items-center gap-3">
                                <CheckboxControl />
                                <div>
                                    <CheckboxLabel>Scan Recursively</CheckboxLabel>
                                    <p className="text-muted-foreground text-xs">Search through subdirectories and nested album folders</p>
                                </div>
                            </div>
                        </CheckboxRoot>
                        <FieldErrorText>{errors.recursive?.message}</FieldErrorText>
                    </Field>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Button type="button" variant="ghost" size="sm" disabled={isSubmitting} onClick={() => closeModal()}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={isSubmitting}>
                            <Icon icon={isSubmitting ? 'loading' : 'play'} className="size-4" />
                            {isSubmitting ? 'Starting Scan...' : 'Start Library Scan'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default ScanModal;
