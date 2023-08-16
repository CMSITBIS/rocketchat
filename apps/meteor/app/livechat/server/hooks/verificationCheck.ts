import { OmnichannelVerification } from '@rocket.chat/core-services';
import type { IRoom, IMessage } from '@rocket.chat/core-typings';
import { RoomVerificationState, isOmnichannelRoom } from '@rocket.chat/core-typings';
import { LivechatRooms, Users } from '@rocket.chat/models';

import { callbacks } from '../../../../lib/callbacks';
import { i18n } from '../../../../server/lib/i18n';
import { sendMessage } from '../../../lib/server/functions/sendMessage';

callbacks.add(
	'afterSaveMessage',
	async (message: IMessage, room: IRoom) => {
		if (!isOmnichannelRoom(room) || message.u._id !== room.v._id) {
			return;
		}

		switch (room.verificationStatus) {
			case RoomVerificationState.isListeningToEmail: {
				const result = await OmnichannelVerification.setVisitorEmail(room, message.msg);
				if (!result.success) {
					return;
				}
				await LivechatRooms.updateVerificationStatusById(room._id, RoomVerificationState.unVerified);
				await OmnichannelVerification.initiateVerificationProcess(room._id);
				break;
			}
			case RoomVerificationState.isListeningToOTP: {
				const bot = await Users.findOneById('rocket.cat');
				if (message.msg === 'Resend OTP') {
					if (room.source.type === 'widget') {
						const wrongOtpInstructionsMessage = {
							msg: i18n.t('Visitor_Widget_Verification_Process_Resend_OTP'),
							groupable: false,
						};
						await sendMessage(bot, wrongOtpInstructionsMessage, room);
					} else if (room.source.type === 'app') {
						const resendOTPText = i18n.t('Visitor_App_Verification_Process_Resend_OTP');
						await OmnichannelVerification.createLivechatMessage(room, resendOTPText);
					}
					await OmnichannelVerification.sendVerificationCodeToVisitor(room.v._id, room);
					await LivechatRooms.updateWrongMessageCount(room._id, 0);
					return;
				}
				const result = await OmnichannelVerification.verifyVisitorCode(room, message.msg);
				if (!result) {
					return;
				}
				await LivechatRooms.updateVerificationStatusById(room._id, RoomVerificationState.verified);
				const completionMessage = {
					msg: i18n.t('Visitor_Verification_Process_Completed'),
					groupable: false,
				};
				await sendMessage(bot, completionMessage, room);
				break;
			}
		}
	},
	callbacks.priority.HIGH,
	'verificationCheck',
);
