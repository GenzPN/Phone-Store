export const formatProductNameForUrl = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

export const unformatProductNameFromUrl = (urlName: string): string => {
    return urlName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};