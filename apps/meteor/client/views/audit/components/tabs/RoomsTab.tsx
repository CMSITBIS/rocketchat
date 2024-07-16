import type { IRoom } from '@rocket.chat/core-typings';
import { Field, FieldLabel, FieldRow, FieldError, Icon } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useController } from 'react-hook-form';

import RoomAutoComplete from '../../../../components/RoomAutoComplete';
import type { AuditFields } from '../../hooks/useAuditForm';

type RoomsTabProps = {
	form: UseFormReturn<AuditFields>;
	setSelectedRoom: React.Dispatch<React.SetStateAction<IRoom | undefined>>;
};

const RoomsTab = ({ form: { control }, setSelectedRoom }: RoomsTabProps) => {
	const t = useTranslation();

	const { field: ridField, fieldState: ridFieldState } = useController({ name: 'rid', control, rules: { required: true } });

	return (
		<Field flexShrink={1}>
			<FieldLabel>{t('Channel_name')}</FieldLabel>
			<FieldRow>
				<RoomAutoComplete
					scope='admin'
					setSelectedRoom={setSelectedRoom}
					value={ridField.value}
					error={!!ridFieldState.error}
					placeholder={t('Channel_Name_Placeholder')}
					onChange={ridField.onChange}
					renderRoomIcon={({ encrypted }) =>
						encrypted ? <Icon name='key' color='danger' title={t('Encrypted_content_will_not_appear_search')} /> : null
					}
				/>
			</FieldRow>
			{ridFieldState.error?.type === 'required' && <FieldError>{t('The_field_is_required', t('Channel_name'))}</FieldError>}
			{ridFieldState.error?.type === 'validate' && <FieldError>{ridFieldState.error.message}</FieldError>}
		</Field>
	);
};

export default RoomsTab;
