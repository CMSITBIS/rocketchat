import { Markdown } from '../../../markdown/server';

export const parseUrlsInMessage = (message) => {
	if (message.parseUrls === false) {
		return message;
	}

	message.html = message.msg;
	message = Markdown.code(message);

	const urls =
		message.html.match(
			/(\s)(?<!<)([A-Za-z]{3,9}):\/\/([-;:&=\+\$,\w]+@{1})?([-A-Za-z0-9\.]+)+:?(\d+)?((\/[-\+=!:~%\/\.@\,\(\)\w]*)?\??([-\+=&!:;%@\/\.\,\w]+)?(?:#([^\s\)]+))?)?(?!>)/g
		) || [];

	if (urls) {
		message.urls = urls.map((url) => ({ url: url.trim() }));
	}

	message = Markdown.mountTokensBack(message, false);
	message.msg = message.html;
	delete message.html;
	delete message.tokens;

	return message;
};
