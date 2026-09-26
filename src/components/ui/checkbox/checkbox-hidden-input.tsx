'use client';

import { Checkbox as ArkCheckbox } from '@ark-ui/react/checkbox';

export type CheckboxHiddenInputProps = ArkCheckbox.HiddenInputProps;

export function CheckboxHiddenInput(props: CheckboxHiddenInputProps) {
    return <ArkCheckbox.HiddenInput {...props} />;
}

export default CheckboxHiddenInput;
