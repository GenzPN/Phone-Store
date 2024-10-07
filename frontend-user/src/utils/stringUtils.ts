export const formatProductNameForUrl = (name: string | null | undefined): string => {
    return name ? name.toLowerCase().replace(/\s+/g, '-') : '';
};

export const unformatProductNameFromUrl = (urlName: string): string => {
    return urlName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};