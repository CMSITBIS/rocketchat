import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { useUniqueId } from '@rocket.chat/fuselage-hooks';
import { FieldGroup, TextInput, Field, PasswordInput, ButtonGroup, Button, Callout } from '@rocket.chat/fuselage';
import { Form, ActionLink } from '@rocket.chat/layout';
import { useLoginWithPassword, useSetting } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import EmailConfirmationForm from './EmailConfirmationForm';
import type { DispatchLoginRouter } from './hooks/useLoginRouter';
import LoginServices from './LoginServices';

export type LoginErrors =
	| 'error-user-is-not-activated'
	| 'error-invalid-email'
	| 'error-login-blocked-for-ip'
	| 'error-login-blocked-for-user'
	| 'error-license-user-limit-reached'
	| 'user-not-found'
	| 'error-app-user-is-not-allowed-to-login';

export const LoginForm = ({ setLoginRoute }: { setLoginRoute: DispatchLoginRouter }): ReactElement => {
	const {
		register,
		handleSubmit,
		setError,
		clearErrors,
		getValues,
		formState: { errors },
	} = useForm<{
		email?: string;
		username: string;
		password: string;
	}>({
		mode: 'onChange',
	});

	const { t } = useTranslation();
	const formLabelId = useUniqueId();
	const [errorOnSubmit, setErrorOnSubmit] = useState<LoginErrors | undefined>(undefined);
	const isResetPasswordAllowed = useSetting('Accounts_PasswordReset');
	const login = useLoginWithPassword();
	const showFormLogin = useSetting('Accounts_ShowFormLogin');

	const usernameOrEmailPlaceholder = String(useSetting('Accounts_EmailOrUsernamePlaceholder'));
	const passwordPlaceholder = String(useSetting('Accounts_PasswordPlaceholder'));

	const loginMutation: UseMutationResult<
		void,
		Error,
		{
			username: string;
			password: string;
			email?: string;
		}
	> = useMutation({
		mutationFn: (formData) => {
			return login(formData.username, formData.password);
		},
		onError: (error: any) => {
			if ([error.error, error.errorType].includes('error-invalid-email')) {
				setError('email', { type: 'invalid-email', message: t('registration_page_login_errors_invalidEmail') });
			}

			if ('error' in error && error.error !== 403) {
				setErrorOnSubmit(error.error);
				return;
			}

			setErrorOnSubmit('user-not-found');
			setError('username', { type: 'user-not-found', message: t('registration_component_login_userNotFound') });
			setError('password', { type: 'user-not-found', message: t('registration_component_login_incorrectPassword') });
		},
	});

	if (errors.email?.type === 'invalid-email') {
		return <EmailConfirmationForm onBackToLogin={() => clearErrors('email')} email={getValues('email')} />;
	}

	return (
		<Form
			aria-labelledby={formLabelId}
			onSubmit={handleSubmit(async (data) => {
				if (loginMutation.isLoading) {
					return;
				}

				loginMutation.mutate(data);
			})}
		>
			<Form.Header>
				<Form.Title id={formLabelId}>{t('registration_component_login')}</Form.Title>
			</Form.Header>
			{showFormLogin && (
				<>
					<Form.Container>
						<FieldGroup disabled={loginMutation.isLoading}>
							<Field>
								<Field.Label htmlFor='username'>{t('registration_component_form_emailOrUsername')}</Field.Label>
								<Field.Row>
									<TextInput
										{...register('username', {
											required: true,
											onChange: () => {
												clearErrors(['username', 'password']);
											},
										})}
										placeholder={usernameOrEmailPlaceholder || t('registration_component_form_emailPlaceholder')}
										error={
											errors.username?.message ||
											(errors.username?.type === 'required' ? t('registration_component_form_requiredField') : undefined)
										}
										aria-invalid={errors.username ? 'true' : 'false'}
										id='username'
									/>
								</Field.Row>
								{errors.username && errors.username.type === 'required' && (
									<Field.Error>{t('registration_component_form_requiredField')}</Field.Error>
								)}
							</Field>

							<Field>
								<Field.Label htmlFor='password'>{t('registration_component_form_password')}</Field.Label>
								<Field.Row>
									<PasswordInput
										{...register('password', {
											required: true,
											onChange: () => {
												clearErrors(['username', 'password']);
											},
										})}
										placeholder={passwordPlaceholder}
										error={
											errors.password?.message ||
											(errors.password?.type === 'required' ? t('registration_component_form_requiredField') : undefined)
										}
										aria-invalid={errors.password ? 'true' : 'false'}
										id='password'
									/>
								</Field.Row>
								{errors.password && errors.password.type === 'required' && (
									<Field.Error>{t('registration_component_form_requiredField')}</Field.Error>
								)}
								{isResetPasswordAllowed && (
									<Field.Row justifyContent='end'>
										<Field.Link
											href='#'
											onClick={(e): void => {
												e.preventDefault();
												setLoginRoute('reset-password');
											}}
										>
											<Trans i18nKey='registration_page_login_forgot'>Forgot your password?</Trans>
										</Field.Link>
									</Field.Row>
								)}
							</Field>
						</FieldGroup>
						<FieldGroup disabled={loginMutation.isLoading}>
							{errorOnSubmit === 'error-user-is-not-activated' && (
								<Callout type='warning'>{t('registration_page_registration_waitActivationWarning')}</Callout>
							)}

							{errorOnSubmit === 'error-app-user-is-not-allowed-to-login' && (
								<Callout type='danger'>{t('registration_page_login_errors_AppUserNotAllowedToLogin')}</Callout>
							)}

							{errorOnSubmit === 'user-not-found' && (
								<Callout type='danger'>{t('registration_page_login_errors_wrongCredentials')}</Callout>
							)}

							{errorOnSubmit === 'error-login-blocked-for-ip' && (
								<Callout type='danger'>{t('registration_page_login_errors_loginBlockedForIp')}</Callout>
							)}

							{errorOnSubmit === 'error-login-blocked-for-user' && (
								<Callout type='danger'>{t('registration_page_login_errors_loginBlockedForUser')}</Callout>
							)}

							{errorOnSubmit === 'error-license-user-limit-reached' && (
								<Callout type='warning'>{t('registration_page_login_errors_licenseUserLimitReached')}</Callout>
							)}
						</FieldGroup>
					</Form.Container>
					<Form.Footer>
						<ButtonGroup stretch>
							<Button disabled={loginMutation.isLoading} type='submit' primary>
								{t('registration_component_login')}
							</Button>
						</ButtonGroup>
						<p>
							<Trans i18nKey='registration_page_login_register'>
								New here? <ActionLink onClick={(): void => setLoginRoute('register')}>Create an account</ActionLink>
							</Trans>
						</p>
					</Form.Footer>
				</>
			)}
			<LoginServices disabled={loginMutation.isLoading} setError={setErrorOnSubmit} />
		</Form>
	);
};

export default LoginForm;
