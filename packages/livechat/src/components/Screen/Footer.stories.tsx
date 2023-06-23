import { action } from '@storybook/addon-actions';
import type { ComponentMeta, ComponentStory } from '@storybook/react';
import i18next from 'i18next';

import { Screen } from '.';
import { screenDecorator } from '../../helpers.stories';
import { FooterOptions } from '../Footer';
import Menu from '../Menu';

export default {
	title: 'Components/Screen/Footer',
	component: Screen.Footer,
	decorators: [
		(storyFn) => (
			<Screen
				theme={{
					color: '',
					fontColor: '',
					iconColor: '',
				}}
				title={'Title'}
				notificationsEnabled={true}
				minimized={false}
				expanded={false}
				windowed={false}
				onEnableNotifications={action('enableNotifications')}
				onDisableNotifications={action('disableNotifications')}
				onMinimize={action('minimize')}
				onRestore={action('restore')}
				onOpenWindow={action('openWindow')}
			>
				<Screen.Content />
				{storyFn()}
			</Screen>
		),
		screenDecorator,
	],
	parameters: {
		layout: 'centered',
	},
} satisfies ComponentMeta<typeof Screen.Footer>;

export const Empty: ComponentStory<typeof Screen.Footer> = () => <Screen.Footer />;
Empty.storyName = 'empty';

export const WithChildren: ComponentStory<typeof Screen.Footer> = () => (
	<Screen.Footer>Lorem ipsum dolor sit amet, his id atqui repudiare.</Screen.Footer>
);
WithChildren.storyName = 'with children';

export const WithOptions: ComponentStory<typeof Screen.Footer> = () => (
	<Screen.Footer
		options={
			<FooterOptions>
				<Menu.Group>
					<Menu.Item onClick={action('changeDepartment')}>{i18next.t('change_department')}</Menu.Item>
					<Menu.Item onClick={action('removeUserData')}>{i18next.t('forget_remove_my_data')}</Menu.Item>
					<Menu.Item danger onClick={action('finishChat')}>
						{i18next.t('finish_this_chat')}
					</Menu.Item>
				</Menu.Group>
			</FooterOptions>
		}
	/>
);
WithOptions.storyName = 'with options';
