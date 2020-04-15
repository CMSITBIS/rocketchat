import React, { useState } from 'react';
import { TextInput, TextAreaInput, Field, FieldGroup, CheckBox, Button, Icon, ButtonGroup } from '@rocket.chat/fuselage';

import { useTranslation } from '../../../../../client/contexts/TranslationContext';
import { Page } from '../../../../../client/components/basic/Page';
import { isEmail } from '../../../../utils/lib/isEmail.js';
import { isJSON } from '../../../../utils/lib/isJSON.js';

export function Mailer({ sendMail = () => {}, ...props }) {
	const t = useTranslation();

	const [fromEmail, setFromEmail] = useState({ value: '', error: false });
	const [dryRun, setDryRun] = useState(false);
	const [query, setQuery] = useState({ value: '', error: false });
	const [subject, setSubject] = useState('');
	const [emailBody, setEmailBody] = useState('');

	return <Page _id='mailer' {...props}>
		<Page.Header title={t('Mailer')}></Page.Header>
		<Page.ContentShadowScroll maxWidth='x600' alignSelf='center' display='flex' flexDirection='column'>
			<FieldGroup is='form' method='post'>
				<Field>
					<Field.Label>{t('From')}</Field.Label>
					<Field.Row>
						<TextInput
							id='fromEmail'
							placeholder={t('Type_your_email')}
							value={fromEmail.value}
							error={fromEmail.error}
							onChange={(e) => {
								setFromEmail({
									value: e.currentTarget.value,
									error: !isEmail(e.currentTarget.value),
								});
							}}
						/>
					</Field.Row>
				</Field>
				<Field>
					<Field.Row>
						<CheckBox
							id='dryRun'
							checked={dryRun}
							onChange={() => setDryRun(!dryRun)}
						/>
						<Field.Label htmlFor='dry-run'>
							{t('Dry_run')}
						</Field.Label>
					</Field.Row>
					<Field.Hint>{t('Dry_run_description')}</Field.Hint>
				</Field>
				<Field>
					<Field.Label>{t('Query')}</Field.Label>
					<Field.Row>
						<TextInput id='query'
							value={query.value}
							error={query.error}
							onChange={(e) => {
								setQuery({
									value: e.currentTarget.value,
									error: e.currentTarget.value && !isJSON(e.currentTarget.value),
								});
							}}
						/>
					</Field.Row>
					<Field.Hint>{t('Query_description')}</Field.Hint>
				</Field>
				<Field>
					<Field.Label>{t('Subject')}</Field.Label>
					<Field.Row>
						<TextInput
							id='subject'
							value={subject.value}
							error={subject.error}
							onChange={(e) => {
								setSubject(e.currentTarget.value);
							}}
						/>
					</Field.Row>
				</Field>
				<Field>
					<Field.Label>{t('Email_body')}</Field.Label>
					<Field.Row>
						<TextAreaInput
							id='emailBody'
							rows={10}
							value={emailBody}
							onChange={(e) => setEmailBody(e.currentTarget.value)}
						/>
					</Field.Row>
					<Field.Hint dangerouslySetInnerHTML={{ __html: t('Mailer_body_tags') }}></Field.Hint>
				</Field>
				<ButtonGroup align='end'>
					<Button primary onClick={() => { sendMail({ fromEmail, dryRun, query, subject, emailBody }); }}><Icon name='send' size='x20' mie='x8'/>{t('Send_email')}</Button>
				</ButtonGroup>
			</FieldGroup>
		</Page.ContentShadowScroll>
	</Page>;
}
