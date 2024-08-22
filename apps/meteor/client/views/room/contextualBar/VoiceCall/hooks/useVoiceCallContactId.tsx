import type { VoiceCallSession } from '../../../../../lib/voip/definitions';
import { useVoiceCallExtensionDetails } from './useVoiceCallExtensionDetails';

export const useVoiceCallContactId = ({ session, transferEnabled = true }: { session: VoiceCallSession; transferEnabled?: boolean }) => {
	const { data: contact, isInitialLoading: isLoading } = useVoiceCallExtensionDetails({ extension: session.contact.id });
	const { data: transferedByContact } = useVoiceCallExtensionDetails({
		extension: session.transferedBy?.id,
		enabled: transferEnabled,
	});

	const getContactName = (data: ReturnType<typeof useVoiceCallExtensionDetails>['data'], defaultValue?: string) => {
		const { name, username = '', callerName, callerNumber, extension } = data || {};
		return name || callerName || username || callerNumber || extension || defaultValue || '';
	};

	const name = getContactName(contact, session.contact.id);
	const transferedBy = getContactName(transferedByContact, transferEnabled ? session.transferedBy?.id : '');

	return {
		name,
		username: contact?.username,
		transferedBy,
		isLoading,
	};
};
