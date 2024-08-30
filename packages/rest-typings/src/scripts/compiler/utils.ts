export function getFormattedFilename(path: string): string {
	const parts = path.split('/');
	const filenameWithExtension = parts.pop();

	if (!filenameWithExtension || (!filenameWithExtension.includes('.ts') ?? false)) {
		console.error('No fileName Found');
		return '';
	}
	const filename = filenameWithExtension.replace(/\.[^/.]+$/, ' Endpoints');

	return filename.toUpperCase();
}
