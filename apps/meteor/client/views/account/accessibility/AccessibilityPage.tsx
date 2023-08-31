import type { SelectOption } from '@rocket.chat/fuselage';
import {
	Accordion,
	Box,
	Button,
	ButtonGroup,
	Field,
	FieldGroup,
	FieldHint,
	FieldLabel,
	FieldRow,
	RadioButton,
	Select,
	Tag,
	ToggleSwitch,
} from '@rocket.chat/fuselage';
import { useLocalStorage, useUniqueId } from '@rocket.chat/fuselage-hooks';
import { useSetModal, useTranslation, useToastMessageDispatch, useEndpoint, useSetting } from '@rocket.chat/ui-contexts';
import { useMutation } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import Page from '../../../components/Page';
import { useIsEnterprise } from '../../../hooks/useIsEnterprise';
import { getDirtyFields } from '../../../lib/getDirtyFields';
import HighContrastUpsellModal from './HighContrastUpsellModal';
import { fontSizes } from './fontSizes';
import type { AccessibilityPreferencesData } from './hooks/useAcessibilityPreferencesValues';
import { useAccessiblityPreferencesValues } from './hooks/useAcessibilityPreferencesValues';
import { useCreateFontStyleElement } from './hooks/useCreateFontStyleElement';
import { themeItems as themes } from './themeItems';

const AccessibilityPage = () => {
	const t = useTranslation();
	const setModal = useSetModal();
	const dispatchToastMessage = useToastMessageDispatch();
	const { data: license } = useIsEnterprise();
	const preferencesValues = useAccessiblityPreferencesValues();

	const { themeAppearence } = preferencesValues;
	const [, setPrevTheme] = useLocalStorage('prevTheme', themeAppearence);
	const createFontStyleElement = useCreateFontStyleElement();
	const displayRolesEnabled = useSetting('UI_DisplayRoles');

	const timeFormatOptions = useMemo(
		(): SelectOption[] => [
			['0', t('Default')],
			['1', t('12_Hour')],
			['2', t('24_Hour')],
		],
		[t],
	);

	const fontSizeId = useUniqueId();
	const clockModeId = useUniqueId();
	const hideUsernamesId = useUniqueId();
	const hideRolesId = useUniqueId();

	const {
		formState: { isDirty, dirtyFields },
		handleSubmit,
		control,
		reset,
		watch,
	} = useForm({
		defaultValues: preferencesValues,
	});

	const currentData = watch();

	const setUserPreferencesEndpoint = useEndpoint('POST', '/v1/users.setPreferences');

	const setPreferencesAction = useMutation({
		mutationFn: setUserPreferencesEndpoint,
		onSuccess: () => dispatchToastMessage({ type: 'success', message: t('Preferences_saved') }),
		onError: (error) => dispatchToastMessage({ type: 'error', message: error }),
		onSettled: (_data, _error, { data: { fontSize } }) => {
			reset(currentData);
			dirtyFields.themeAppearence && setPrevTheme(themeAppearence);
			dirtyFields.fontSize && fontSize && createFontStyleElement(fontSize);
		},
	});

	const handleSaveData = (formData: AccessibilityPreferencesData) => {
		const data = getDirtyFields(formData, dirtyFields);
		setPreferencesAction.mutateAsync({ data });
	};

	return (
		<Page>
			<Page.Header title={t('Accessibility_and_Appearance')} />
			<Page.ScrollableContentWithShadow>
				<Box maxWidth='x600' w='full' alignSelf='center' mb={40} mi={36}>
					<Box fontScale='p1' mbe={24}>
						<Box pb={16}>{t('Accessibility_activation')}</Box>
					</Box>
					<Accordion>
						<Accordion.Item defaultExpanded={true} title={t('Theme')}>
							{themes.map(({ id, title, description, ...item }, index) => {
								const communityDisabled = 'isEEOnly' in item && item.isEEOnly && !license?.isEnterprise;

								return (
									<Field key={id} pbe={themes.length - 1 ? undefined : 'x28'} pbs={index === 0 ? undefined : 'x28'}>
										<Box display='flex' flexDirection='row' justifyContent='spaceBetween' flexGrow={1}>
											<FieldLabel display='flex' alignItems='center' fontScale='p2b' htmlFor={id}>
												{t.has(title) ? t(title) : title}
												{communityDisabled && (
													<Box is='span' mis={8}>
														<Tag variant='featured'>{t('Enterprise')}</Tag>
													</Box>
												)}
											</FieldLabel>
											<FieldRow>
												<Controller
													control={control}
													name='themeAppearence'
													render={({ field: { onChange, value, ref } }) => {
														if (communityDisabled) {
															return (
																<RadioButton
																	id={id}
																	ref={ref}
																	onChange={() => setModal(<HighContrastUpsellModal onClose={() => setModal(null)} />)}
																	checked={false}
																/>
															);
														}
														return <RadioButton id={id} ref={ref} onChange={() => onChange(id)} checked={value === id} />;
													}}
												/>
											</FieldRow>
										</Box>
										<FieldHint mbs={12} style={{ whiteSpace: 'break-spaces' }}>
											{t.has(description) ? t(description) : description}
										</FieldHint>
									</Field>
								);
							})}
						</Accordion.Item>
						<Accordion.Item title={t('Adjustable_layout')}>
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor={fontSizeId} fontScale='p2b' mbe={12}>
										{t('Font_size')}
									</FieldLabel>
									<FieldRow>
										<Controller
											control={control}
											name='fontSize'
											render={({ field: { onChange, value } }) => (
												<Select id={fontSizeId} value={value} onChange={onChange} options={fontSizes} />
											)}
										/>
									</FieldRow>
									<Field.Description mb={12}>{t('Adjustable_font_size_description')}</Field.Description>
								</Field>
								<Field>
									<Field.Label htmlFor={clockModeId}>{t('Message_TimeFormat')}</Field.Label>
									<Field.Row>
										<Controller
											name='clockMode'
											control={control}
											render={({ field: { value, onChange } }) => (
												<Select id={clockModeId} value={`${value}`} onChange={onChange} options={timeFormatOptions} />
											)}
										/>
									</Field.Row>
								</Field>
								<Field>
									<Box display='flex' flexDirection='row' justifyContent='spaceBetween' flexGrow={1}>
										<FieldLabel htmlFor={hideUsernamesId}>{t('Hide_usernames')}</FieldLabel>
										<FieldRow>
											<Controller
												name='hideUsernames'
												control={control}
												render={({ field: { value, onChange, ref } }) => (
													<ToggleSwitch id={hideUsernamesId} ref={ref} checked={value} onChange={onChange} />
												)}
											/>
										</FieldRow>
									</Box>
								</Field>
								{displayRolesEnabled && (
									<Field>
										<Box display='flex' flexDirection='row' justifyContent='spaceBetween' flexGrow={1}>
											<FieldLabel htmlFor={hideRolesId}>{t('Hide_roles')}</FieldLabel>
											<FieldRow>
												<Controller
													name='hideRoles'
													control={control}
													render={({ field: { value, onChange, ref } }) => (
														<ToggleSwitch id={hideRolesId} ref={ref} checked={value} onChange={onChange} />
													)}
												/>
											</FieldRow>
										</Box>
									</Field>
								)}
							</FieldGroup>
						</Accordion.Item>
					</Accordion>
				</Box>
			</Page.ScrollableContentWithShadow>
			<Page.Footer isDirty={isDirty}>
				<ButtonGroup>
					<Button onClick={() => reset(preferencesValues)}>{t('Cancel')}</Button>
					<Button primary disabled={!isDirty} onClick={handleSubmit(handleSaveData)}>
						{t('Save_changes')}
					</Button>
				</ButtonGroup>
			</Page.Footer>
		</Page>
	);
};

export default AccessibilityPage;
