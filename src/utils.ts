function convertToK(value: string) {
	return `${(parseFloat(value) / 1000).toFixed(2)}K`;
}

export { convertToK };
